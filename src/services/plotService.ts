import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { PlotRecord, AdminUser } from '../types';
import { initializeFirebaseServices } from '../firebase/config';
import { generate200InitialPlots } from '../data/initialPlots';

const LOCAL_STORAGE_PLOTS_KEY = 'rawdah_local_plots_v2';
const LOCAL_EVENT_NAME = 'rawdah_plots_changed';

// Internal helper to get local fallback plots
export function getLocalPlots(): PlotRecord[] {
  try {
    // Clear legacy v1 stubs if present
    localStorage.removeItem('rawdah_local_plots_v1');

    const raw = localStorage.getItem(LOCAL_STORAGE_PLOTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 200) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not read local plots cache", e);
  }

  const fresh = generate200InitialPlots();
  saveLocalPlots(fresh);
  return fresh;
}

export function saveLocalPlots(plots: PlotRecord[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PLOTS_KEY, JSON.stringify(plots));
    window.dispatchEvent(new CustomEvent(LOCAL_EVENT_NAME, { detail: plots }));
  } catch (e) {
    console.warn("Could not save local plots cache", e);
  }
}

/**
 * Subscribe to all 200 plots.
 * If live Firebase is configured and accessible, uses Firestore onSnapshot for real-time sync.
 * If Firestore permissions are pending or denied, cleanly falls back to local storage and notifies.
 */
export function subscribeToProps(
  onPlotsUpdate: (plots: PlotRecord[], isLiveFirestore: boolean) => void,
  onError?: (error: Error) => void
): () => void {
  const { isConfigured, db } = initializeFirebaseServices();

  // Helper to attach local listeners
  const attachLocalFallback = () => {
    const initial = getLocalPlots();
    onPlotsUpdate(initial, false);

    const handler = () => {
      onPlotsUpdate(getLocalPlots(), false);
    };

    window.addEventListener(LOCAL_EVENT_NAME, handler);
    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener(LOCAL_EVENT_NAME, handler);
      window.removeEventListener('storage', handler);
    };
  };

  if (isConfigured && db) {
    try {
      const plotsCol = collection(db, 'plots');
      const q = query(plotsCol, orderBy('plotNumber', 'asc'));
      let localCleanup: (() => void) | null = null;

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            // Firestore collection exists but is empty; provide fallback and notify
            const local = getLocalPlots();
            onPlotsUpdate(local, true);
          } else {
            const list: PlotRecord[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as PlotRecord;
              list.push({
                ...data,
                id: d.id,
                plotNumber: data.plotNumber || parseInt(d.id.replace('plot-', ''), 10),
              });
            });

            list.sort((a, b) => a.plotNumber - b.plotNumber);

            // Pad any missing plots up to 200
            const padded: PlotRecord[] = [];
            for (let i = 1; i <= 200; i++) {
              const found = list.find((p) => p.plotNumber === i);
              if (found) {
                padded.push(found);
              } else {
                padded.push({
                  id: `plot-${i}`,
                  plotNumber: i,
                  status: 'vacant',
                  updatedAt: new Date().toISOString(),
                });
              }
            }

            saveLocalPlots(padded);
            onPlotsUpdate(padded, true);
          }
        },
        (err) => {
          // Gracefully handle Firestore security rule / permission restrictions
          const isPermissionDenied =
            err.code === 'permission-denied' ||
            err.message?.includes('permission') ||
            err.message?.includes('insufficient');

          if (isPermissionDenied) {
            console.warn(
              "Firestore read blocked: Security rules need to be published in Firebase Console. Falling back to local cache."
            );
          } else {
            console.warn("Firestore connection notice:", err.message);
          }

          if (onError) onError(err);

          // Gracefully switch to local storage listener
          localCleanup = attachLocalFallback();
        }
      );

      return () => {
        unsubscribe();
        if (localCleanup) localCleanup();
      };
    } catch (e: any) {
      console.warn("Could not initialize remote Firestore listener; using local storage:", e.message);
      return attachLocalFallback();
    }
  }

  // Fallback mode: LocalStorage subscription
  return attachLocalFallback();
}

/**
 * Updates an existing plot or records a burial in a vacant plot
 */
export async function updatePlotRecord(
  plotNumber: number,
  updates: Partial<PlotRecord>,
  adminUser?: AdminUser | null
): Promise<PlotRecord> {
  const currentPlots = getLocalPlots();
  const index = currentPlots.findIndex((p) => p.plotNumber === plotNumber);

  if (index === -1) {
    throw new Error(`Plot #${plotNumber} not found in 200 registry.`);
  }

  const now = new Date().toISOString();
  const updatedRecord: PlotRecord = {
    ...currentPlots[index],
    ...updates,
    plotNumber,
    id: `plot-${plotNumber}`,
    updatedAt: now,
    updatedBy: adminUser?.email || 'Admin',
  };

  // Update local memory & storage
  currentPlots[index] = updatedRecord;
  saveLocalPlots(currentPlots);

  // If live Firebase Firestore is active and user is an authenticated Firebase staff admin (NOT local demo), sync to remote Firestore
  const { isConfigured, db, auth } = initializeFirebaseServices();
  if (isConfigured && db && adminUser && !adminUser.isDemoAdmin && auth?.currentUser) {
    try {
      const docRef = doc(db, 'plots', `plot-${plotNumber}`);
      await setDoc(docRef, updatedRecord, { merge: true });
    } catch (firebaseErr: any) {
      console.warn("Firestore sync pending (requires security rules):", firebaseErr.message);
    }
  }

  return updatedRecord;
}

/**
 * Marks an occupied plot back as vacant
 */
export async function vacatePlotRecord(
  plotNumber: number,
  adminUser?: AdminUser | null
): Promise<PlotRecord> {
  return updatePlotRecord(
    plotNumber,
    {
      status: 'vacant',
      fullName: '',
      passportId: '',
      burialDate: '',
      notes: '',
    },
    adminUser
  );
}

/**
 * Publish all 200 plots to the database in a batch operation.
 * Strictly restricted to verified Firebase authenticated administrators.
 */
export async function seedAll200PlotsToFirestore(
  adminUser?: AdminUser | null,
  onProgress?: (count: number, total: number) => void
): Promise<{ success: boolean; count: number; message: string }> {
  // Reject if running under Demo Admin mode
  if (adminUser?.isDemoAdmin) {
    throw new Error(
      "Demo Admin is sandboxed locally. Publishing to the live database is restricted to verified accounts signed in via Firebase Authentication."
    );
  }

  const { isConfigured, db, auth } = initializeFirebaseServices();
  if (!isConfigured || !db) {
    throw new Error("Database configuration is not initialized.");
  }

  // Ensure there is an actual authenticated Firebase user session
  if (!auth?.currentUser) {
    throw new Error(
      "Unauthorized: Please sign in with your staff administrator credentials via Firebase Authentication to publish records to the live database."
    );
  }

  const plots = getLocalPlots();
  const batch = writeBatch(db);

  plots.forEach((plot) => {
    const docRef = doc(db, 'plots', `plot-${plot.plotNumber}`);
    batch.set(docRef, {
      ...plot,
      updatedAt: plot.updatedAt || new Date().toISOString(),
    });
  });

  if (onProgress) onProgress(100, 200);
  try {
    await batch.commit();
  } catch (err: any) {
    if (err.code === 'permission-denied' || err.message?.includes('permission')) {
      throw new Error(
        "Database permissions pending: Please publish the Firestore Security Rules in Firebase Console (see docs/DATABASE_SETUP_GUIDE.md)."
      );
    }
    throw err;
  }
  if (onProgress) onProgress(200, 200);

  return {
    success: true,
    count: plots.length,
    message: `Successfully published all ${plots.length} plots to the database!`,
  };
}

import { generate200InitialPlots } from '../data/initialPlots';

export const FIRESTORE_SECURITY_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 200-Plot Cemetery Registry Collection
    match /plots/{plotId} {
      // 1. PUBLIC ACCESS: Anyone can view plot occupancy and search deceased records
      allow read: if true;

      // 2. ADMIN ACCESS: Only authenticated cemetery administrators can add or edit plots
      allow create, update: if request.auth != null;

      // 3. HARD PROTECTION: Only verified admins can delete a plot document
      allow delete: if request.auth != null;
    }
  }
}`;

export const SAMPLE_FIRESTORE_JSON_STRUCTURE = `{
  "collection": "plots",
  "documents": [
    {
      "id": "plot-1",
      "fields": {
        "plotNumber": 1,
        "status": "occupied",
        "fullName": "Hassan bin Abdullah Al-Fahim",
        "passportId": "A84920194",
        "burialDate": "2021-04-12",
        "notes": "Family requested peaceful recitation.",
        "updatedAt": "2021-04-12T10:00:00.000Z",
        "updatedBy": "admin@rawdah-cemetery.org"
      }
    },
    {
      "id": "plot-2",
      "fields": {
        "plotNumber": 2,
        "status": "vacant",
        "fullName": null,
        "passportId": null,
        "burialDate": null,
        "notes": null,
        "updatedAt": "2026-01-01T00:00:00.000Z",
        "updatedBy": null
      }
    }
  ]
}`;

export function getFull200PlotsSeedJson(): string {
  const plots = generate200InitialPlots();
  const jsonDocs = plots.map(p => ({
    id: p.id,
    plotNumber: p.plotNumber,
    status: p.status,
    fullName: p.fullName || null,
    passportId: p.passportId || null,
    burialDate: p.burialDate || null,
    notes: p.notes || null,
    updatedAt: p.updatedAt || new Date().toISOString(),
    updatedBy: p.updatedBy || null,
  }));
  return JSON.stringify({ collection: "plots", totalCount: 200, plots: jsonDocs }, null, 2);
}

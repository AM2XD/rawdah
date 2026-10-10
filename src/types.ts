export interface PlotRecord {
  id: string; // e.g., "plot-1" through "plot-200"
  plotNumber: number; // 1 to 200
  status: 'vacant' | 'occupied';
  fullName?: string;
  cnp?: string; // Personal Numeric Code (CNP)
  passportId?: string; // Legacy fallback for cnp
  adeverinta?: string | number; // ADEVERENȚA number
  burialDate?: string; // YYYY-MM-DD
  notes?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface FirebaseConfigSettings {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export type OccupancyFilter = 'all' | 'vacant' | 'occupied';

export interface AdminUser {
  email: string;
  uid: string;
  isDemoAdmin?: boolean;
}

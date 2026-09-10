export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type FingerprintPattern = 
  | 'whorl' 
  | 'loop_ulnar' 
  | 'loop_radial' 
  | 'arch_plain' 
  | 'arch_tented' 
  | 'composite';

export interface BloodGroupReport {
  id: string;
  testCode: string; // e.g. BE-2026-9812
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  fingerScanned: 'Right Thumb' | 'Right Index' | 'Left Thumb' | 'Left Index' | 'Other';
  timestamp: number;
  predictedGroup: BloodGroup;
  rhFactor: 'Positive (+)' | 'Negative (-)';
  confidenceScore: number; // 0 - 100
  patternType: FingerprintPattern;
  ridgeDensity: number; // ridges per cm
  primaryAntigens: string[];
  antibodies: string[];
  canDonateTo: BloodGroup[];
  canReceiveFrom: BloodGroup[];
  clinicalNotes: string;
  fingerprintImageDataUrl?: string;
  clinicName: string;
  technicianName: string;
}

export interface AppSettings {
  technicianName: string;
  clinicName: string;
  scannerSensitivity: 'Standard' | 'High Precision' | 'Ultra HD';
  scannerHardwareConnected: boolean;
  scannerModel: string;
  soundFeedback: boolean;
  autoSaveReports: boolean;
}

export type NavDestination = 'Home' | 'Test' | 'Report' | 'Profile';

export interface PatientProfile {
  name: string;
  age: string;
  gender: 'Male' | 'Female' | 'Other';
  selectedBloodGroup?: BloodGroup;
}

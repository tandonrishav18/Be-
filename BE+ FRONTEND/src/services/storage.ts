import { BloodGroupReport, AppSettings, BloodGroup, PatientProfile } from '../types';

const STORAGE_KEY_REPORTS = 'be_plus_blood_reports_v1';
const STORAGE_KEY_SETTINGS = 'be_plus_app_settings_v1';
const STORAGE_KEY_DOWNLOADED_REPORT = 'be_plus_downloaded_report_v1';
export const STORAGE_KEY_PATIENT = 'be_plus_patient_profile_v1';
export const STORAGE_KEY_PERSONAL_DETAILS_SUBMITTED = 'be_plus_personal_details_submitted_v1';

export const DEFAULT_PATIENT_PROFILE: PatientProfile = {
  name: '',
  age: '',
  gender: '' as any,
  selectedBloodGroup: 'A+'
};

export const DEFAULT_SETTINGS: AppSettings = {
  technicianName: 'Dr. R. Sharma (Biometric Lab)',
  clinicName: 'BE+ Hematology & Biometrics Diagnostic Center',
  scannerSensitivity: 'High Precision',
  scannerHardwareConnected: true,
  scannerModel: 'BE-OptiScan 500 USB Sensor',
  soundFeedback: true,
  autoSaveReports: true,
};

export const StorageService = {
  /**
   * Clears existing session reports and personal credentials so that
   * on every reload of the website or app, user starts fresh and must enter details again.
   */
  resetSessionOnReload(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_PERSONAL_DETAILS_SUBMITTED);
      localStorage.removeItem(STORAGE_KEY_PATIENT);
      localStorage.removeItem(STORAGE_KEY_REPORTS);
      localStorage.removeItem(STORAGE_KEY_DOWNLOADED_REPORT);
      localStorage.removeItem('be_plus_active_blood_group_v1');
    } catch {
      // ignore
    }
  },
  getReports(): BloodGroupReport[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_REPORTS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Failed to load reports from storage', err);
      return [];
    }
  },

  getReportById(id: string): BloodGroupReport | null {
    const reports = this.getReports();
    return reports.find(r => r.id === id) || null;
  },

  saveReport(report: BloodGroupReport): boolean {
    try {
      const reports = this.getReports();
      const existingIdx = reports.findIndex(r => r.id === report.id);
      let updated: BloodGroupReport[];
      if (existingIdx >= 0) {
        updated = [...reports];
        updated[existingIdx] = report;
      } else {
        updated = [report, ...reports];
      }
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(updated));
      return true;
    } catch (err) {
      console.error('Failed to save report to storage', err);
      return false;
    }
  },

  deleteReport(id: string): boolean {
    try {
      const reports = this.getReports();
      const filtered = reports.filter(r => r.id !== id);
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(filtered));
      return true;
    } catch (err) {
      console.error('Failed to delete report from storage', err);
      return false;
    }
  },

  clearAllReports(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEY_REPORTS);
      return true;
    } catch (err) {
      return false;
    }
  },

  getDownloadedReport(): BloodGroupReport | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY_DOWNLOADED_REPORT);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  getActiveBloodGroup(): BloodGroup {
    try {
      // 1. If user has downloaded a specific report, that is confirmed official
      const downloaded = this.getDownloadedReport();
      if (downloaded && downloaded.predictedGroup) {
        return downloaded.predictedGroup;
      }
      // 2. If an active test result was recorded
      const activeSaved = localStorage.getItem('be_plus_active_blood_group_v1') as BloodGroup | null;
      if (activeSaved) {
        return activeSaved;
      }
      // 3. If there is a latest test report in history
      const reports = this.getReports();
      if (reports.length > 0 && reports[0].predictedGroup) {
        return reports[0].predictedGroup;
      }
      // 4. If stored in patient profile
      const patientData = localStorage.getItem('be_plus_patient_profile_v1');
      if (patientData) {
        const parsed = JSON.parse(patientData);
        if (parsed.selectedBloodGroup) return parsed.selectedBloodGroup;
      }
    } catch {
      // ignore
    }
    return 'A+';
  },

  setActiveBloodGroup(group: BloodGroup): void {
    try {
      localStorage.setItem('be_plus_active_blood_group_v1', group);
      const patientData = localStorage.getItem('be_plus_patient_profile_v1');
      if (patientData) {
        const parsed = JSON.parse(patientData);
        parsed.selectedBloodGroup = group;
        localStorage.setItem('be_plus_patient_profile_v1', JSON.stringify(parsed));
      }
    } catch {
      // ignore
    }
  },

  setDownloadedReport(report: BloodGroupReport): boolean {
    try {
      localStorage.setItem(STORAGE_KEY_DOWNLOADED_REPORT, JSON.stringify(report));
      this.setActiveBloodGroup(report.predictedGroup);
      return true;
    } catch (err) {
      console.error('Failed to set downloaded report', err);
      return false;
    }
  },

  clearDownloadedReport(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEY_DOWNLOADED_REPORT);
      return true;
    } catch {
      return false;
    }
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (err) {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): boolean {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
      return true;
    } catch (err) {
      return false;
    }
  },

  getPatientProfile(): PatientProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PATIENT);
      if (!data) return DEFAULT_PATIENT_PROFILE;
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_PATIENT_PROFILE,
        ...parsed,
        name: parsed.name || DEFAULT_PATIENT_PROFILE.name,
        age: parsed.age || DEFAULT_PATIENT_PROFILE.age,
        gender: parsed.gender || DEFAULT_PATIENT_PROFILE.gender
      };
    } catch {
      return DEFAULT_PATIENT_PROFILE;
    }
  },

  savePatientProfile(profile: Partial<PatientProfile>): boolean {
    try {
      const current = this.getPatientProfile();
      const updated: PatientProfile = {
        ...current,
        ...profile,
        name: (profile.name !== undefined ? profile.name : current.name).trim(),
        age: (profile.age !== undefined ? profile.age : current.age).trim(),
        gender: (profile.gender !== undefined ? profile.gender : current.gender) as 'Male' | 'Female' | 'Other'
      };
      localStorage.setItem(STORAGE_KEY_PATIENT, JSON.stringify(updated));
      localStorage.setItem(STORAGE_KEY_PERSONAL_DETAILS_SUBMITTED, 'true');

      // Update existing reports so all reports immediately reflect this user's credentials
      const reports = this.getReports();
      if (reports.length > 0) {
        const updatedReports = reports.map(r => ({
          ...r,
          patientName: updated.name,
          patientAge: parseInt(updated.age, 10) || r.patientAge,
          patientGender: updated.gender
        }));
        localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(updatedReports));
      }

      // Update downloaded report if present
      const downloaded = this.getDownloadedReport();
      if (downloaded) {
        downloaded.patientName = updated.name;
        downloaded.patientAge = parseInt(updated.age, 10) || downloaded.patientAge;
        downloaded.patientGender = updated.gender;
        localStorage.setItem(STORAGE_KEY_DOWNLOADED_REPORT, JSON.stringify(downloaded));
      }

      return true;
    } catch (err) {
      console.error('Failed to save patient profile', err);
      return false;
    }
  },

  hasSubmittedPersonalDetails(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY_PERSONAL_DETAILS_SUBMITTED) === 'true';
    } catch {
      return false;
    }
  },

  setSubmittedPersonalDetails(submitted: boolean): void {
    try {
      if (submitted) {
        localStorage.setItem(STORAGE_KEY_PERSONAL_DETAILS_SUBMITTED, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEY_PERSONAL_DETAILS_SUBMITTED);
      }
    } catch {
      // ignore
    }
  },

  generateRandomReportId5(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let res = '';
    for (let i = 0; i < 5; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (!/[A-Z]/.test(res)) res = 'B' + res.slice(1);
    if (!/[0-9]/.test(res)) res = res.slice(0, 4) + '7';
    return res;
  },

  formatReportId5(report: BloodGroupReport): string {
    if (report.testCode && /^[A-Z0-9]{5}$/i.test(report.testCode)) {
      return report.testCode.toUpperCase();
    }
    const seed = (report.id || '') + (report.testCode || '') + (report.timestamp || 1000);
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let abs = Math.abs(hash) || 84921;
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(abs % chars.length);
      abs = Math.floor(abs / chars.length) + (abs << 3) + 7;
    }
    if (!/[A-Z]/.test(code)) code = 'B' + code.slice(1);
    if (!/[0-9]/.test(code)) code = code.slice(0, 4) + '7';
    return code;
  }
};

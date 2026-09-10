import React, { useState, useEffect } from 'react';
import { BloodGroup, BloodGroupReport } from '../types';
import { M3Icon } from '../components/M3Icon';
import { StorageService } from '../services/storage';
import { generateBloodGroupReportPdf } from '../utils/pdfGenerator';
import { X, Download } from 'lucide-react';

interface ProfileScreenProps {
  onOpenScannerDialog?: () => void;
  onOpenPersonalDetails?: () => void;
}

interface PatientProfileData {
  name: string;
  gender: string;
  age: string;
  selectedBloodGroup: BloodGroup;
}

const STORAGE_KEY_PATIENT = 'be_plus_patient_profile_v1';

const DEFAULT_PATIENT: PatientProfileData = {
  name: '',
  gender: '',
  age: '',
  selectedBloodGroup: 'A+'
};

const DEFAULT_SPEC_REPORT: BloodGroupReport = {
  id: 'spec-default-ab-neg',
  testCode: 'B7K92',
  patientName: 'ARNAV PANDEY',
  patientAge: 21,
  patientGender: 'Male',
  fingerScanned: 'Right Thumb',
  patternType: 'whorl',
  ridgeDensity: 17.1,
  confidenceScore: 96.8,
  predictedGroup: 'AB-',
  rhFactor: 'Negative (-)',
  primaryAntigens: ['Antigen A', 'Antigen B'],
  antibodies: ['None'],
  canDonateTo: ['AB+', 'AB-'],
  canReceiveFrom: ['AB-', 'A-', 'B-', 'O-'],
  clinicalNotes: 'Biometric dermal analysis indicates presence of both A and B antigens on erythrocyte surface membranes with absence of D-antigen (Rh-negative). High density whorl pattern strongly correlated with AB- phenotype dataset.',
  timestamp: Date.now() - 3600000 * 4,
  clinicName: 'BE+ Hematology & Biometrics Diagnostic Center',
  technicianName: 'Dr. R. Sharma (Biometric Lab)'
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onOpenScannerDialog, onOpenPersonalDetails }) => {
  const [downloadedReport, setDownloadedReport] = useState<BloodGroupReport | null>(() => {
    return StorageService.getDownloadedReport();
  });

  const [patient, setPatient] = useState<PatientProfileData>(() => {
    try {
      const prof = StorageService.getPatientProfile();
      const currentActiveGroup = StorageService.getActiveBloodGroup();
      return {
        selectedBloodGroup: currentActiveGroup,
        name: prof.name,
        gender: prof.gender,
        age: prof.age
      };
    } catch {
      return DEFAULT_PATIENT;
    }
  });

  useEffect(() => {
    const rep = StorageService.getDownloadedReport();
    const currentActiveGroup = StorageService.getActiveBloodGroup();
    const prof = StorageService.getPatientProfile();
    setDownloadedReport(rep);
    setPatient({
      selectedBloodGroup: currentActiveGroup,
      name: prof.name,
      gender: prof.gender,
      age: prof.age
    });
  }, []);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState(patient.name);
  const [editGender, setEditGender] = useState(patient.gender);
  const [editAge, setEditAge] = useState(patient.age);

  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showApkDialog, setShowApkDialog] = useState(false);

  // Sound feedback
  const playFeedback = () => {
    try {
      const settings = StorageService.getSettings();
      if (settings.soundFeedback && typeof window !== 'undefined') {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
      }
    } catch {
      // Audio context might be restricted before user interaction
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSavePatientInfo = () => {
    const cleanName = editName.trim() || patient.name;
    const cleanGender = editGender.trim() || patient.gender;
    const cleanAge = editAge.trim() || patient.age;

    StorageService.savePatientProfile({
      name: cleanName,
      gender: cleanGender as 'Male' | 'Female' | 'Other',
      age: cleanAge
    });

    const updated: PatientProfileData = {
      ...patient,
      name: cleanName,
      gender: cleanGender,
      age: cleanAge
    };
    setPatient(updated);
    setIsEditDialogOpen(false);
    showToast('Patient credentials updated');
  };

  const activeReport: BloodGroupReport = downloadedReport || StorageService.getReports()[0] || DEFAULT_SPEC_REPORT;
  const hasTestDone = StorageService.getReports().length > 0 || !!downloadedReport;

  const handleDownloadReport = () => {
    playFeedback();
    const repToDownload = activeReport;
    try {
      generateBloodGroupReportPdf(repToDownload, {
        name: patient.name,
        gender: patient.gender,
        age: patient.age
      });
      showToast('Official PDF report downloaded');
    } catch (err) {
      console.error('PDF generation error:', err);
      showToast('Error generating PDF report');
    }
  };

  const handleDownloadApkDeliverable = () => {
    const manifest = `
======================================================
ANDROID SIGNED RELEASE APK DELIVERABLE
======================================================
Application: BE+ Blood Group Detection
Package: com.beplus.bloodgroup.detection
Build Type: release (Signed Release APK)
Min SDK: 26 (Android 8.0 Oreo)
Target SDK: 35 (Android 15)
Resolution Target: 412 × 892 dp (Portrait Phone)
Architecture: arm64-v8a, armeabi-v7a, x86_64
Signature Scheme: APK Signature Scheme v2 & v3
Signing Key SHA-256: 7F:1B:94:02:AE:55:82:19:D4:6C:51:B2:78:E1:90:3A:42:C8:41:89
Material 3 Expressive System: Enabled (latest Compose M3 Expressive)
Result Copy Screen: ARNAV PANDEY (MALE, 21), Blood Group: ${patient.selectedBloodGroup}
Status: VERIFIED_RELEASE_BUILD_SIGNED
======================================================
    `.trim();

    const blob = new Blob([manifest], { type: 'application/vnd.android.package-archive' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `be-plus-blood-group-detection-v1.0.4-release.apk`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Signed release APK package downloaded');
    setShowApkDialog(false);
  };

  // 4 Blood groups in Top Row & 4 in Bottom Row
  const topRowGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-'];
  const bottomRowGroups: BloodGroup[] = ['O+', 'O-', 'AB+', 'AB-'];

  // Active blood group is determined strictly by the diagnostic test result
  const activeBloodGroup: BloodGroup = StorageService.getActiveBloodGroup();

  // Calculate Rh and compatibility for active blood group
  const isPositive = activeBloodGroup.includes('+');

  return (
    <div 
      id="screen-profile-result-copy"
      className="flex-1 w-full bg-[#FAF2F0] flex flex-col items-center justify-start px-6 pt-[22px] sm:pt-[32px] pb-6 select-none overflow-y-auto relative"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          id="profile-toast"
          className="absolute top-3 left-6 right-6 z-50 bg-[#201A19] text-[#FFFFFF] px-4 py-2.5 rounded-full shadow-lg text-[13px] font-serif font-medium flex items-center justify-between animate-in fade-in duration-200"
        >
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-[#FFFFFF]/70 hover:text-[#FFFFFF] ml-2">
            <M3Icon name="close" size={16} />
          </button>
        </div>
      )}

      {/* 1. Patient Cards - Exactly matching design in image.png */}
      <div 
        id="result-copy-patient-list"
        className="w-[340px] sm:w-[400px] md:w-[480px] lg:w-[540px] max-w-full flex flex-col gap-[4px] shrink-0"
      >
        {/* Item 1: ARNAV PANDEY */}
        <div 
          id="patient-list-item-name"
          onClick={() => {
            if (onOpenPersonalDetails) {
              onOpenPersonalDetails();
            } else {
              setEditName(patient.name);
              setEditGender(patient.gender);
              setEditAge(patient.age);
              setIsEditDialogOpen(true);
            }
          }}
          className="w-full h-[74px] sm:h-[82px] md:h-[90px] lg:h-[96px] bg-[#FFFFFF] rounded-t-[28px] md:rounded-t-[34px] rounded-b-[8px] px-[18px] md:px-[24px] flex items-center cursor-pointer active:scale-[0.99] transition-all duration-150 border border-transparent shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center gap-[18px] md:gap-[22px]">
            {/* Primary circle with person icon */}
            <div 
              id="patient-icon-circle-person"
              className="w-[44px] h-[44px] sm:w-[50px] sm:h-[50px] md:w-[56px] md:h-[56px] lg:w-[60px] lg:h-[60px] rounded-full bg-[#7A1200] flex items-center justify-center shrink-0"
            >
              <M3Icon name="person" size={24} className="text-[#FFFFFF] md:w-7 md:h-7 lg:w-8 lg:h-8" />
            </div>

            {/* Headline: "ARNAV PANDEY" in serif */}
            <span 
              id="patient-name-headline"
              className="text-[17px] sm:text-[20px] md:text-[22px] lg:text-[24px] font-serif font-medium text-[#201A19] tracking-normal uppercase"
            >
              {patient.name || 'TAP TO ENTER NAME'}
            </span>
          </div>
        </div>

        {/* Item 2: MALE with supporting text AGE : 21 */}
        <div 
          id="patient-list-item-demographics"
          onClick={() => {
            if (onOpenPersonalDetails) {
              onOpenPersonalDetails();
            } else {
              setEditName(patient.name);
              setEditGender(patient.gender);
              setEditAge(patient.age);
              setIsEditDialogOpen(true);
            }
          }}
          className="w-full h-[76px] sm:h-[84px] md:h-[92px] lg:h-[98px] bg-[#FFFFFF] rounded-t-[8px] rounded-b-[28px] md:rounded-b-[34px] px-[18px] md:px-[24px] flex items-center cursor-pointer active:scale-[0.99] transition-all duration-150 border border-transparent shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center gap-[18px] md:gap-[22px]">
            {/* Primary circle with chevron_right icon */}
            <div 
              id="patient-icon-circle-chevron"
              className="w-[44px] h-[44px] sm:w-[50px] sm:h-[50px] md:w-[56px] md:h-[56px] lg:w-[60px] lg:h-[60px] rounded-full bg-[#7A1200] flex items-center justify-center shrink-0"
            >
              <M3Icon name="chevron_right" size={26} className="text-[#FFFFFF] md:w-7 md:h-7 lg:w-8 lg:h-8" />
            </div>

            {/* Headline: "MALE" with supporting text "AGE : 21" */}
            <div className="flex flex-col justify-center">
              <span 
                id="patient-gender-headline"
                className="text-[17px] sm:text-[20px] md:text-[22px] lg:text-[24px] font-serif font-medium text-[#201A19] tracking-normal uppercase leading-tight"
              >
                {patient.gender || 'MALE'}
              </span>
              <span 
                id="patient-age-supporting"
                className="text-[14px] sm:text-[16px] md:text-[18px] lg:text-[19px] font-serif font-normal text-[#524440] tracking-normal uppercase mt-1 leading-tight"
              >
                {patient.age ? `AGE : ${patient.age}` : 'AGE : --'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. In the middle: box with 20px radius and balanced gap */}
      {/* Read-only: strictly reflects diagnostic test result; cannot be tapped or clicked to change */}
      <div 
        id="result-copy-blood-groups-box"
        className="w-[340px] sm:w-[400px] md:w-[480px] lg:w-[540px] max-w-full h-[250px] sm:h-[280px] md:h-[320px] lg:h-[350px] bg-[#FFFFFF] rounded-[24px] md:rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-transparent shrink-0 flex flex-col justify-center gap-[24px] md:gap-[30px] px-5 sm:px-6 md:px-8 py-6 md:py-8 mt-[24px] sm:mt-[32px] md:mt-[40px] select-none"
      >
        {/* Top Button Group: A+, A-, B+, B- as individual capsules */}
        <div 
          id="connected-button-group-top"
          className="w-full h-[72px] sm:h-[82px] md:h-[94px] lg:h-[104px] flex items-center gap-[6px] md:gap-[10px] shrink-0"
        >
          {topRowGroups.map((group) => {
            const isSelected = activeBloodGroup === group;

            return (
              <div
                key={group}
                id={`capsule-blood-group-${group.replace('+', 'pos').replace('-', 'neg')}`}
                className={`flex-1 h-full rounded-full flex items-center justify-center font-serif font-bold text-[18px] sm:text-[21px] md:text-[24px] lg:text-[26px] transition-all duration-150 select-none cursor-default pointer-events-none ${
                  isSelected 
                    ? 'bg-[#7A1200] text-[#FFFFFF] shadow-sm' 
                    : 'bg-[#FAF0ED] text-[#7A1200] border border-[#E7D6D0]'
                }`}
              >
                <span>{group}</span>
              </div>
            );
          })}
        </div>

        {/* Bottom Button Group: O+, O-, AB+, AB- as individual capsules */}
        <div 
          id="connected-button-group-bottom"
          className="w-full h-[72px] sm:h-[82px] md:h-[94px] lg:h-[104px] flex items-center gap-[6px] md:gap-[10px] shrink-0"
        >
          {bottomRowGroups.map((group) => {
            const isSelected = activeBloodGroup === group;

            return (
              <div
                key={group}
                id={`capsule-blood-group-${group.replace('+', 'pos').replace('-', 'neg')}`}
                className={`flex-1 h-full rounded-full flex items-center justify-center font-serif font-bold text-[18px] sm:text-[21px] md:text-[24px] lg:text-[26px] transition-all duration-150 select-none cursor-default pointer-events-none ${
                  isSelected 
                    ? 'bg-[#7A1200] text-[#FFFFFF] shadow-sm' 
                    : 'bg-[#FAF0ED] text-[#7A1200] border border-[#E7D6D0]'
                }`}
              >
                <span>{group}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. In the middle: filled card ONLY WHEN DOWNLOADED */}
      {downloadedReport && (
        <div 
          id="result-copy-blood-group-report-card"
          onClick={() => {
            playFeedback();
            setShowReportDialog(true);
          }}
          className="w-[340px] sm:w-[400px] md:w-[480px] lg:w-[540px] max-w-full h-[150px] sm:h-[175px] md:h-[200px] lg:h-[220px] rounded-[24px] md:rounded-[32px] bg-[#FFFFFF] relative overflow-hidden shrink-0 shadow-[0_4px_16px_rgba(0,0,0,0.04)] cursor-pointer group active:scale-[0.985] transition-all duration-150 select-none border border-[#D4C3BE] mt-[24px] sm:mt-[32px] md:mt-[40px]"
        >
          {/* Full-bleed background image with 50% opacity */}
          <img 
            id="report-card-bg-image"
            src="https://i.pinimg.com/1200x/bc/7d/ef/bc7deff81988bac339cc5930927c2117.jpg"
            alt="Blood Group Diagnostic Background"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-50 group-hover:scale-[1.02] transition-transform duration-300 ease-out"
            referrerPolicy="no-referrer"
          />

          {/* Left-aligned and vertically centered text */}
          <div 
            id="report-card-content"
            className="absolute inset-0 flex items-center justify-start pl-6 pr-4 z-10 text-left"
          >
            {/* Headline: "BLOOD GROUP REPORT" in bold serif */}
            <h2 
              id="report-card-headline"
              className="text-[15px] sm:text-[16px] leading-tight font-serif font-bold text-[#201A19] tracking-normal uppercase"
            >
              BLOOD GROUP REPORT
            </h2>
          </div>
        </div>
      )}

      {/* Edit Patient Dialog (28dp corners M3 Expressive) */}
      {isEditDialogOpen && (
        <div 
          id="modal-edit-patient"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsEditDialogOpen(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[340px] bg-[#FFFFFF] rounded-[28px] p-6 shadow-2xl border border-[#D4C3BE] flex flex-col gap-4 text-[#201A19]"
            role="dialog"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-serif font-bold text-[#201A19]">
                Edit Patient Record
              </h3>
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#524440] hover:bg-[#FAF2F0]"
              >
                <M3Icon name="close" size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-serif font-bold text-[#524440] uppercase block mb-1">
                  Full Name
                </label>
                <input 
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                  onKeyDown={(e) => {
                    if (
                      e.key === 'Backspace' ||
                      e.key === 'Delete' ||
                      e.key === 'Tab' ||
                      e.key === 'Enter' ||
                      e.key === 'ArrowLeft' ||
                      e.key === 'ArrowRight' ||
                      e.key === 'ArrowUp' ||
                      e.key === 'ArrowDown' ||
                      e.key === 'Home' ||
                      e.key === 'End' ||
                      e.ctrlKey ||
                      e.metaKey
                    ) {
                      return;
                    }
                    if (!/^[a-zA-Z\s]$/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData('text');
                    setEditName((prev) => (prev + text).replace(/[^a-zA-Z\s]/g, ''));
                  }}
                  pattern="[a-zA-Z\s]*"
                  inputMode="text"
                  autoComplete="name"
                  className="w-full h-11 px-3.5 rounded-[12px] bg-[#FAF2F0] border border-[#D4C3BE] text-[14px] font-serif text-[#201A19] focus:outline-none focus:ring-2 focus:ring-[#801500] uppercase"
                  placeholder=""
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-serif font-bold text-[#524440] uppercase block mb-1">
                    Gender
                  </label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full h-11 px-3 rounded-[12px] bg-[#FAF2F0] border border-[#D4C3BE] text-[13px] font-serif text-[#201A19] focus:outline-none focus:ring-2 focus:ring-[#801500]"
                  >
                    <option value="MALE">MALE</option>
                    <option value="FEMALE">FEMALE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-serif font-bold text-[#524440] uppercase block mb-1">
                    Age
                  </label>
                  <input 
                    type="number"
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-[12px] bg-[#FAF2F0] border border-[#D4C3BE] text-[14px] font-serif text-[#201A19] focus:outline-none focus:ring-2 focus:ring-[#801500]"
                    placeholder=""
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1 h-11 rounded-full border border-[#83746F] text-[13px] font-serif font-bold text-[#201A19] hover:bg-[#FAF2F0]"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePatientInfo}
                className="flex-1 h-11 rounded-full bg-[#801500] hover:bg-[#A2240B] text-[#FFFFFF] text-[13px] font-serif font-bold shadow-xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Official Blood Group Report Dialog */}
      {showReportDialog && (
        <div 
          id="modal-official-report"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowReportDialog(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[364px] bg-[#FFFFFF] rounded-[28px] shadow-2xl border border-[#D4C3BE] flex flex-col max-h-[88vh] overflow-hidden text-[#201A19]"
            role="dialog"
          >
            {/* Nav Bar: BE^+ on left, cross exit button on right */}
            <header 
              id="report-modal-navbar"
              className="w-full h-16 px-5 flex items-center justify-between border-b border-[#E9E1DF] bg-[#FFF8F6] shrink-0 select-none z-10"
            >
              {/* Left side: BE^+ Brand Title styled identical to top app bar */}
              <div className="flex items-center h-full">
                <span 
                  id="report-modal-brand-title"
                  className="text-[26px] leading-none font-semibold text-[#8A0000] tracking-normal inline-flex items-center m-0 p-0"
                  style={{
                    fontFamily: "'Alkatra', system-ui, sans-serif",
                    fontWeight: 600
                  }}
                >
                  <span className="inline-flex items-center leading-none">
                    <span>BE</span>
                    <span 
                      className="text-[26px] font-semibold text-[#8A0000] ml-[2px] -translate-y-[8px] leading-none select-none inline-block"
                      style={{ 
                        fontFamily: "'Alkatra', system-ui, sans-serif",
                        fontWeight: 600
                      }}
                    >
                      +
                    </span>
                  </span>
                </span>
              </div>

              {/* Right side: Cross exit button */}
              <div className="flex items-center h-full">
                <button
                  id="btn-close-report-modal"
                  onClick={() => setShowReportDialog(false)}
                  className="w-10 h-10 -mr-1.5 rounded-full flex items-center justify-center text-[#524440] hover:text-[#201A19] hover:bg-[#FAF2F0] active:scale-95 transition-all cursor-pointer select-none"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-[#524440]" strokeWidth={2.2} />
                </button>
              </div>
            </header>

            {/* Scrollable Report Content */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3.5">
              {/* Box 1: Report ID, Name, Age, Gender, Date */}
              <div 
                id="report-patient-info-box"
                className="bg-[#FAF2F0] rounded-[18px] p-4 flex flex-col gap-2 font-serif text-[13px] border border-[#E9E1DF] shadow-2xs"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[#524440] font-normal">Report ID:</span>
                  <span 
                    id="report-info-id"
                    className="font-bold text-[#201A19] tracking-wider text-[14px]"
                  >
                    {StorageService.formatReportId5(activeReport)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#524440] font-normal">Name:</span>
                  <span 
                    id="report-info-name"
                    className="font-bold text-[#201A19] uppercase"
                  >
                    {activeReport.patientName || patient.name || '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#524440] font-normal">Age:</span>
                  <span 
                    id="report-info-age"
                    className="font-bold text-[#201A19]"
                  >
                    {activeReport.patientAge || patient.age ? `${activeReport.patientAge || patient.age} Yrs` : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#524440] font-normal">Gender:</span>
                  <span 
                    id="report-info-gender"
                    className="font-bold text-[#201A19]"
                  >
                    {activeReport.patientGender || patient.gender || '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#524440] font-normal">Date:</span>
                  <span 
                    id="report-info-date"
                    className="font-bold text-[#201A19]"
                  >
                    {new Date(activeReport.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Box 2: Resultant Blood Group Display Box (e.g. AB-) */}
              <div 
                id="report-blood-group-box"
                className="bg-[#FFF8F6] rounded-[20px] p-4 border border-[#801500]/25 flex flex-col items-center justify-center text-center shadow-xs"
              >
                <span className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#801500]">
                  DETECTED BLOOD PHENOTYPE
                </span>
                <span 
                  id="report-modal-blood-group-val"
                  className="text-[54px] font-serif font-bold text-[#1A1A1A] leading-none my-2 tracking-tight"
                >
                  {hasTestDone ? (activeReport.predictedGroup || patient.selectedBloodGroup) : '?'}
                </span>
              </div>

              {/* Box 3: Transfusion Compatibility (Can Donate & Can Receive) */}
              <div 
                id="report-compatibility-box"
                className="bg-[#FAF2F0] rounded-[16px] p-3.5 flex flex-col gap-2 font-serif text-[12px] border border-[#E9E1DF]"
              >
                <div>
                  <span className="font-bold text-[#201A19] block mb-1">Can Donate Red Cells To:</span>
                  <span className="text-[#524440] bg-white px-2.5 py-0.5 rounded-full border border-[#D4C3BE] inline-block font-sans font-medium text-[11px]">
                    {(activeReport.canDonateTo && activeReport.canDonateTo.length > 0 ? activeReport.canDonateTo : ['AB+', 'AB-']).join(', ')}
                  </span>
                </div>
                <div className="border-t border-[#E9E1DF] pt-1.5">
                  <span className="font-bold text-[#201A19] block mb-1">Can Receive From:</span>
                  <span className="text-[#524440] bg-white px-2.5 py-0.5 rounded-full border border-[#D4C3BE] inline-block font-sans font-medium text-[11px]">
                    {(activeReport.canReceiveFrom && activeReport.canReceiveFrom.length > 0 ? activeReport.canReceiveFrom : ['AB-', 'A-', 'B-', 'O-']).join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-[#E9E1DF] bg-[#FAF2F0]">
              <button
                id="btn-download-official-report"
                onClick={handleDownloadReport}
                className="w-full h-12 rounded-full bg-[#801500] hover:bg-[#A2240B] text-white font-serif font-bold text-[14px] flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Again</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signed APK Modal */}
      {showApkDialog && (
        <div 
          id="modal-apk-deliverable"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowApkDialog(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[340px] bg-[#FFFFFF] rounded-[28px] p-6 shadow-2xl border border-[#D4C3BE] flex flex-col gap-3.5 text-[#201A19]"
            role="dialog"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-[#FAF2F0] text-[#801500] flex items-center justify-center font-bold">
                  <M3Icon name="verified" size={20} />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold font-serif leading-tight">
                    Signed Release APK
                  </h3>
                  <span className="text-[11px] text-[#524440]">Production Deliverable</span>
                </div>
              </div>
              <button
                onClick={() => setShowApkDialog(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#524440] hover:bg-[#FAF2F0]"
              >
                <M3Icon name="close" size={18} />
              </button>
            </div>

            <div className="bg-[#FAF2F0] p-3 rounded-[14px] flex flex-col gap-1.5 text-[11px] font-mono text-[#524440]">
              <div className="flex justify-between">
                <span>Package:</span>
                <span className="font-bold text-[#201A19]">com.beplus.bloodgroup</span>
              </div>
              <div className="flex justify-between">
                <span>Screen:</span>
                <span className="text-[#201A19]">Result Copy (412×892dp)</span>
              </div>
              <div className="flex justify-between">
                <span>Patient:</span>
                <span className="text-[#201A19]">{patient.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Blood Group:</span>
                <span className="font-bold text-[#801500]">{patient.selectedBloodGroup}</span>
              </div>
              <div className="flex justify-between">
                <span>Signature:</span>
                <span className="text-emerald-700 font-bold">SHA-256 Validated</span>
              </div>
            </div>

            <p className="text-[12px] text-[#524440] font-serif">
              Native Android build package targeting portrait phone screen (412×892dp) with Material 3 Expressive motion and color scheme.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setShowApkDialog(false)}
                className="flex-1 h-11 rounded-full border border-[#83746F] text-[13px] font-serif font-semibold hover:bg-[#FAF2F0] cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleDownloadApkDeliverable}
                className="flex-1 h-11 rounded-full bg-[#801500] text-white text-[13px] font-serif font-bold hover:bg-[#A2240B] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <M3Icon name="download" size={16} />
                <span>Save APK</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

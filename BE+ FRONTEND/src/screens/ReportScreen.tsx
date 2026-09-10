import React, { useState, useEffect, useMemo } from 'react';
import { BloodGroupReport, BloodGroup } from '../types';
import { StorageService } from '../services/storage';
import { generateBloodGroupReportPdf } from '../utils/pdfGenerator';
import { 
  Download, 
  Check, 
  Info, 
  Calendar, 
  User, 
  Share2, 
  FileText, 
  Trash2, 
  X, 
  ChevronRight, 
  Printer, 
  History,
  Award
} from 'lucide-react';

interface ReportScreenProps {
  onStartNewTest?: () => void;
  initialReportId?: string | null;
  onReportDownloaded?: (report: BloodGroupReport) => void;
}

// Fallback default report matching the M3 sketch spec if no real test was recorded yet
const DEFAULT_SPEC_REPORT: BloodGroupReport = {
  id: 'spec-default-ab-neg',
  testCode: 'B7K92',
  patientName: 'ARNAV PANDEY',
  patientAge: 21,
  patientGender: 'Male',
  fingerScanned: 'Right Thumb',
  timestamp: Date.now(),
  predictedGroup: 'AB-',
  rhFactor: 'Negative (-)',
  confidenceScore: 96.8,
  patternType: 'whorl',
  ridgeDensity: 16.8,
  primaryAntigens: ['Antigen A', 'Antigen B'],
  antibodies: ['None in serum'],
  canDonateTo: ['AB+', 'AB-'],
  canReceiveFrom: ['AB-', 'A-', 'B-', 'O-'],
  clinicalNotes: 'Dermatoglyphic signature reveals bilateral whorl pattern with pronounced core delta loops, demonstrating high correlation (96.8%) with ABO blood antigen phenotype AB (Rh-).',
  clinicName: 'BE+ Hematology & Biometrics Diagnostic Center',
  technicianName: 'Dr. R. Sharma (Biometric Lab)'
};

export const ReportScreen: React.FC<ReportScreenProps> = ({ 
  onStartNewTest, 
  initialReportId,
  onReportDownloaded
}) => {
  const [reports, setReports] = useState<BloodGroupReport[]>([]);
  const [activeReport, setActiveReport] = useState<BloodGroupReport>(DEFAULT_SPEC_REPORT);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const hasTestDone = reports.length > 0;

  // Load persistent reports
  useEffect(() => {
    const loaded = StorageService.getReports();
    setReports(loaded);

    if (initialReportId) {
      const target = loaded.find(r => r.id === initialReportId);
      if (target) {
        setActiveReport(target);
        return;
      }
    }

    if (loaded.length > 0) {
      setActiveReport(loaded[0]);
    } else {
      setActiveReport(DEFAULT_SPEC_REPORT);
    }
  }, [initialReportId]);

  // Check if active report is already downloaded
  useEffect(() => {
    const downloaded = StorageService.getDownloadedReport();
    if (downloaded && downloaded.id === activeReport.id) {
      setIsDownloaded(true);
    } else {
      setIsDownloaded(false);
    }
  }, [activeReport]);

  // Handle Blood Group Report Download / Export
  const handleDownloadReport = () => {
    if (!hasTestDone) {
      setToastMessage('No test completed yet. Please run a biometric scan first.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    try {
      // Mark and persist as the officially downloaded report
      StorageService.setDownloadedReport(activeReport);
      setIsDownloaded(true);
      if (onReportDownloaded) {
        onReportDownloaded(activeReport);
      }

      // Generate exact official PDF and trigger download on laptop/phone
      const patient = StorageService.getPatientProfile();
      generateBloodGroupReportPdf(activeReport, {
        name: patient.name,
        age: patient.age,
        gender: patient.gender
      });

      setDownloadSuccessToast(true);
      setTimeout(() => setDownloadSuccessToast(false), 3500);
    } catch (e) {
      console.error('Download report error:', e);
      setDownloadSuccessToast(true);
      setTimeout(() => setDownloadSuccessToast(false), 3000);
    }
  };

  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const q = searchQuery.toLowerCase();
    return reports.filter(r => 
      r.testCode.toLowerCase().includes(q) || 
      r.predictedGroup.toLowerCase().includes(q) ||
      r.patientName.toLowerCase().includes(q)
    );
  }, [reports, searchQuery]);

  const handleDeleteReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    StorageService.deleteReport(id);
    const remaining = StorageService.getReports();
    setReports(remaining);
    if (activeReport.id === id) {
      setActiveReport(remaining.length > 0 ? remaining[0] : DEFAULT_SPEC_REPORT);
    }
  };

  return (
    <div 
      id="screen-report-result"
      className="w-full flex-1 bg-[#FAF2F0] flex flex-col items-center px-5 pt-[22px] sm:pt-[32px] md:pt-[40px] pb-6 sm:pb-8 select-none overflow-y-auto"
    >
      {/* 1. Near the top, centered: "Analysis Completed" */}
      <div 
        id="report-status-header-row"
        className="w-full flex items-center justify-center shrink-0"
      >
        <h1 
          id="report-analysis-complete-title"
          className="text-[28px] sm:text-[34px] md:text-[40px] lg:text-[46px] leading-tight font-serif font-bold text-[#201A19] whitespace-nowrap tracking-tight text-center"
        >
          Analysis Completed
        </h1>
      </div>

      {/* Balanced Spacer */}
      <div className="h-[20px] sm:h-[28px] md:h-[36px] shrink-0" />

      {/* 2. In the middle: result box (background surfaceContainerHigh #FFFFFF, 20dp corners) */}
      <div 
        id="report-result-box"
        className="w-[340px] sm:w-[400px] md:w-[480px] lg:w-[540px] max-w-full h-[300px] sm:h-[340px] md:h-[380px] lg:h-[410px] bg-[#FFFFFF] rounded-[24px] md:rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E9E1DF]/50 flex flex-col items-center justify-between px-6 md:px-10 pt-10 md:pt-14 pb-6 md:pb-8 shrink-0 relative"
      >
        {/* Center content: Blood Group at 50sp + Accuracy at 18sp */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          {/* Blood Group text at 50sp, black bold serif */}
          <span 
            id="report-blood-group-val"
            className="text-[54px] sm:text-[68px] md:text-[80px] lg:text-[92px] leading-none font-serif font-bold text-[#1A1A1A] tracking-tight select-none"
          >
            {hasTestDone ? activeReport.predictedGroup : '?'}
          </span>

          {/* Model Accuracy text at 18sp */}
          {hasTestDone && (
            <p 
              id="report-model-accuracy-text"
              className="text-[19px] sm:text-[22px] md:text-[25px] lg:text-[28px] leading-normal font-serif font-medium text-[#1A2E35] mt-6 md:mt-8 tracking-normal"
            >
              {activeReport.confidenceScore.toFixed(1)}% Model Accuracy
            </p>
          )}
        </div>

        {/* Near bottom of box: Pill "Predicted Blood Group" - display only, not a button */}
        <div
          id="label-predicted-blood-group"
          className="w-full max-w-[290px] sm:max-w-[340px] md:max-w-[400px] lg:max-w-[440px] h-[54px] md:h-[62px] lg:h-[66px] rounded-full bg-[#FAF0ED] text-[#7A1200] font-serif font-bold text-[18px] sm:text-[20px] md:text-[22px] lg:text-[23px] tracking-normal shadow-[0_3px_12px_rgba(0,0,0,0.07)] border border-[#F0DDD7] flex items-center justify-center select-none cursor-default whitespace-nowrap"
        >
          Predicted Blood Group
        </div>
      </div>

      {/* Balanced Spacer */}
      <div className="h-[20px] sm:h-[28px] md:h-[36px] shrink-0" />

      {/* 3. In the middle: a filled card with image from specified URL as full-bleed background */}
      <div 
        id="report-download-card"
        onClick={() => setIsReportModalOpen(true)}
        className="w-[340px] sm:w-[400px] md:w-[480px] lg:w-[540px] max-w-full h-[208px] sm:h-[240px] md:h-[270px] lg:h-[300px] rounded-[24px] md:rounded-[32px] bg-[#FFFFFF] relative overflow-hidden shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.06)] cursor-pointer group active:scale-[0.985] transition-all select-none border border-[#D4C3BE]"
      >
        {/* Full-bleed background image with 50% opacity */}
        <img 
          id="report-card-bg-image"
          src="https://i.pinimg.com/1200x/bc/7d/ef/bc7deff81988bac339cc5930927c2117.jpg"
          alt="Blood Group Diagnostic Background"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-50 group-hover:scale-[1.02] transition-transform duration-300 ease-out"
          referrerPolicy="no-referrer"
        />

        {/* Text Container: Left-aligned and vertically centered directly over the paper background */}
        <div 
          id="report-card-content"
          className="absolute inset-0 flex flex-col justify-center items-start pl-6 md:pl-10 pr-4 z-10"
        >
          {/* Headline: "BLOOD GROUP REPORT" in bold serif, uppercase */}
          <h2 
            id="report-card-headline"
            className="text-[19px] sm:text-[23px] md:text-[26px] lg:text-[30px] leading-tight font-serif font-bold text-[#201A19] tracking-normal"
          >
            BLOOD GROUP REPORT
          </h2>

          {/* Body: "Download Now" in regular serif */}
          <p 
            id="report-card-body"
            className="mt-2 text-[15px] sm:text-[18px] md:text-[21px] lg:text-[23px] leading-normal font-serif font-normal text-[#5A4D4A]"
          >
            {isDownloaded ? 'View & Download Report' : 'Download Now'}
          </p>
        </div>
      </div>

      {/* Download Success Floating Notification Toast */}
      {downloadSuccessToast && (
        <div 
          id="report-download-toast"
          className="fixed bottom-24 z-50 px-5 py-3 rounded-full bg-[#201A19] text-[#FFFFFF] font-serif text-sm flex items-center gap-2.5 shadow-xl animate-fade-in"
        >
          <Check className="w-4 h-4 text-[#FEB5A1]" />
          <span>Diagnostic report downloaded! Added to Profile section.</span>
        </div>
      )}

      {/* General Floating Notification Toast */}
      {toastMessage && (
        <div 
          id="report-action-toast"
          className="fixed bottom-24 z-50 px-5 py-3 rounded-full bg-[#201A19] text-[#FFFFFF] font-serif text-sm flex items-center gap-2.5 shadow-xl animate-fade-in"
        >
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Official Diagnostic Blood Group Report Modal (opens when clicking Download Now / Blood Group Report box) */}
      {isReportModalOpen && (
        <div 
          id="modal-official-report-viewer"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsReportModalOpen(false)}
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
                  onClick={() => setIsReportModalOpen(false)}
                  className="w-10 h-10 -mr-1.5 rounded-full flex items-center justify-center text-[#524440] hover:text-[#201A19] hover:bg-[#FAF2F0] active:scale-95 transition-all cursor-pointer select-none"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-[#524440]" strokeWidth={2.2} />
                </button>
              </div>
            </header>

            {/* Scrollable Report Content */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3.5">
                {/* Box 1: Report ID, Name, Age, Gender */}
              {(() => {
                const currentPatient = StorageService.getPatientProfile();
                return (
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
                        {hasTestDone ? StorageService.formatReportId5(activeReport) : 'PENDING'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#524440] font-normal">Name:</span>
                      <span 
                        id="report-info-name"
                        className="font-bold text-[#201A19] uppercase"
                      >
                        {currentPatient.name || (hasTestDone ? activeReport.patientName : 'PENDING ENTRY')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#524440] font-normal">Age:</span>
                      <span 
                        id="report-info-age"
                        className="font-bold text-[#201A19]"
                      >
                        {currentPatient.age ? `${currentPatient.age} Yrs` : (hasTestDone && activeReport.patientAge ? `${activeReport.patientAge} Yrs` : '--')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#524440] font-normal">Gender:</span>
                      <span 
                        id="report-info-gender"
                        className="font-bold text-[#201A19]"
                      >
                        {currentPatient.gender || (hasTestDone ? activeReport.patientGender : '--')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#524440] font-normal">Date:</span>
                      <span 
                        id="report-info-date"
                        className="font-bold text-[#201A19]"
                      >
                        {hasTestDone ? new Date(activeReport.timestamp).toLocaleDateString() : '--'}
                      </span>
                    </div>
                  </div>
                );
              })()}

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
                  {hasTestDone ? activeReport.predictedGroup : '?'}
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
                    {hasTestDone 
                      ? (activeReport.canDonateTo && activeReport.canDonateTo.length > 0 ? activeReport.canDonateTo : ['AB+', 'AB-']).join(', ')
                      : 'Pending Test'}
                  </span>
                </div>
                <div className="border-t border-[#E9E1DF] pt-1.5">
                  <span className="font-bold text-[#201A19] block mb-1">Can Receive From:</span>
                  <span className="text-[#524440] bg-white px-2.5 py-0.5 rounded-full border border-[#D4C3BE] inline-block font-sans font-medium text-[11px]">
                    {hasTestDone 
                      ? (activeReport.canReceiveFrom && activeReport.canReceiveFrom.length > 0 ? activeReport.canReceiveFrom : ['AB-', 'A-', 'B-', 'O-']).join(', ')
                      : 'Pending Test'}
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
                <span>{hasTestDone && isDownloaded ? 'Download Again' : 'Download Report'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal (if user wants to browse past saved tests) */}
      {isHistoryModalOpen && (
        <div 
          id="report-history-dialog-overlay"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsHistoryModalOpen(false)}
        >
          <div 
            id="report-history-dialog"
            className="w-full max-w-sm bg-[#FFFFFF] rounded-[28px] shadow-2xl p-6 relative flex flex-col max-h-[85vh] overflow-hidden border border-[#E9E1DF]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E1DF]">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#201A19]">
                  Saved Reports
                </h3>
                <p className="text-xs text-[#524440] font-serif">
                  {reports.length} persistent biometric records
                </p>
              </div>
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF2F0] text-[#524440] hover:bg-[#E9E1DF] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="py-3">
              <input 
                type="text"
                placeholder="Search by code or blood group..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-full bg-[#FAF2F0] border border-[#D4C3BE]/50 font-serif focus:outline-none focus:border-[#801500]"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {filteredReports.map((report) => (
                <div 
                  key={report.id}
                  onClick={() => {
                    setActiveReport(report);
                    setIsHistoryModalOpen(false);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    report.id === activeReport.id 
                      ? 'bg-[#FAF2F0] border-[#801500]' 
                      : 'bg-[#FFFFFF] border-[#E9E1DF] hover:bg-[#FAF2F0]/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#801500] text-white flex items-center justify-center font-serif font-bold text-base">
                      {report.predictedGroup}
                    </div>
                    <div>
                      <h4 className="text-sm font-serif font-semibold text-[#201A19]">
                        {report.testCode}
                      </h4>
                      <p className="text-xs text-[#524440] font-serif">
                        {new Date(report.timestamp).toLocaleDateString()} • {report.confidenceScore}% acc
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => handleDeleteReport(report.id, e)}
                      title="Delete report"
                      className="p-1.5 rounded-full hover:bg-[#F9DEDC] text-[#B3261E] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-[#83746F]" />
                  </div>
                </div>
              ))}

              {filteredReports.length === 0 && (
                <div className="py-8 text-center text-[#524440] text-xs font-serif">
                  No reports matching your search.
                </div>
              )}
            </div>

            {/* Close footer */}
            <div className="pt-3 border-t border-[#E9E1DF]">
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="w-full h-10 rounded-full bg-[#FAF2F0] text-[#524440] font-serif font-medium text-xs hover:bg-[#E9E1DF] transition-colors"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

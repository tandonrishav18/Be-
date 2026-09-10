import React, { useState, useEffect } from 'react';
import { NavDestination, BloodGroupReport, PatientProfile } from './types';
import { AndroidFrame } from './components/AndroidFrame';
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar } from './components/BottomNavBar';
import { DesktopNavRail } from './components/DesktopNavRail';
import { M3Icon } from './components/M3Icon';
import { HomeScreen } from './screens/HomeScreen';
import { TestScreen } from './screens/TestScreen';
import { ReportScreen } from './screens/ReportScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { ScannerDialog } from './components/ScannerDialog';
import { PersonalDetailsDialog } from './components/PersonalDetailsDialog';
import { StorageService } from './services/storage';

// Automatically reset previous session data on page/app reload
StorageService.resetSessionOnReload();

export default function App() {
  const [currentDestination, setCurrentDestination] = useState<NavDestination>('Home');
  const [navHistory, setNavHistory] = useState<NavDestination[]>(['Home']);
  const [isScannerDialogOpen, setIsScannerDialogOpen] = useState(false);
  const [isPersonalDetailsOpen, setIsPersonalDetailsOpen] = useState(false);
  const [pendingDestination, setPendingDestination] = useState<NavDestination | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile>(() => StorageService.getPatientProfile());
  const [hardwareConnected, setHardwareConnected] = useState(true);
  const [reportCount, setReportCount] = useState(0);
  const [latestReportId, setLatestReportId] = useState<string | null>(null);
  const [downloadedTimestamp, setDownloadedTimestamp] = useState<number>(0);

  // Sync report count and profile from persistence
  const updateReportCount = () => {
    const reports = StorageService.getReports();
    setReportCount(reports.length);
    setPatientProfile(StorageService.getPatientProfile());
  };

  useEffect(() => {
    updateReportCount();
  }, [currentDestination]);

  // Handle navigation with history
  const navigateTo = (destination: NavDestination) => {
    if (destination !== currentDestination) {
      setNavHistory(prev => [...prev, destination]);
      setCurrentDestination(destination);
    }
  };

  // Intercept navigation if personal details are required
  const handleRequestDestination = (destination: NavDestination) => {
    if (destination === 'Home') {
      navigateTo('Home');
      return;
    }

    // If user hasn't submitted personal details yet, show the Personal Details popup
    if (!StorageService.hasSubmittedPersonalDetails()) {
      setPendingDestination(destination);
      setIsPersonalDetailsOpen(true);
      return;
    }

    navigateTo(destination);
  };

  // Handle scanner hardware link click
  const handleLinkClick = () => {
    if (!StorageService.hasSubmittedPersonalDetails()) {
      setPendingDestination('Test');
      setIsPersonalDetailsOpen(true);
    } else {
      setIsScannerDialogOpen(true);
    }
  };

  // Handle saving details from the Personal Details popup
  const handlePersonalDetailsContinue = (details: { name: string; age: string; gender: 'Male' | 'Female' | 'Other' }) => {
    StorageService.savePatientProfile(details);
    StorageService.setSubmittedPersonalDetails(true);
    setPatientProfile(StorageService.getPatientProfile());
    setIsPersonalDetailsOpen(false);
    setDownloadedTimestamp(Date.now());

    // Continue to the requested destination (or default to Test)
    const targetDest = pendingDestination || 'Test';
    setPendingDestination(null);
    navigateTo(targetDest);
  };

  const handleTestComplete = (report: BloodGroupReport) => {
    setLatestReportId(report.id);
    setDownloadedTimestamp(Date.now());
    updateReportCount();
  };

  return (
    <AndroidFrame>
      <div 
        id="app-root-container"
        className="w-full min-h-screen flex flex-col md:flex-row relative bg-[#FAF2F0]"
      >
        {/* Mobile Top App Bar (hidden on desktop) */}
        <TopAppBar
          title="BE+"
          onHomeClick={() => navigateTo('Home')}
          onLinkClick={handleLinkClick}
          hardwareConnected={hardwareConnected}
        />

        {/* Desktop Vertical Nav Rail (below BE+ vertically, hidden on mobile) */}
        <DesktopNavRail
          currentDestination={currentDestination}
          onSelectDestination={handleRequestDestination}
          onHomeClick={() => navigateTo('Home')}
        />

        {/* Main Content & Desktop Header Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          {/* Desktop Top Header with Link Icon on the far right */}
          <header 
            id="desktop-top-header"
            className="hidden md:flex w-full h-14 px-6 md:px-8 items-center justify-end shrink-0 bg-[#FFFFFF] border-none sticky top-0 z-20"
          >
            <button
              id="btn-desktop-topbar-link"
              onClick={handleLinkClick}
              aria-label="Scanner Hardware Link"
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#201A19] hover:text-[#8A0000] active:text-[#8A0000] focus:text-[#8A0000] hover:bg-[#FAF2F0] active:scale-95 transition-all duration-150 cursor-pointer"
            >
              <M3Icon name="link_2" size={24} className="w-5 h-5" />
            </button>
          </header>

          {/* Dynamic Screen Viewport Area */}
          <main 
            id="m3-main-screen"
            className="flex-1 w-full max-w-5xl mx-auto flex flex-col justify-between overflow-y-auto relative"
          >
            {currentDestination === 'Home' && (
              <HomeScreen
                onStartTest={() => handleRequestDestination('Test')}
                onOpenScannerDialog={handleLinkClick}
              />
            )}

            {currentDestination === 'Test' && (
              <TestScreen
                onTestComplete={handleTestComplete}
                onNavigateToReports={() => navigateTo('Report')}
              />
            )}

            {currentDestination === 'Report' && (
              <ReportScreen
                initialReportId={latestReportId}
                onStartNewTest={() => {
                  setLatestReportId(null);
                  navigateTo('Test');
                }}
                onReportDownloaded={() => {
                  setDownloadedTimestamp(Date.now());
                  updateReportCount();
                }}
              />
            )}

            {currentDestination === 'Profile' && (
              <ProfileScreen
                key={`profile-${downloadedTimestamp}`}
                onOpenScannerDialog={() => setIsScannerDialogOpen(true)}
                onOpenPersonalDetails={() => setIsPersonalDetailsOpen(true)}
              />
            )}
          </main>

          {/* Bottom Navigation Bar (Mobile only, hidden on desktop) */}
          <BottomNavBar
            currentDestination={currentDestination}
            onSelectDestination={handleRequestDestination}
            reportCount={reportCount}
          />
        </div>

        {/* Personal Details Popup Menu (Triggered on first click of Test Now, Test, Report, Profile) */}
        <PersonalDetailsDialog
          isOpen={isPersonalDetailsOpen}
          onClose={() => {
            setIsPersonalDetailsOpen(false);
            setPendingDestination(null);
          }}
          onContinue={handlePersonalDetailsContinue}
          initialProfile={patientProfile}
        />

        {/* Top Bar Link_2 Hardware Scanner Status Dialog */}
        <ScannerDialog
          isOpen={isScannerDialogOpen}
          onClose={() => setIsScannerDialogOpen(false)}
          hardwareModel="BE-OptiScan 500 USB Sensor"
          isConnected={hardwareConnected}
          onToggleConnection={() => setHardwareConnected(!hardwareConnected)}
        />
      </div>
    </AndroidFrame>
  );
}

import React from 'react';
import { CollageHero } from '../components/CollageHero';

interface HomeScreenProps {
  onStartTest: () => void;
  onOpenScannerDialog?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  onStartTest,
  onOpenScannerDialog 
}) => {
  return (
    <div 
      id="screen-home"
      className="w-full flex-1 flex flex-col items-center justify-between px-5 pt-[22px] sm:pt-[32px] md:pt-[40px] pb-4 sm:pb-8 select-none"
    >
      {/* 1. Header Typography Area */}
      {/* Mobile / Phone: 2-line title as it was */}
      <div className="w-full flex flex-col items-center shrink-0 md:hidden">
        <h1 
          id="home-title-line-1"
          className="text-[23px] sm:text-[28px] leading-[30px] sm:leading-[38px] font-bold text-[#201A19] tracking-tight text-center font-serif whitespace-nowrap"
          style={{
            fontVariationSettings: "'opsz' 36, 'wght' 750"
          }}
        >
          BLOOD GROUP DETECTION
        </h1>

        <h2 
          id="home-title-line-2"
          className="text-[23px] sm:text-[28px] leading-[30px] sm:leading-[38px] font-bold text-[#201A19] tracking-tight text-center font-serif whitespace-nowrap"
          style={{
            fontVariationSettings: "'opsz' 36, 'wght' 750"
          }}
        >
          USING FINGERPRINTS
        </h2>
      </div>

      {/* Desktop View: Single-line title */}
      <div className="hidden md:flex w-full items-center justify-center shrink-0 px-4">
        <h1 
          id="home-desktop-title"
          className="text-[26px] lg:text-[32px] xl:text-[38px] leading-tight font-bold text-[#201A19] tracking-tight text-center font-serif whitespace-nowrap"
          style={{
            fontVariationSettings: "'opsz' 36, 'wght' 750"
          }}
        >
          BLOOD GROUP DETECTION USING FINGERPRINT
        </h1>
      </div>

      {/* Balanced Spacer */}
      <div className="h-[20px] sm:h-[28px] md:h-[36px] shrink-0" />

      {/* 2. Middle Hero Image (Central Artwork matching 8.png height) */}
      <div className="w-full flex items-center justify-center shrink-0">
        <CollageHero 
          customImageUri="/8.png"
        />
      </div>

      {/* Spacer */}
      <div className="h-[20px] sm:h-[28px] md:h-[36px] shrink-0" />

      {/* 3. Centered Descriptive Instruction Text */}
      <div className="w-full flex flex-col items-center text-center px-2 shrink-0">
        <p 
          id="home-desc-line-1"
          className="text-[17px] sm:text-[20px] md:text-[24px] lg:text-[26px] leading-[24px] sm:leading-[29px] md:leading-[34px] lg:leading-[38px] text-[#524440] font-serif font-normal"
        >
          Upload fingerprint image to get your
        </p>

        <p 
          id="home-desc-line-2"
          className="text-[17px] sm:text-[20px] md:text-[24px] lg:text-[26px] leading-[24px] sm:leading-[29px] md:leading-[34px] lg:leading-[38px] text-[#524440] font-serif font-normal"
        >
          predicted Blood Group
        </p>
      </div>

      {/* 4. Balanced Lower Action Zone */}
      <div className="flex-1 w-full flex flex-col items-center justify-center shrink-0 py-4 sm:py-6">
        <button
          id="btn-test-now"
          onClick={onStartTest}
          className="w-[308px] sm:w-[360px] md:w-[440px] lg:w-[480px] h-[52px] sm:h-[60px] md:h-[68px] lg:h-[72px] rounded-full bg-[#8A0000] hover:bg-[#A2240B] text-[#FFFFFF] text-[17px] sm:text-[20px] md:text-[23px] lg:text-[24px] font-bold tracking-wide shadow-md active:scale-[0.98] transition-all duration-150 flex items-center justify-center cursor-pointer font-serif"
          style={{
            fontVariationSettings: "'opsz' 24, 'wght' 700",
            boxShadow: '0 6px 20px rgba(138, 0, 0, 0.28)'
          }}
          aria-label="Test Now"
        >
          Test Now
        </button>
      </div>
    </div>
  );
};

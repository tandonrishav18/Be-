import React from 'react';
import { M3Icon } from './M3Icon';

interface TopAppBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onHomeClick?: () => void;
  onLinkClick?: () => void;
  isScrolled?: boolean;
  hardwareConnected?: boolean;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title = 'BE+',
  showBack = false,
  onBack,
  onHomeClick,
  onLinkClick,
  isScrolled = false,
  hardwareConnected = true
}) => {
  return (
    <header 
      id="m3-top-app-bar"
      className={`md:hidden w-full h-16 transition-colors duration-200 select-none z-30 sticky top-0 ${
        isScrolled ? 'bg-[#FFFFFF] shadow-xs' : 'bg-[#FFF8F6]'
      }`}
      style={{
        borderBottom: isScrolled ? '1px solid #FAF2F0' : 'none'
      }}
    >
      <div className="w-full h-full px-4 sm:px-6 md:px-8 flex items-center justify-between">
        {/* Left side: BE+ Brand Title shifted to left, strictly centered vertically */}
        <div className="flex items-center h-full">
          <div 
            id="topbar-title-container"
            onClick={onHomeClick}
            className="flex items-center h-full cursor-pointer select-none"
          >
            <h1 
              id="topbar-title"
              className="text-[26px] md:text-[30px] leading-none font-semibold text-[#8A0000] tracking-normal inline-flex items-center m-0 p-0"
              style={{
                fontFamily: "'Alkatra', system-ui, sans-serif",
                fontWeight: 600
              }}
            >
              {title === 'BE+' ? (
                <span className="inline-flex items-center leading-none">
                  <span>BE</span>
                  <span 
                    className="text-[26px] md:text-[30px] font-semibold text-[#8A0000] ml-[2px] -translate-y-[8px] md:-translate-y-[9px] leading-none select-none inline-block"
                    style={{ 
                      fontFamily: "'Alkatra', system-ui, sans-serif",
                      fontWeight: 600
                    }}
                  >
                    +
                  </span>
                </span>
              ) : (
                title
              )}
            </h1>
          </div>
        </div>

        {/* Right Icon Button (touch target: link_2, strictly centered vertically) */}
        <div className="flex items-center h-full">
          <button
            id="btn-topbar-link"
            onClick={onLinkClick}
            aria-label="Scanner Hardware Link"
            className="w-12 h-12 md:w-10 md:h-10 rounded-full flex items-center justify-center text-[#201A19] hover:text-[#8A0000] active:text-[#8A0000] focus:text-[#8A0000] hover:bg-[#FAF2F0] active:scale-95 transition-all duration-150 cursor-pointer"
          >
            <M3Icon name="link_2" size={24} className="md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

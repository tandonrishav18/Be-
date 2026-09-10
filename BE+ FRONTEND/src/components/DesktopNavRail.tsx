import React from 'react';
import { NavDestination } from '../types';
import { M3Icon } from './M3Icon';
import { NAV_ITEMS } from './BottomNavBar';

interface DesktopNavRailProps {
  currentDestination: NavDestination;
  onSelectDestination: (dest: NavDestination) => void;
  onHomeClick?: () => void;
}

export const DesktopNavRail: React.FC<DesktopNavRailProps> = ({
  currentDestination,
  onSelectDestination,
  onHomeClick,
}) => {
  return (
    <aside
      id="desktop-vertical-nav-rail"
      className="hidden md:flex flex-col items-center w-24 lg:w-28 bg-[#FFFFFF] border-none shrink-0 sticky top-0 h-screen z-30 select-none py-5"
      role="navigation"
      aria-label="App Navigation Rail"
    >
      {/* BE+ at the top */}
      <div 
        id="desktop-sidebar-brand"
        onClick={onHomeClick}
        className="cursor-pointer select-none flex items-center justify-center h-12 w-full px-2 active:scale-95 transition-transform"
      >
        <h1 
          id="desktop-topbar-title"
          className="text-[30px] lg:text-[34px] leading-none font-semibold text-[#8A0000] tracking-normal inline-flex items-center m-0 p-0"
          style={{
            fontFamily: "'Alkatra', system-ui, sans-serif",
            fontWeight: 600
          }}
        >
          <span className="inline-flex items-center leading-none">
            <span>BE</span>
            <span 
              className="text-[30px] lg:text-[34px] font-semibold text-[#8A0000] ml-[2px] -translate-y-[8px] lg:-translate-y-[9px] leading-none select-none inline-block"
              style={{ 
                fontFamily: "'Alkatra', system-ui, sans-serif",
                fontWeight: 600
              }}
            >
              +
            </span>
          </span>
        </h1>
      </div>

      {/* Navigation items placed vertically directly below BE+ */}
      <div className="w-full flex flex-col items-center gap-6 lg:gap-7 mt-8">
        {NAV_ITEMS.map((item) => {
          const isActive = currentDestination === item.id;

          return (
            <button
              key={item.id}
              id={`desktop-${item.testId}`}
              onClick={() => onSelectDestination(item.id)}
              className="w-full flex flex-col items-center justify-center group cursor-pointer focus:outline-none py-1 transition-transform active:scale-95"
              aria-label={item.label}
              aria-selected={isActive}
            >
              {/* Pill Container */}
              <div 
                className="relative flex items-center justify-center transition-all duration-200 w-[58px] lg:w-[64px] h-[32px]"
              >
                {/* Active Indicator Pill */}
                {isActive && (
                  <span 
                    className="absolute inset-0 rounded-full bg-[#8A0000] shadow-xs"
                    style={{
                      transition: 'all 200ms cubic-bezier(0.2, 0, 0, 1)'
                    }}
                  />
                )}

                {/* Icon */}
                <div 
                  className={`relative z-10 transition-colors duration-200 ${
                    isActive ? 'text-[#FFFFFF]' : 'text-[#524440] group-hover:text-[#201A19]'
                  }`}
                >
                  <M3Icon 
                    name={item.iconName} 
                    filled={isActive} 
                    size={22} 
                  />
                </div>
              </div>

              {/* Destination Label */}
              <span 
                className={`text-[12px] leading-4 mt-1 transition-all duration-200 font-serif ${
                  isActive 
                    ? 'text-[#201A19] font-bold' 
                    : 'text-[#524440] font-normal group-hover:text-[#201A19]'
                }`}
                style={{
                  whiteSpace: 'nowrap'
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

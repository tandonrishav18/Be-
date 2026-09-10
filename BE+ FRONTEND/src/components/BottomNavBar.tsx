import React from 'react';
import { NavDestination } from '../types';
import { M3Icon } from './M3Icon';

interface BottomNavBarProps {
  currentDestination: NavDestination;
  onSelectDestination: (dest: NavDestination) => void;
  reportCount?: number;
}

export interface NavItem {
  id: NavDestination;
  label: string;
  iconName: string;
  testId: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'Home', label: 'Home', iconName: 'home', testId: 'nav-home' },
  { id: 'Test', label: 'Test', iconName: 'experiment', testId: 'nav-test' },
  { id: 'Report', label: 'Report', iconName: 'draft', testId: 'nav-report' },
  { id: 'Profile', label: 'Profile', iconName: 'person', testId: 'nav-profile' },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentDestination,
  onSelectDestination,
  reportCount = 0
}) => {
  return (
    <nav 
      id="m3-bottom-nav-bar"
      className="md:hidden w-full bg-[#FFFFFF] flex flex-col items-center justify-center select-none z-30 shadow-[0_-2px_12px_rgba(0,0,0,0.03)] border-t border-[#FAF2F0] sticky bottom-0 h-[80px]"
      role="navigation"
      aria-label="App Navigation"
    >
      <div className="w-full max-w-5xl mx-auto h-full flex items-center justify-around px-2 sm:px-8 lg:px-12">
        {NAV_ITEMS.map((item) => {
          const isActive = currentDestination === item.id;

          return (
            <button
              key={item.id}
              id={item.testId}
              onClick={() => onSelectDestination(item.id)}
              className="flex-1 flex flex-col items-center justify-center group cursor-pointer focus:outline-none min-h-[64px] md:min-h-[48px]"
              aria-label={item.label}
              aria-selected={isActive}
            >
              {/* Pill Container for active item */}
              <div 
                className="relative flex items-center justify-center transition-all duration-200 w-[64px] md:w-[56px] h-[32px] md:h-[26px]"
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
                    size={24} 
                    className="md:w-[20px] md:h-[20px]"
                  />
                </div>
              </div>

              {/* Destination Label (labelMedium, Roboto Serif emphasized) */}
              <span 
                className={`text-[12px] md:text-[11px] leading-4 md:leading-3 mt-1 md:mt-0.5 transition-all duration-200 font-serif ${
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
    </nav>
  );
};

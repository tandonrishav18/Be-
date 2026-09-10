import React from 'react';

interface AndroidFrameProps {
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  return (
    <div 
      id="app-root-shell"
      className="min-h-screen w-full bg-[#FAF2F0] flex flex-col justify-between text-[#201A19] select-none"
    >
      {children}
    </div>
  );
};




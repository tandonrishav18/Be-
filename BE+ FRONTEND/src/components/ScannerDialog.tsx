import React, { useState } from 'react';
import { M3Icon } from './M3Icon';

interface ScannerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  hardwareModel: string;
  isConnected: boolean;
  onToggleConnection: () => void;
}

export const ScannerDialog: React.FC<ScannerDialogProps> = ({
  isOpen,
  onClose,
  hardwareModel,
  isConnected,
  onToggleConnection
}) => {
  const [calibrating, setCalibrating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCalibrate = () => {
    setCalibrating(true);
    setStatusMsg('Zeroing optical sensor & ridge contrast...');
    setTimeout(() => {
      setCalibrating(false);
      setStatusMsg('Calibration complete. 500 DPI optical baseline locked.');
      setTimeout(() => setStatusMsg(null), 3500);
    }, 1800);
  };

  return (
    <div 
      id="scanner-hardware-dialog-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="scanner-hardware-dialog"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[340px] bg-[#FFFFFF] rounded-[28dp] p-6 shadow-2xl border border-[#D4C3BF]/40 flex flex-col gap-4 text-[#201A19]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="scanner-dialog-title"
      >
        {/* Header with icon & close */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF2F0] flex items-center justify-center text-[#8A0000]">
              <M3Icon name="link_2" size={22} />
            </div>
            <div>
              <h2 id="scanner-dialog-title" className="text-[19px] font-bold tracking-tight font-serif leading-tight">
                Biometric Sensor
              </h2>
              <span className="text-[12px] text-[#524440] font-sans">Hardware Link Protocol</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#FAF2F0] text-[#524440] cursor-pointer"
          >
            <M3Icon name="close" size={20} />
          </button>
        </div>

        {/* Device Status Card */}
        <div className="bg-[#FFF8F6] p-4 rounded-[16dp] border border-[#D4C3BF]/50 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#524440]">Device:</span>
            <span className="text-[13px] font-bold text-[#201A19] font-sans">{hardwareModel}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#524440]">Link Status:</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-600 animate-pulse' : 'bg-[#B3261E]'}`} />
              <span className={`text-[12px] font-bold ${isConnected ? 'text-emerald-700' : 'text-[#B3261E]'}`}>
                {isConnected ? 'Active & Ready' : 'Disconnected'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#524440]">Resolution:</span>
            <span className="text-[12px] font-mono text-[#524440]">500 DPI • 8-Bit Gray</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#524440]">Interface:</span>
            <span className="text-[12px] font-mono text-[#524440]">USB HID / BioAPI 2.0</span>
          </div>
        </div>

        {statusMsg && (
          <div className="bg-[#FAF2F0] px-3 py-2 rounded-[12dp] text-[12px] text-[#8A0000] font-medium animate-in fade-in">
            {statusMsg}
          </div>
        )}

        {/* Action Buttons (M3 Connected Group or Pill Buttons) */}
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={onToggleConnection}
            className="flex-1 h-12 rounded-full border border-[#847470] text-[#201A19] text-[14px] font-semibold hover:bg-[#FAF2F0] active:scale-95 transition-transform duration-150 cursor-pointer"
          >
            {isConnected ? 'Disconnect' : 'Connect USB'}
          </button>

          <button
            onClick={handleCalibrate}
            disabled={!isConnected || calibrating}
            className={`flex-1 h-12 rounded-full text-[14px] font-semibold text-white active:scale-95 transition-transform duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
              isConnected ? 'bg-[#8A0000] hover:bg-[#A2240B]' : 'bg-[#847470] opacity-50 cursor-not-allowed'
            }`}
          >
            {calibrating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Tuning...</span>
              </>
            ) : (
              <span>Calibrate</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

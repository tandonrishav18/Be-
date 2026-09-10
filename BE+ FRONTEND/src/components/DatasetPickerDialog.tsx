import React, { useState, useEffect } from 'react';
import { BloodGroup } from '../types';
import { M3Icon } from './M3Icon';
import { openNativeDatasetPickerDialog } from '../services/mlApi';

interface DatasetPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageDataUrl: string, fileName: string) => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'AB+', 'AB-', 'B+', 'B-', 'O+', 'O-'];

export const DatasetPickerDialog: React.FC<DatasetPickerDialogProps> = ({
  isOpen,
  onClose,
  onSelectImage,
}) => {
  const [activeGroup, setActiveGroup] = useState<BloodGroup>('A+');
  const [samplesMap, setSamplesMap] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('http://localhost:5000/api/samples')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.samples) {
            setSamplesMap(data.samples);
          }
        })
        .catch(() => {
          // Fallback static samples if offline
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentFiles = samplesMap[activeGroup] || [
    'cluster_0_1001.BMP',
    'cluster_0_1005.BMP',
    'cluster_0_1009.BMP',
    'cluster_0_1026.BMP'
  ];

  const handleSelectSample = async (filename: string) => {
    const imageUrl = `http://localhost:5000/api/sample-image/${encodeURIComponent(activeGroup)}/${encodeURIComponent(filename)}`;
    try {
      setLoading(true);
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onSelectImage(reader.result, `${activeGroup}_${filename}`);
          onClose();
        }
      };
      reader.readAsDataURL(blob);
    } catch {
      // Fallback
      onSelectImage(`/dataset/${activeGroup}/${filename}`, filename);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNativeDialog = async () => {
    try {
      const res = await openNativeDatasetPickerDialog();
      if (res && res.success && res.dataUrl) {
        onSelectImage(res.dataUrl, res.fileName || 'fingerprint.bmp');
        onClose();
      }
    } catch (err) {
      console.warn('Native picker error:', err);
    }
  };

  return (
    <div
      id="dataset-picker-dialog-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="dataset-picker-dialog"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[560px] max-h-[85vh] bg-[#FFFFFF] rounded-[28px] sm:rounded-[36px] p-5 sm:p-7 shadow-2xl border border-[#D4C3BF]/40 flex flex-col gap-4 text-[#201A19] overflow-hidden select-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF2F0] flex items-center justify-center text-[#8A0000]">
              <M3Icon name="folder_open" size={24} />
            </div>
            <div>
              <h2 className="text-[19px] sm:text-[21px] font-bold tracking-tight font-serif leading-tight">
                Fingerprint Dataset
              </h2>
              <span className="text-[12px] text-[#524440] font-sans">
                F:\Be+\fingerprint-based-blood-group-detection\dataset\
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#FAF2F0] text-[#524440] cursor-pointer transition-colors"
          >
            <M3Icon name="close" size={20} />
          </button>
        </div>

        {/* Windows Explorer Native File Dialog Button */}
        <div className="shrink-0">
          <button
            onClick={handleOpenNativeDialog}
            className="w-full h-11 rounded-full bg-[#FAF2F0] border border-[#8A0000]/30 hover:bg-[#8A0000] text-[#8A0000] hover:text-white font-medium text-[13px] sm:text-[14px] flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 active:scale-[0.98]"
          >
            <M3Icon name="launch" size={18} />
            <span>Open in Windows File Explorer Dialog</span>
          </button>
        </div>

        {/* Blood Group Folder Selector Pills */}
        <div className="shrink-0 flex flex-col gap-1.5">
          <span className="text-[12px] font-bold uppercase tracking-wider text-[#524440]">
            Select Blood Group Folder:
          </span>
          <div className="flex flex-wrap gap-2">
            {BLOOD_GROUPS.map((bg) => (
              <button
                key={bg}
                onClick={() => setActiveGroup(bg)}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-bold transition-all cursor-pointer ${
                  activeGroup === bg
                    ? 'bg-[#8A0000] text-white shadow-sm scale-105'
                    : 'bg-[#FAF2F0] text-[#201A19] hover:bg-[#EADEDC]'
                }`}
              >
                📁 {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Fingerprint Images Grid in Selected Blood Group Folder */}
        <div className="flex-1 min-h-[180px] max-h-[260px] overflow-y-auto pr-1">
          <div className="text-[12px] text-[#705D58] mb-2 font-medium">
            Fingerprint scans in folder <span className="font-bold text-[#8A0000]">{activeGroup}</span>:
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {currentFiles.map((fn, idx) => {
              const imgPreviewUrl = `http://localhost:5000/api/sample-image/${encodeURIComponent(activeGroup)}/${encodeURIComponent(fn)}`;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(fn)}
                  disabled={loading}
                  className="bg-[#FFF8F6] hover:bg-[#FAF2F0] border border-[#D4C3BF]/60 hover:border-[#8A0000] rounded-[18px] p-2 flex flex-col items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] group"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[12px] bg-white border border-[#D4C3BF]/40 overflow-hidden flex items-center justify-center">
                    <img
                      src={imgPreviewUrl}
                      alt={fn}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                      onError={(e) => {
                        e.currentTarget.src = '/MOGO.jpeg';
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-[#201A19] truncate max-w-full">
                    {fn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

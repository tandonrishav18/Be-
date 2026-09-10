import React, { useState, useEffect } from 'react';
import { PatientProfile } from '../types';

interface PersonalDetailsDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  onContinue: (details: { name: string; age: string; gender: 'Male' | 'Female' | 'Other' }) => void;
  initialProfile?: PatientProfile;
}

export const PersonalDetailsDialog: React.FC<PersonalDetailsDialogProps> = ({
  isOpen,
  onClose,
  onContinue,
  initialProfile
}) => {
  const [name, setName] = useState(initialProfile?.name || '');
  const [age, setAge] = useState(initialProfile?.age || '');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | null>(() => {
    if (initialProfile?.gender && ['Male', 'Female', 'Other'].includes(initialProfile.gender)) {
      return initialProfile.gender;
    }
    return null;
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setName(initialProfile?.name || '');
    setAge(initialProfile?.age || '');
    if (initialProfile?.gender && ['Male', 'Female', 'Other'].includes(initialProfile.gender)) {
      setGender(initialProfile.gender);
    } else {
      setGender(null);
    }
    setErrorMsg(null);
  }, [initialProfile, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only accept alphabetic characters and spaces (disallowing numbers and special characters)
    const sanitized = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    setName(sanitized);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow navigation and editing control keys
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

    // Only allow alphabets (A-Z, a-z) and space
    if (/^[a-zA-Z\s]$/.test(e.key)) {
      return;
    }

    // Block numbers and all other characters
    e.preventDefault();
  };

  const handleNamePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const sanitized = pasted.replace(/[^a-zA-Z\s]/g, '');
    setName(prev => (prev + sanitized).replace(/[^a-zA-Z\s]/g, ''));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.replace(/[^a-zA-Z\s]/g, '').trim();
    const cleanAge = age.trim();

    if (!cleanName) {
      setErrorMsg('Please enter your name (alphabets only)');
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(cleanName)) {
      setErrorMsg('Name must contain only alphabets');
      return;
    }
    if (!cleanAge || isNaN(Number(cleanAge)) || Number(cleanAge) <= 0) {
      setErrorMsg('Please enter a valid age');
      return;
    }
    if (!gender) {
      setErrorMsg('Please select your gender');
      return;
    }

    setErrorMsg(null);
    onContinue({
      name: cleanName.toUpperCase(),
      age: cleanAge,
      gender
    });
  };

  return (
    <div 
      id="personal-details-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div 
        id="personal-details-modal"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[360px] bg-[#FFFFFF] rounded-[24px] p-6 shadow-2xl border border-[#D4C3BE] flex flex-col text-[#201A19]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="personal-details-title"
      >
        {/* Title */}
        <div className="text-center mb-4">
          <h2 
            id="personal-details-title"
            className="text-[22px] font-bold font-serif text-[#201A19] tracking-tight"
            style={{ fontVariationSettings: "'opsz' 30, 'wght' 750" }}
          >
            Personal Details
          </h2>
          <p className="text-[12.5px] text-[#524440] font-serif mt-0.5">
            Enter your diagnostic information to continue
          </p>
        </div>

        {/* Error message if any */}
        {errorMsg && (
          <div className="mb-3 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-[12px] font-medium border border-red-200 text-center">
            {errorMsg}
          </div>
        )}

        {/* Input Form Card */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="bg-[#FAF2F0] rounded-[18px] p-4 border border-[#E9E1DF] flex flex-col gap-3.5">
            {/* 1. Name */}
            <div className="flex flex-col gap-1.5">
              <label 
                htmlFor="input-patient-name"
                className="text-[13px] font-serif font-medium text-[#524440]"
              >
                Name:
              </label>
              <input
                id="input-patient-name"
                type="text"
                value={name}
                onChange={handleNameChange}
                onKeyDown={handleNameKeyDown}
                onPaste={handleNamePaste}
                pattern="[a-zA-Z\s]*"
                inputMode="text"
                autoComplete="name"
                placeholder=""
                className="w-full h-11 px-3.5 rounded-[12px] bg-white border border-[#D4C3BE] text-[#201A19] font-serif font-bold text-[14px] focus:outline-none focus:border-[#8A0000] transition-colors shadow-2xs uppercase"
                autoFocus
              />
            </div>

            {/* 2. Age */}
            <div className="flex flex-col gap-1.5">
              <label 
                htmlFor="input-patient-age"
                className="text-[13px] font-serif font-medium text-[#524440]"
              >
                Age:
              </label>
              <div className="relative flex items-center">
                <input
                  id="input-patient-age"
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder=""
                  className="w-full h-11 pl-3.5 pr-14 rounded-[12px] bg-white border border-[#D4C3BE] text-[#201A19] font-serif font-bold text-[14px] focus:outline-none focus:border-[#8A0000] transition-colors shadow-2xs"
                />
                <span className="absolute right-3.5 text-[13px] font-serif font-bold text-[#524440] pointer-events-none">
                  Yrs
                </span>
              </div>
            </div>

            {/* 3. Gender */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-serif font-medium text-[#524440]">
                Gender:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Male', 'Female', 'Other'] as const).map((g) => {
                  const isSelected = gender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      id={`btn-gender-${g.toLowerCase()}`}
                      onClick={() => setGender(g)}
                      className={`h-10 rounded-[10px] text-[13px] font-serif font-bold transition-all border cursor-pointer flex items-center justify-center ${
                        isSelected 
                          ? 'bg-[#801500] text-white border-[#801500] shadow-xs' 
                          : 'bg-white text-[#524440] border-[#D4C3BE] hover:bg-[#F3EBE9]'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            id="btn-personal-details-continue"
            className="w-full h-12 mt-1 rounded-full bg-[#8A0000] hover:bg-[#A2240B] text-white font-serif font-bold text-[15px] flex items-center justify-center tracking-wide shadow-md active:scale-[0.98] transition-all cursor-pointer"
            style={{
              boxShadow: '0 4px 14px rgba(138, 0, 0, 0.28)'
            }}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

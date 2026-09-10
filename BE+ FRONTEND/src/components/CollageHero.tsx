import React, { useState } from 'react';

interface CollageHeroProps {
  customImageUri?: string | null;
  className?: string;
  onClick?: () => void;
}

export const CollageHero: React.FC<CollageHeroProps> = ({ 
  customImageUri = '/8.png', 
  className = '',
  onClick 
}) => {
  const [imgSrc, setImgSrc] = useState<string>(customImageUri || '/8.png');
  const [loadFailed, setLoadFailed] = useState(false);

  const handleImageError = () => {
    // If /8.png fails, try /8.jpg as fallback; otherwise fallback to SVG vector
    if (imgSrc.endsWith('.png')) {
      setImgSrc('/8.jpg');
    } else {
      setLoadFailed(true);
    }
  };

  return (
    <div 
      id="collage-hero-container"
      onClick={onClick}
      className={`relative w-[348px] sm:w-[390px] md:w-[460px] lg:w-[500px] h-[418px] sm:h-[468px] md:h-[540px] lg:h-[580px] max-w-full rounded-[24px] overflow-hidden shadow-sm select-none mx-auto bg-[#E9E1DF] shrink-0 transition-all duration-200 ${className}`}
      style={{
        boxShadow: '0 6px 24px rgba(138, 0, 0, 0.10)'
      }}
    >
      {!loadFailed && imgSrc ? (
        <img 
          id="hero-artwork-image"
          src={imgSrc} 
          alt="Blood Group Detection Collage" 
          className="w-full h-full object-cover object-top pointer-events-none select-none rounded-[24px]"
          referrerPolicy="no-referrer"
          onError={handleImageError}
        />
      ) : (
        /* High-fidelity Vector & Canvas Collage recreation of the Home.png artwork */
        <svg 
          viewBox="0 0 360 360" 
          className="w-full h-full rounded-[20dp]"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Paper Texture Pattern */}
            <linearGradient id="paperBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F9F1ED" />
              <stop offset="50%" stopColor="#FAF2F0" />
              <stop offset="100%" stopColor="#EFE5E1" />
            </linearGradient>

            {/* Blood Red Brushstrokes Gradients */}
            <linearGradient id="bloodRed1" x1="0" y1="0" x2="1" y2="0.8">
              <stop offset="0%" stopColor="#B31217" />
              <stop offset="50%" stopColor="#8A0000" />
              <stop offset="100%" stopColor="#5E0000" />
            </linearGradient>
            <linearGradient id="bloodRed2" x1="0" y1="1" x2="0.8" y2="0">
              <stop offset="0%" stopColor="#9C0A0A" />
              <stop offset="60%" stopColor="#BD1515" />
              <stop offset="100%" stopColor="#E02424" />
            </linearGradient>

            {/* Syringe Glass Shimmer */}
            <linearGradient id="glassShimmer" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="30%" stopColor="#E0E6ED" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#B0B8C0" stopOpacity="0.5" />
            </linearGradient>

            {/* Syringe Liquid Crimson */}
            <linearGradient id="syringeBlood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A21515" />
              <stop offset="100%" stopColor="#660000" />
            </linearGradient>

            {/* Fingerprint Pattern Mask */}
            <pattern id="fingerprintRidge" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
              <path d="M 0 4 Q 8 8 16 4 M 0 10 Q 8 14 16 10 M 0 16 Q 8 20 16 16" fill="none" stroke="#25201E" strokeWidth="1.2" opacity="0.35" />
            </pattern>
          </defs>

          {/* 1. Base Vintage Textured Paper Background */}
          <rect width="360" height="360" fill="url(#paperBg)" />

          {/* 2. Bold Expressive Blood Red Brushstrokes (Diagonal & Dynamic) */}
          <g id="red-strokes" opacity="0.95">
            {/* Top right to bottom slash */}
            <path d="M 120 10 C 140 30, 200 90, 230 180 C 240 210, 235 270, 220 340 L 255 350 C 280 260, 275 190, 250 120 C 230 60, 190 20, 160 5 Z" fill="url(#bloodRed1)" />
            {/* Left slash */}
            <path d="M 30 70 C 60 90, 120 120, 140 160 C 150 180, 145 200, 130 220 L 110 205 C 125 180, 120 160, 90 130 C 60 100, 20 85, 10 75 Z" fill="url(#bloodRed2)" />
            {/* Top horizontal jagged stroke */}
            <path d="M 40 40 L 260 25 L 320 35 L 290 60 L 150 55 L 70 70 Z" fill="url(#bloodRed1)" opacity="0.9" />
            {/* Broad middle splash */}
            <path d="M 20 170 Q 70 190 120 230 Q 140 250 160 290 L 135 315 Q 110 270 70 240 Q 30 210 15 195 Z" fill="url(#bloodRed2)" />
            {/* Bottom horizontal blood accent */}
            <path d="M 20 280 L 120 270 L 100 295 L 30 310 Z" fill="url(#bloodRed1)" />
            {/* Right vertical slash */}
            <path d="M 310 80 Q 340 180 320 260 L 300 250 Q 320 190 295 110 Z" fill="url(#bloodRed2)" />
            {/* Fine red spatters */}
            <circle cx="95" cy="50" r="3.5" fill="#8A0000" />
            <circle cx="280" cy="95" r="2.5" fill="#8A0000" />
            <circle cx="55" cy="140" r="4" fill="#A2240B" />
            <circle cx="330" cy="220" r="3" fill="#8A0000" />
            <circle cx="170" cy="45" r="2" fill="#8A0000" />
            <circle cx="210" cy="330" r="4.5" fill="#8A0000" />
          </g>

          {/* 3. Anatomical Hands & Fingers Collage (Monochrome / Sepia-toned) */}
          <g id="hands-collage">
            {/* Large background hand reaching downwards */}
            <g id="bg-hand" opacity="0.88">
              <path d="M 130 50 C 130 50, 160 90, 175 140 C 190 190, 185 240, 170 270 C 160 290, 140 300, 120 290 C 100 280, 95 240, 105 190 C 115 140, 130 50, 130 50 Z" 
                    fill="#C4B8B4" stroke="#483C38" strokeWidth="1.5" />
              {/* Palm creases */}
              <path d="M 125 150 Q 155 170 165 210" fill="none" stroke="#5E4E49" strokeWidth="1.5" strokeDasharray="2,2" />
              <path d="M 115 180 Q 140 195 150 230" fill="none" stroke="#5E4E49" strokeWidth="1.2" />
            </g>

            {/* Left gloved hand holding syringe */}
            <g id="left-gloved-hand">
              {/* Wrist & sleeve */}
              <path d="M 40 340 L 70 230 C 75 220, 95 220, 105 235 L 125 290 L 80 355 Z" 
                    fill="#352B28" />
              {/* White surgical glove fingers */}
              <path d="M 85 235 C 90 205, 110 185, 130 190 C 145 195, 145 220, 130 240 L 110 260 Z" 
                    fill="#DDD5D1" stroke="#685853" strokeWidth="1.5" />
              <path d="M 115 200 C 125 180, 145 175, 155 190 C 160 200, 155 215, 140 225 Z" 
                    fill="#EFE9E6" stroke="#685853" strokeWidth="1.2" />
              {/* Small syringe held by left hand */}
              <g transform="rotate(-35 125 210)">
                <rect x="110" y="180" width="12" height="75" rx="3" fill="url(#glassShimmer)" stroke="#3A322F" strokeWidth="1.2" />
                <rect x="112" y="210" width="8" height="40" fill="url(#syringeBlood)" opacity="0.85" />
                <line x1="116" y1="180" x2="116" y2="140" stroke="#8A94A0" strokeWidth="1.5" />
                <polygon points="115,140 117,140 116,132" fill="#525E6B" />
              </g>
            </g>

            {/* Center Front Big Fingertips (Showing friction ridges & dermatoglyphics) */}
            <g id="center-fingers">
              {/* Index & Middle fingertips presented boldly */}
              {/* Left central finger */}
              <path d="M 140 280 C 130 250, 130 180, 150 150 C 165 125, 205 125, 220 155 C 235 185, 230 245, 215 285 C 200 320, 155 315, 140 280 Z" 
                    fill="#DDD2CD" stroke="#483B37" strokeWidth="2" />
              
              {/* Central Thumb with prominent fingerprint whorl texture */}
              <path d="M 175 295 C 160 260, 165 200, 185 170 C 205 140, 245 145, 260 180 C 275 215, 270 270, 250 305 C 230 340, 190 330, 175 295 Z" 
                    fill="#C9BCB6" stroke="#483B37" strokeWidth="2" />

              {/* Fingerprint Ridge Contours on Thumb */}
              <g opacity="0.75">
                <ellipse cx="225" cy="225" rx="28" ry="34" fill="none" stroke="#3D302C" strokeWidth="1.4" />
                <ellipse cx="225" cy="225" rx="22" ry="28" fill="none" stroke="#3D302C" strokeWidth="1.4" />
                <ellipse cx="225" cy="225" rx="16" ry="21" fill="none" stroke="#3D302C" strokeWidth="1.4" />
                <ellipse cx="225" cy="225" rx="10" ry="14" fill="none" stroke="#3D302C" strokeWidth="1.4" />
                <ellipse cx="225" cy="225" rx="5" ry="7" fill="none" stroke="#3D302C" strokeWidth="1.4" />
                {/* Ridge flows & Delta */}
                <path d="M 195 240 C 205 255, 230 265, 255 250" fill="none" stroke="#3D302C" strokeWidth="1.3" />
                <path d="M 190 220 C 195 240, 210 270, 240 275" fill="none" stroke="#3D302C" strokeWidth="1.3" />
                <path d="M 210 180 Q 225 170 240 180" fill="none" stroke="#3D302C" strokeWidth="1.3" />
              </g>

              {/* Fingernail detail */}
              <path d="M 170 170 Q 185 160 200 170" fill="none" stroke="#68554F" strokeWidth="1.5" />
            </g>

            {/* Right hand with fingers spread */}
            <g id="right-hand" opacity="0.92">
              <path d="M 240 100 C 265 110, 280 140, 290 190 C 300 240, 295 290, 280 320 L 320 330 C 340 280, 340 200, 315 130 C 300 90, 260 80, 240 100 Z" 
                    fill="#CFC4BF" stroke="#483B37" strokeWidth="1.5" />
              {/* Finger lines */}
              <path d="M 255 110 L 275 160" stroke="#5E4E49" strokeWidth="1.2" />
              <path d="M 275 125 L 290 175" stroke="#5E4E49" strokeWidth="1.2" />
            </g>
          </g>

          {/* 4. Dominant Vertical Medical Glass Syringe (Right-Center) */}
          <g id="main-syringe">
            {/* Needle at top */}
            <line x1="228" y1="10" x2="228" y2="85" stroke="#7A8793" strokeWidth="2.5" />
            <polygon points="226,10 230,10 228,0" fill="#4B5663" />
            {/* Needle Hub Luer-Lok */}
            <rect x="223" y="85" width="10" height="15" rx="2" fill="#B0BEC5" stroke="#37474F" strokeWidth="1.2" />

            {/* Glass Barrel */}
            <rect x="216" y="100" width="24" height="170" rx="4" fill="url(#glassShimmer)" stroke="#263238" strokeWidth="2" />

            {/* Blood Level inside barrel */}
            <rect x="218" y="190" width="20" height="78" fill="url(#syringeBlood)" opacity="0.9" />

            {/* Milliliter Measurement Graduations */}
            <g stroke="#1A2026" strokeWidth="1.2" opacity="0.8">
              <line x1="218" y1="120" x2="228" y2="120" />
              <text x="230" y="123" fontSize="8" fontFamily="sans-serif" fontWeight="bold" fill="#201A19">0.5</text>
              <line x1="218" y1="135" x2="225" y2="135" />
              <line x1="218" y1="150" x2="228" y2="150" />
              <text x="230" y="153" fontSize="9" fontFamily="sans-serif" fontWeight="bold" fill="#201A19">1.0</text>
              <line x1="218" y1="165" x2="225" y2="165" />
              <line x1="218" y1="180" x2="228" y2="180" />
              <text x="230" y="183" fontSize="9" fontFamily="sans-serif" fontWeight="bold" fill="#201A19">1.5</text>
              <line x1="218" y1="195" x2="225" y2="195" />
              <line x1="218" y1="210" x2="228" y2="210" />
              <text x="230" y="213" fontSize="9" fontFamily="sans-serif" fontWeight="bold" fill="#FFFFFF">2.0</text>
              {/* BD Manufacturer Brand Stamp */}
              <text x="228" y="240" fontSize="10" fontFamily="sans-serif" fontWeight="900" fill="#FFFFFF" textAnchor="middle">BD</text>
            </g>

            {/* Black Rubber Plunger Head */}
            <rect x="217" y="265" width="22" height="12" rx="2" fill="#1C1817" />
            {/* Plunger Shaft */}
            <rect x="225" y="277" width="6" height="60" fill="#ECEFF1" stroke="#37474F" strokeWidth="1.2" />
            {/* Plunger Thumb Press Ring */}
            <ellipse cx="228" cy="337" rx="14" ry="4" fill="#CFD8DC" stroke="#37474F" strokeWidth="1.5" />
          </g>

          {/* 5. Additional Syringes on Top and Left */}
          {/* Needle piercing from top-left */}
          <g transform="rotate(25 80 50)">
            <line x1="80" y1="10" x2="80" y2="90" stroke="#7A8793" strokeWidth="2" />
            <rect x="76" y="90" width="8" height="50" fill="url(#glassShimmer)" stroke="#263238" strokeWidth="1.2" />
          </g>
          {/* Syringe on top right */}
          <g transform="rotate(-15 300 40)">
            <line x1="300" y1="15" x2="300" y2="75" stroke="#7A8793" strokeWidth="2" />
            <rect x="296" y="75" width="8" height="40" fill="url(#glassShimmer)" stroke="#263238" strokeWidth="1.2" />
          </g>

          {/* 6. Subtle Vignette & Frame Border */}
          <rect width="360" height="360" rx="20" fill="none" stroke="rgba(138, 0, 0, 0.12)" strokeWidth="2" />
        </svg>
      )}
    </div>
  );
};

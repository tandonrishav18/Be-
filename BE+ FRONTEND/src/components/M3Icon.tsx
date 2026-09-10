import React from 'react';
import { 
  Home, 
  FlaskConical, 
  FileText, 
  User, 
  Link2, 
  ArrowLeft, 
  Check, 
  X, 
  Search, 
  Trash2, 
  Share2, 
  Download, 
  Sparkles, 
  Fingerprint, 
  Activity, 
  HelpCircle,
  AlertCircle,
  Camera,
  Upload,
  RefreshCw,
  Plus,
  Sliders,
  Settings,
  ShieldCheck,
  Cpu,
  ChevronRight
} from 'lucide-react';

interface M3IconProps {
  name: string;
  filled?: boolean;
  size?: number;
  className?: string;
}

export const M3Icon: React.FC<M3IconProps> = ({ 
  name, 
  filled = false, 
  size = 24, 
  className = '' 
}) => {
  // Try to render standard Material Symbols Rounded font icon
  // with fallback to lucide-react icon
  return (
    <span 
      className={`inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <span 
        className={`material-symbols-rounded ${filled ? 'filled' : 'outlined'}`}
        style={{ fontSize: `${size}px`, lineHeight: 1 }}
        aria-hidden="true"
      >
        {name}
      </span>
    </span>
  );
};

// Lucide icon helper mapping for guaranteed crisp render if needed
export const FallbackIcon: React.FC<{ name: string; size?: number; className?: string }> = ({ name, size = 24, className = '' }) => {
  switch (name) {
    case 'home':
      return <Home size={size} className={className} />;
    case 'experiment':
    case 'science':
      return <FlaskConical size={size} className={className} />;
    case 'draft':
    case 'description':
      return <FileText size={size} className={className} />;
    case 'person':
      return <User size={size} className={className} />;
    case 'chevron_right':
      return <ChevronRight size={size} className={className} />;
    case 'link_2':
    case 'link':
      return <Link2 size={size} className={className} />;
    case 'arrow_back':
      return <ArrowLeft size={size} className={className} />;
    case 'check':
      return <Check size={size} className={className} />;
    case 'close':
      return <X size={size} className={className} />;
    case 'fingerprint':
      return <Fingerprint size={size} className={className} />;
    case 'search':
      return <Search size={size} className={className} />;
    case 'delete':
      return <Trash2 size={size} className={className} />;
    case 'share':
      return <Share2 size={size} className={className} />;
    case 'download':
      return <Download size={size} className={className} />;
    case 'camera':
      return <Camera size={size} className={className} />;
    case 'upload':
      return <Upload size={size} className={className} />;
    case 'refresh':
      return <RefreshCw size={size} className={className} />;
    case 'add':
      return <Plus size={size} className={className} />;
    case 'tune':
      return <Sliders size={size} className={className} />;
    case 'settings':
      return <Settings size={size} className={className} />;
    case 'verified':
      return <ShieldCheck size={size} className={className} />;
    default:
      return <Activity size={size} className={className} />;
  }
};

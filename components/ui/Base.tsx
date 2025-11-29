import React from 'react';
import { ExternalLink } from 'lucide-react';

// "Cloud Glass" Card - White, soft, airy
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_40px_-12px_rgba(14,165,233,0.15)] border border-white p-6 sm:p-8 ${className}`}>
    {children}
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' | 'soft' }> = ({ 
  className = '', 
  variant = 'primary', 
  children,
  ...props 
}) => {
  const baseStyles = "w-full rounded-2xl py-4 px-6 text-[15px] font-bold flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] tracking-wide";
  const variants = {
    // Sky Gradient Button
    primary: "bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-200 hover:shadow-sky-300 hover:-translate-y-0.5 border border-transparent",
    soft: "bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-100",
    ghost: "bg-transparent text-slate-400 hover:text-sky-600 hover:bg-sky-50/50",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100"
  };
  
  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const BigOptionButton: React.FC<{ 
  icon?: React.ElementType; 
  title: string; 
  subtitle?: string; 
  selected?: boolean; 
  onClick: () => void;
}> = ({ icon: Icon, title, subtitle, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 group relative overflow-hidden ${
      selected 
        ? 'border-sky-400 bg-sky-50/80 shadow-sm' 
        : 'border-slate-100 bg-white hover:border-sky-200 hover:bg-slate-50/50'
    }`}
  >
    {Icon && (
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm ${
        selected ? 'bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-sky-200' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-sky-500 group-hover:shadow-md'
      }`}>
        <Icon size={22} />
      </div>
    )}
    <div className="relative z-10">
      <div className={`text-base font-bold ${selected ? 'text-sky-900' : 'text-slate-800'}`}>{title}</div>
      {subtitle && <div className="text-sm text-slate-600 mt-1 font-semibold">{subtitle}</div>}
    </div>
    
    {selected && (
        <div className="ml-auto text-sky-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        </div>
    )}
  </button>
);

export const ExternalLinkButton: React.FC<{ 
    icon: React.ElementType; 
    title: string; 
    subtitle?: string; 
    href: string;
    colorClass?: string;
    onClick?: () => void;
  }> = ({ icon: Icon, title, subtitle, href, colorClass = 'bg-slate-100 text-slate-600', onClick }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="w-full text-left p-4 rounded-2xl border-2 border-slate-100 bg-white hover:border-sky-200 hover:bg-slate-50/50 transition-all duration-200 flex items-center gap-4 group no-underline"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${colorClass}`}>
        <Icon size={22} />
      </div>
      <div className="flex-1">
        <div className="text-base font-bold text-slate-900 flex items-center gap-2">
            {title}
            <ExternalLink size={14} className="text-slate-400" />
        </div>
        {subtitle && <div className="text-sm text-slate-600 mt-1 font-semibold">{subtitle}</div>}
      </div>
    </a>
  );

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string }> = ({ label, hint, className = '', ...props }) => (
  <div className="mb-5 w-full">
    {label && <label className="block text-base font-bold text-slate-800 mb-2 ml-1">{label}</label>}
    <input 
      className={`w-full rounded-2xl border-2 border-slate-100 px-4 py-3.5 text-base text-slate-900 font-medium outline-none transition-all focus:border-sky-400 bg-slate-50 focus:bg-white focus:shadow-lg focus:shadow-sky-100 placeholder:text-slate-400 ${className}`}
      {...props}
    />
    {hint && <p className="text-sm text-slate-600 mt-1.5 ml-1 font-medium">{hint}</p>}
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }> = ({ label, className = '', children, ...props }) => (
  <div className="mb-5 w-full">
    {label && <label className="block text-base font-bold text-slate-800 mb-2 ml-1">{label}</label>}
    <div className="relative">
      <select 
        className={`w-full appearance-none rounded-2xl border-2 border-slate-100 px-4 py-3.5 text-base text-slate-900 font-medium outline-none transition-all focus:border-sky-400 bg-slate-50 focus:bg-white focus:shadow-lg focus:shadow-sky-100 ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  </div>
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="mb-5 w-full">
    {label && <label className="block text-base font-bold text-slate-800 mb-2 ml-1">{label}</label>}
    <textarea 
      className={`w-full rounded-2xl border-2 border-slate-100 px-4 py-3.5 text-base text-slate-900 font-medium outline-none transition-all focus:border-sky-400 bg-slate-50 focus:bg-white focus:shadow-lg focus:shadow-sky-100 min-h-[120px] resize-none ${className}`}
      {...props}
    />
  </div>
);

export const Chip: React.FC<{ 
  label: string; 
  active: boolean; 
  onClick: () => void 
}> = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-xl px-4 py-2.5 text-sm font-bold border transition-all duration-200 ${
      active 
        ? 'bg-sky-500 border-sky-500 text-white shadow-md shadow-sky-200' 
        : 'bg-white border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-600'
    }`}
  >
    {label}
  </button>
);

export const ChipGroup: React.FC<{ label?: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="mb-6 w-full">
    {label && <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">{label}</label>}
    <div className="flex flex-wrap gap-2">
      {children}
    </div>
  </div>
);
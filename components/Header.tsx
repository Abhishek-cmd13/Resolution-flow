import React from 'react';
import { CloudSun } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="flex flex-col items-center justify-center mb-4">
      <div className="flex items-center gap-2 mb-1">
        <CloudSun size={28} className="text-white drop-shadow-md" />
        <h1 className="text-2xl font-bold text-slate-800/90 leading-tight tracking-tight drop-shadow-sm">Riverline</h1>
      </div>
      <p className="text-xs text-slate-600/80 font-medium tracking-wide">Resolution Flow</p>
    </header>
  );
};
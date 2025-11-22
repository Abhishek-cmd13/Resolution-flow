import React from 'react';
import { CloudSun } from 'lucide-react';
import { BorrowerProfile } from '../types';

interface HeaderProps {
  borrower?: BorrowerProfile;
}

export const Header: React.FC<HeaderProps> = ({ borrower }) => {
  return (
    <header className="flex flex-col items-center justify-center mb-4">
      <div className="flex items-center gap-2 mb-1">
        <CloudSun size={32} className="text-white drop-shadow-lg" />
        <h1 className="text-3xl font-bold text-white leading-tight tracking-tight drop-shadow-md">Riverline</h1>
      </div>
      {borrower?.name && (
        <p className="text-base text-white font-bold mt-1.5 drop-shadow-sm">Hi, {borrower.name}!</p>
      )}
    </header>
  );
};
import React from 'react';
import { Step } from '../types';

interface Props {
  step: Step;
}

export const ProgressBar: React.FC<Props> = ({ step }) => {
  return (
    <div className="flex gap-2 mb-6 px-1 justify-center">
      <div className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${step >= 1 ? 'w-8 bg-sky-500' : 'w-2 bg-white/50'}`} />
      <div className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${step >= 2 ? 'w-8 bg-sky-500' : 'w-2 bg-white/50'}`} />
      <div className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${step >= 3 ? 'w-8 bg-sky-500' : 'w-2 bg-white/50'}`} />
    </div>
  );
};
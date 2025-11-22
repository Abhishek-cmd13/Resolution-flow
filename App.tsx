import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ProgressBar } from './components/ProgressBar';
import { IntentSelection } from './components/IntentSelection';
import { DetailsForm } from './components/DetailsForm';
import { Summary } from './components/Summary';
import { Intent, Step, FormData } from './types';
import { Card } from './components/ui/Base';

function App() {
  const [step, setStep] = useState<Step>(1);
  const [intent, setIntent] = useState<Intent | null>(null);
  const [formData, setFormData] = useState<FormData>({});

  // detailed logging
  useEffect(() => {
    console.log(`[App State Update] Step: ${step}, Intent: ${intent || 'None'}`);
    if (Object.keys(formData).length > 0) {
      console.log('[App Data Update]', formData);
    }
  }, [step, intent, formData]);

  const handleIntentSelect = (selectedIntent: Intent) => {
    console.log(`[User Action] Selected Intent: ${selectedIntent}`);
    setIntent(selectedIntent);
    setStep(2);
  };

  const handleFormSubmit = (data: FormData) => {
    console.log('[User Action] Form Submitted', data);
    setFormData(data);
    setStep(3);
  };

  const handleBack = () => {
    console.log('[User Action] Navigate Back');
    setStep(1);
    setIntent(null);
  };

  const handleReset = () => {
    console.log('[User Action] Reset Application');
    setStep(1);
    setIntent(null);
    setFormData({});
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 font-sans text-slate-900 overflow-hidden">
      
      {/* Anime Sky Background - Deep Vibrant Blue to Soft Cyan - Clean, No Clouds */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#2b92ff] via-[#6ec1ff] to-[#c4e6ff] z-0" />
      
      {/* Sun - Soft & Dreamy (Subtle) */}
      <div className="fixed top-[5%] right-[8%] w-24 h-24 bg-[#fffceb] rounded-full shadow-[0_0_60px_30px_rgba(255,255,255,0.4),0_0_100px_60px_rgba(255,215,0,0.15)] z-0 blur-[2px] opacity-90" />

      {/* Faint Sun Glare */}
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-b from-white/10 to-transparent rounded-full blur-3xl z-0 opacity-40 pointer-events-none" />

      {/* Main Content */}
      <div className="w-full max-w-[440px] mx-auto relative z-10">
        
        <div className="mb-6 text-center">
           <Header />
        </div>

        {step < 3 && <ProgressBar step={step} />}

        <main>
            {step === 1 && (
              <IntentSelection onSelect={handleIntentSelect} />
            )}
            
            {step === 2 && intent && (
              <Card className="min-h-[400px] flex flex-col relative overflow-hidden transition-all duration-500 ease-out">
                {/* Subtle glow inside card */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <DetailsForm 
                  intent={intent} 
                  initialData={formData}
                  onSubmit={handleFormSubmit}
                  onBack={handleBack}
                />
              </Card>
            )}
            
            {step === 3 && intent && (
              <Summary intent={intent} data={formData} onReset={handleReset} />
            )}
        </main>

        <div className="mt-8 text-center">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-[10px] text-slate-800/60 font-bold uppercase tracking-wider shadow-sm">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
             Secure & Private
           </div>
        </div>

      </div>
    </div>
  );
}

export default App;
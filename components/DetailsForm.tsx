
import React, { useState, useEffect } from 'react';
import { Intent, FormData, BorrowerProfile } from '../types';
import { Button, Input, BigOptionButton, ExternalLinkButton, Textarea } from './ui/Base';
import { ArrowLeft, CreditCard, Smartphone, HeartHandshake, Phone, Calendar, MessageCircle, ShieldCheck, TrendingUp, Wallet, Clock, Briefcase, AlertTriangle, HelpCircle, CheckCircle, Trophy } from 'lucide-react';

interface Props {
  intent: Intent;
  initialData: FormData;
  onSubmit: (data: FormData) => void;
  onBack: () => void;
  borrower?: BorrowerProfile;
}

// External Links Config
const LINKS = {
  WHATSAPP: "https://wa.me/919008457659?text=Hi%20Riverline%20Team%2C%20I%20need%20some%20help%20regarding%20my%20loan.%20Can%20you%20please%20guide%20me%20on%20the%20next%20steps%3F",
  CALL: "tel:919008457659",
  CALENDAR: "https://cal.com/abhishek-gupta-13/debt-counselling"
};

export const DetailsForm: React.FC<Props> = ({ intent, initialData, onSubmit, onBack, borrower }) => {
  const [data, setData] = useState<FormData>(initialData);
  const [internalStep, setInternalStep] = useState(1);
  
  // Use borrower data from token or defaults
  const TOTAL_DUE = borrower?.amount ? parseInt(borrower.amount) : 14500;
  // Maximum is the pending_amount (closure amount)
  const MAX_SETTLEMENT = borrower?.max_settlement ? parseInt(borrower.max_settlement) : TOTAL_DUE;
  // Minimum is the settlement_amount from token
  const MIN_SETTLEMENT = borrower?.min_settlement ? parseInt(borrower.min_settlement) : Math.floor(MAX_SETTLEMENT * 0.6);
  
  // Debug logging
  useEffect(() => {
    console.log('[DetailsForm] Borrower data received:', borrower);
    console.log('[DetailsForm] Calculated values:', {
      TOTAL_DUE,
      MAX_SETTLEMENT,
      MIN_SETTLEMENT,
      borrower_amount: borrower?.amount,
      borrower_max_settlement: borrower?.max_settlement
    });
  }, [borrower, TOTAL_DUE, MAX_SETTLEMENT, MIN_SETTLEMENT]);
  
  const [sliderValue, setSliderValue] = useState<number>(MAX_SETTLEMENT);

  // Initialize slider value if data exists, otherwise default to max settlement
  useEffect(() => {
    if (intent === Intent.REQUEST_SETTLEMENT) {
        if (data.settlementAmount) {
            const savedValue = parseInt(data.settlementAmount);
            setSliderValue(savedValue);
        } else {
            setSliderValue(MAX_SETTLEMENT);
        }
    }
  }, [intent, MAX_SETTLEMENT, data.settlementAmount, borrower]);
  
  // Force re-render when slider value changes to ensure closure check updates
  useEffect(() => {
    if (intent === Intent.REQUEST_SETTLEMENT) {
      const currentValue = Math.round(Number(sliderValue));
      const maxValue = Math.round(Number(MAX_SETTLEMENT));
      const isClosure = currentValue === maxValue;
      // This effect ensures React knows to re-render when sliderValue changes
    }
  }, [sliderValue, MAX_SETTLEMENT, intent]);

  const update = (key: keyof FormData, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const next = () => setInternalStep(s => s + 1);
  const prev = () => setInternalStep(s => s > 1 ? s - 1 : 1);

  // Helper to calculate future dates
  const getFutureDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const renderFormContent = () => {
    // --- MAKE PAYMENT ---
    if (intent === Intent.MAKE_PAYMENT) {
      if (internalStep === 1) {
        return (
          <div className="animate-fade-in-right">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Let's clear this up.</h3>
            <p className="text-slate-700 mb-6 text-base font-semibold">Choose an amount to pay today.</p>
            
            {/* Show total outstanding if from token */}
            {borrower?.amount && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-600">Total Outstanding</span>
                  <span className="text-2xl font-bold text-slate-900">₹{TOTAL_DUE.toLocaleString()}</span>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <BigOptionButton 
                title="Full Outstanding" 
                subtitle={`₹ ${TOTAL_DUE.toLocaleString()} (Closes account)`}
                selected={data.payAmountType === 'full'}
                onClick={() => { update('payAmountType', 'full'); next(); }}
              />
              <BigOptionButton 
                title="Current EMI" 
                subtitle="₹ 4,200 (Updates status)"
                selected={data.payAmountType === 'emi'}
                onClick={() => { update('payAmountType', 'emi'); next(); }}
              />
              <BigOptionButton 
                title="Enter Custom Amount" 
                subtitle="Pay what you can"
                selected={data.payAmountType === 'custom'}
                onClick={() => { update('payAmountType', 'custom'); next(); }}
              />
            </div>
          </div>
        );
      }
      if (internalStep === 2) {
        return (
          <div className="animate-fade-in-right">
            {data.payAmountType === 'custom' && (
               <div className="mb-6">
                 <Input 
                  label="Amount to pay (₹)"
                  type="number" 
                  placeholder="e.g. 5000" 
                  value={data.payCustomAmount || ''} 
                  onChange={e => update('payCustomAmount', e.target.value)}
                  autoFocus
                  className="text-lg font-bold text-sky-600"
                />
               </div>
            )}
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Preferred Mode</h3>
            <div className="space-y-3">
               <BigOptionButton 
                icon={Smartphone}
                title="UPI" 
                subtitle="GPay, PhonePe, Paytm"
                selected={data.payMode === 'upi'}
                onClick={() => update('payMode', 'upi')}
              />
               <BigOptionButton 
                icon={CreditCard}
                title="Card / Netbanking" 
                subtitle="Debit / Credit Card"
                selected={data.payMode === 'card'}
                onClick={() => update('payMode', 'card')}
              />
            </div>
            <div className="mt-8">
              <Button onClick={() => onSubmit(data)}>Review & Proceed</Button>
            </div>
          </div>
        );
      }
    }

    // --- SETTLEMENT (GAMIFIED SLIDER) ---
    if (intent === Intent.REQUEST_SETTLEMENT) {
      // Closure only happens at exact pending amount (MAX_SETTLEMENT)
      // Convert both to integers for exact comparison
      const currentValue = Math.round(Number(sliderValue));
      const maxValue = Math.round(Number(MAX_SETTLEMENT));
      // Use exact equality - closure only at max value
      const isFullClosure = currentValue === maxValue;
      const savings = maxValue - currentValue;
      
      const themeBg = isFullClosure ? 'bg-emerald-50' : 'bg-amber-50';
      const themeBorder = isFullClosure ? 'border-emerald-100' : 'border-amber-100';
      const themeText = isFullClosure ? 'text-emerald-700' : 'text-amber-700';
      const themeIconBg = isFullClosure ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600';

      return (
        <div className="animate-fade-in-right pb-4">
           <h3 className="text-2xl font-bold text-slate-900 mb-2">
             {isFullClosure ? 'Negotiate Closure' : 'Negotiate Settlement'}
           </h3>
           <p className="text-slate-700 mb-6 text-base font-semibold">Slide to adjust your offer.</p>

           {/* Total Outstanding Display */}
           <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6">
             <div className="flex justify-between items-center">
               <span className="text-sm font-semibold text-slate-600">Total Outstanding</span>
               <span className="text-2xl font-bold text-slate-900">₹{TOTAL_DUE.toLocaleString()}</span>
             </div>
           </div>

           {/* The Slider Section */}
           <div className="mb-8 relative px-2">
             <div className="flex justify-between items-center mb-2">
               <div className="flex gap-2 text-sm font-bold text-slate-600 uppercase tracking-wider">
                 <span>Min: ₹{MIN_SETTLEMENT.toLocaleString()}</span>
                 <span className="mx-2">|</span>
                 <span>Max: ₹{MAX_SETTLEMENT.toLocaleString()}</span>
               </div>
               {!isFullClosure && (
                 <button
                   onClick={() => {
                     setSliderValue(MAX_SETTLEMENT);
                     update('settlementAmount', MAX_SETTLEMENT.toString());
                   }}
                   className="text-xs font-bold text-emerald-600 hover:text-emerald-700 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all"
                 >
                   Set to Closure
                 </button>
               )}
             </div>
             
             <input 
               type="range" 
               min={MIN_SETTLEMENT} 
               max={MAX_SETTLEMENT} 
               step={Math.min(100, Math.floor((MAX_SETTLEMENT - MIN_SETTLEMENT) / 100) || 1)}
               value={sliderValue}
               onChange={(e) => {
                   const val = parseInt(e.target.value);
                   setSliderValue(val);
                   update('settlementAmount', val.toString());
               }}
               onMouseUp={(e) => {
                   // Ensure slider snaps to max if very close
                   const val = parseInt((e.target as HTMLInputElement).value);
                   if (Math.abs(val - MAX_SETTLEMENT) < 50) {
                       setSliderValue(MAX_SETTLEMENT);
                       update('settlementAmount', MAX_SETTLEMENT.toString());
                   }
               }}
               className={`w-full h-4 rounded-full appearance-none cursor-pointer shadow-inner transition-all duration-300 ${isFullClosure ? 'bg-emerald-100' : 'bg-amber-100'}`}
               style={{
                 backgroundImage: `linear-gradient(to right, ${isFullClosure ? '#10b981' : '#f59e0b'} 0%, ${isFullClosure ? '#10b981' : '#f59e0b'} ${(sliderValue - MIN_SETTLEMENT)/(MAX_SETTLEMENT - MIN_SETTLEMENT)*100}%, transparent ${(sliderValue - MIN_SETTLEMENT)/(MAX_SETTLEMENT - MIN_SETTLEMENT)*100}%)`
               }}
             />
             
             <div className="text-center mt-4">
                <div className={`text-4xl font-extrabold transition-colors duration-300 ${isFullClosure ? 'text-emerald-700' : 'text-amber-700'}`}>
                    ₹ {sliderValue.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600 font-semibold mt-2">
                  {isFullClosure ? 'Proposed Closure Amount' : 'Proposed Settlement Amount'}
                </div>
             </div>
           </div>

           {/* Dynamic Feedback Card */}
           <div className={`rounded-2xl p-5 border transition-all duration-500 ${themeBg} ${themeBorder}`}>
              <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-colors duration-500 ${themeIconBg}`}>
                      {isFullClosure ? <TrendingUp size={20} /> : <Wallet size={20} />}
                  </div>
                  <div>
                      {isFullClosure && (
                        <h4 className={`font-bold text-base mb-2 transition-colors duration-500 ${themeText}`}>
                            Excellent Decision!
                        </h4>
                      )}
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">
                          {isFullClosure 
                            ? `Paying ₹${MAX_SETTLEMENT.toLocaleString()} (full outstanding of ₹${TOTAL_DUE.toLocaleString()}) protects your CIBIL score and increases probability of getting loan in future.`
                            : `You are saving ₹${savings.toLocaleString()} on this loan (outstanding: ₹${TOTAL_DUE.toLocaleString()}). However, "Settled" status may lower your credit score.`
                          }
                      </p>
                  </div>
              </div>
           </div>

           <div className="mt-6 space-y-3">
              <Button 
                onClick={() => {
                    // Submit to move to summary page
                    onSubmit({...data, settlementAmount: sliderValue.toString()});
                }}
                className={isFullClosure ? "from-emerald-500 to-green-600 shadow-emerald-200" : "from-amber-500 to-orange-600 shadow-amber-200"}
              >
                  Review & Proceed
              </Button>
           </div>
        </div>
      );
    }

    // --- UNKNOWN LOAN ---
    if (intent === Intent.UNKNOWN_LOAN) {
      return (
        <div className="animate-fade-in-right">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Loan Details</h3>
          
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600 text-base font-semibold">Lender</span>
              <span className="font-bold text-slate-900 text-base">{borrower?.lender || 'ABC Finance Ltd'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 text-base font-semibold">Account No</span>
              <span className="font-bold text-slate-900 text-base">{borrower?.account || 'XXXX-9821'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 text-base font-semibold">Loan Amount</span>
              <span className="font-bold text-slate-900 text-base">₹ {TOTAL_DUE.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 text-base font-semibold">Disbursal Date</span>
              <span className="font-bold text-slate-900 text-base">12 Jan 2023</span>
            </div>
          </div>

          <h4 className="font-bold text-slate-800 mb-3 text-sm">Does this look familiar?</h4>
          <div className="space-y-3">
            <BigOptionButton 
              title="Yes, I remember now" 
              onClick={() => onBack()}
            />
             <BigOptionButton 
              title="No, this isn't mine" 
              subtitle="Report as incorrect mapping"
              onClick={() => onSubmit({ ...data, fraudText: 'Loan mapping incorrect' })}
            />
          </div>
        </div>
      );
    }

    // --- NEED TIME (FUTURE PAYMENT FLOW V2) ---
    if (intent === Intent.NEED_TIME) {
        // Step 1: Intro Ack
        if (internalStep === 1) {
            return (
                <div className="animate-fade-in-right">
                    <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                        <HeartHandshake size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">We understand.</h3>
                    <p className="text-slate-700 text-base font-semibold leading-relaxed mb-8">
                        Many borrowers face temporary financial issues. Let's plan a realistic way forward that works for you.
                    </p>
                    <Button onClick={() => next()}>Continue</Button>
                </div>
            );
        }
        
        // Step 2: Reason Picker
        if (internalStep === 2) {
            return (
                <div className="animate-fade-in-right">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">What is the main reason?</h3>
                    <p className="text-slate-700 text-sm mb-6 font-semibold">This helps us categorize your request.</p>
                    <div className="space-y-2">
                        {[
                            { id: 'salary_delay', icon: Clock, label: 'Salary delayed' },
                            { id: 'job_loss', icon: Briefcase, label: 'Job loss / reduced income' },
                            { id: 'medical_issue', icon: AlertTriangle, label: 'Medical or family issue' },
                            { id: 'business_issue', icon: TrendingUp, label: 'Business slowdown' },
                            { id: 'unexpected_expense', icon: Wallet, label: 'Unexpected expenses' },
                            { id: 'no_comment', icon: HelpCircle, label: 'Prefer not to say' }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => { update('needTimeReason', opt.id); next(); }}
                                className="w-full p-4 rounded-2xl border border-slate-100 bg-white hover:bg-sky-50 hover:border-sky-200 flex items-center gap-3 transition-all text-left group"
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-500 group-hover:bg-white group-hover:text-sky-600 flex items-center justify-center shrink-0 transition-colors">
                                    <opt.icon size={18} />
                                </div>
                                <span className="font-bold text-slate-700 text-sm">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            );
        }

        // Step 3: Timeline Picker
        if (internalStep === 3) {
             return (
                <div className="animate-fade-in-right">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">When can you pay?</h3>
                    <p className="text-slate-700 text-sm mb-6 font-semibold">We'll verify this date with the lender.</p>
                    <div className="space-y-3">
                        <BigOptionButton 
                            title="In 3 days" 
                            subtitle={`Approx ${new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString('en-GB', {day:'numeric', month:'short'})}`}
                            onClick={() => { update('ptpDate', getFutureDate(3)); setInternalStep(5); }} // Jump to Payment Confirmation
                        />
                        <BigOptionButton 
                            title="In 7 days" 
                            subtitle={`Approx ${new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString('en-GB', {day:'numeric', month:'short'})}`}
                            onClick={() => { update('ptpDate', getFutureDate(7)); setInternalStep(5); }} // Jump to Payment Confirmation
                        />
                        <BigOptionButton 
                            title="In 1 month" 
                            subtitle={`Approx ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('en-GB', {day:'numeric', month:'short'})}`}
                            onClick={() => { update('ptpDate', getFutureDate(30)); setInternalStep(5); }} // Jump to Payment Confirmation
                        />
                        <BigOptionButton 
                            title="On salary date" 
                            subtitle="Choose a specific date"
                            onClick={() => setInternalStep(4)} // Jump to Salary Date Picker
                        />
                        <BigOptionButton 
                            title="Not sure" 
                            subtitle="I can't commit right now"
                            onClick={() => setInternalStep(10)} // Jump to Not Sure Path
                        />
                    </div>
                </div>
             );
        }

        // Step 4: Salary Date Picker
        if (internalStep === 4) {
            return (
                <div className="animate-fade-in-right">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Select salary date</h3>
                    <Input 
                        type="date"
                        label="Expected Date"
                        onChange={(e) => update('ptpDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                    />
                    <Button 
                        disabled={!data.ptpDate}
                        onClick={() => setInternalStep(5)}
                    >
                        Continue
                    </Button>
                </div>
            );
        }

        // Step 5: Payment Confirmation (Amount + Date)
        if (internalStep === 5) {
            return (
                <div className="animate-fade-in-right">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Payment Confirmation</h3>
                    
                    <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100 mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Calendar size={20} className="text-sky-600" />
                            <span className="text-sm font-bold text-sky-900">Commitment Date</span>
                        </div>
                        <div className="text-lg font-bold text-slate-800 ml-8">
                            {data.ptpDate ? new Date(data.ptpDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not selected'}
                        </div>
                    </div>

                    <Input 
                        label="Enter the amount you will pay"
                        type="number"
                        placeholder={`Total Due: ₹${TOTAL_DUE}`}
                        value={data.ptpAmount || ''}
                        onChange={(e) => update('ptpAmount', e.target.value)}
                    />

                    <Button 
                        disabled={!data.ptpAmount} 
                        onClick={() => onSubmit(data)} // Goes to Summary -> Save Contact
                    >
                        Confirm Commitment
                    </Button>
                </div>
            );
        }

        // Step 10: Not Sure Path
        if (internalStep === 10) {
            return (
                <div className="animate-fade-in-right">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">We can help you plan.</h3>
                    <p className="text-slate-700 text-base mb-6 font-semibold">Would you like to speak to an advisor to figure out a long-term solution?</p>
                    
                    <div className="space-y-3">
                        <BigOptionButton 
                            title="Talk to an advisor" 
                            subtitle="Schedule a call"
                            onClick={() => { update('notSureChoice', 'advisor'); setInternalStep(11); }}
                        />
                        <BigOptionButton 
                            title="Prefer not to talk" 
                            subtitle="Just save my request"
                            onClick={() => { update('notSureChoice', 'no_talk'); onSubmit(data); }}
                        />
                    </div>
                </div>
            );
        }

        // Step 11: Advisor Scheduler
        if (internalStep === 11) {
            return (
                <div className="animate-fade-in-right">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Schedule Callback</h3>
                    <Input 
                        type="datetime-local"
                        label="Choose a convenient time"
                        onChange={(e) => update('callbackTime', e.target.value)}
                    />
                    <Button 
                        disabled={!data.callbackTime}
                        onClick={() => onSubmit(data)}
                    >
                        Confirm Schedule
                    </Button>
                </div>
            );
        }
    }

    // --- TALK TO ADVISOR ---
    if (intent === Intent.TALK_TO_ADVISOR) {
         return (
             <div className="animate-fade-in-right">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">We're here to help.</h3>
                <p className="text-slate-700 mb-6 text-base font-semibold">Choose how you'd like to connect with us.</p>

                <div className="space-y-3">
                    <ExternalLinkButton 
                        href={LINKS.WHATSAPP}
                        icon={MessageCircle}
                        title="Chat on WhatsApp"
                        subtitle="Fastest response"
                        colorClass="bg-emerald-100 text-emerald-600"
                    />
                    <ExternalLinkButton 
                        href={LINKS.CALL}
                        icon={Phone}
                        title="Call Support"
                        subtitle="+91 90084 57659"
                        colorClass="bg-blue-100 text-blue-600"
                    />
                    <ExternalLinkButton 
                        href={LINKS.CALENDAR}
                        icon={Calendar}
                        title="Book a Slot"
                        subtitle="Schedule a debt counselling session"
                        colorClass="bg-violet-100 text-violet-600"
                    />
                </div>
             </div>
         );
    }

    // --- GENERIC FALLBACK (Docs, Fraud, Paid) ---
    return (
      <div className="animate-fade-in-right">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Just a few details</h3>
        <p className="text-slate-700 mb-6 text-base font-semibold">So we can process your request immediately.</p>
        
        {intent === Intent.ALREADY_PAID && (
          <>
            <Input 
              label="Amount Paid" 
              type="number" 
              value={data.paidAmount || ''} 
              onChange={e => update('paidAmount', e.target.value)}
            />
            <Input 
              label="Date" 
              type="date" 
              value={data.paidDate || ''} 
              onChange={e => update('paidDate', e.target.value)}
            />
             <Input 
              label="UTR / Reference No. (Optional)" 
              type="text" 
              value={data.paidUtr || ''} 
              onChange={e => update('paidUtr', e.target.value)}
            />
          </>
        )}

        {intent === Intent.DOCUMENTS && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">Which document do you need?</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {['NOC (Draft)', 'Statement', 'Closure Letter'].map(doc => (
                  <button
                    key={doc}
                    onClick={() => update('docType', doc)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border ${data.docType === doc ? 'bg-sky-500 text-white border-sky-500' : 'bg-white text-slate-500 border-slate-200'}`}
                  >
                    {doc}
                  </button>
                ))}
              </div>
              <Input 
                label="Email ID" 
                type="email" 
                placeholder="name@example.com"
                value={data.docEmail || ''} 
                onChange={e => update('docEmail', e.target.value)}
              />
            </div>
        )}

        {intent === Intent.FRAUD_CONCERN && (
            <div className="space-y-4">
             <Textarea 
              label="Describe your concern"
              value={data.fraudText || ''}
              onChange={e => update('fraudText', e.target.value)}
              placeholder="e.g. I never took this loan, or the amount is wrong..."
            />
            <div className="pt-2">
                <p className="text-sm text-slate-600 mb-2 font-semibold text-center">Or verify directly with our fraud team</p>
                <ExternalLinkButton 
                    href={LINKS.WHATSAPP}
                    icon={ShieldCheck}
                    title="Verify via WhatsApp"
                    subtitle="Official Support Channel"
                    colorClass="bg-emerald-100 text-emerald-600"
                />
            </div>
            </div>
        )}

        {intent !== Intent.FRAUD_CONCERN && (
            <div className="mt-6">
            <Button onClick={() => onSubmit(data)}>Submit</Button>
            </div>
        )}
        {intent === Intent.FRAUD_CONCERN && (
             <div className="mt-6">
             <Button onClick={() => onSubmit(data)}>Submit Report</Button>
             </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => internalStep > 1 ? prev() : onBack()} 
          className="p-2 -ml-2 rounded-full hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="ml-auto bg-sky-50 text-sky-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
          Step 2
        </div>
      </div>

      {renderFormContent()}
    </div>
  );
};

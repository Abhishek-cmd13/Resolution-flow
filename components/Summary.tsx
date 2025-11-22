
import React from 'react';
import { Intent, FormData } from '../types';
import { Button } from './ui/Base';
import { Check, ShieldCheck, Calendar, RefreshCcw, Sun, Clock, Mail, MessageCircle, AlertCircle, ArrowRight, Phone, UserCheck } from 'lucide-react';

interface Props {
  intent: Intent;
  data: FormData;
  onReset: () => void;
}

export const Summary: React.FC<Props> = ({ intent, data, onReset }) => {
  
  // Special handling for Settlement/Payment flow to show instructions BEFORE WhatsApp
  if (intent === Intent.REQUEST_SETTLEMENT || intent === Intent.MAKE_PAYMENT) {
    
    // Determine the correct amount based on flow
    let amount = "14500"; // Default to Full Outstanding
    
    if (data.settlementAmount) {
        amount = data.settlementAmount;
    } else if (data.payAmountType === 'emi') {
        amount = "4200";
    } else if (data.payCustomAmount) {
        amount = data.payCustomAmount;
    }

    // Determine type based on amount (Threshold: 14500)
    const isClosure = parseInt(amount) >= 14500;
    const type = isClosure ? "closure" : "settlement";
    
    // Construct dynamic message
    const whatsappText = `I want to close my loan. My ${type} amount is ₹${amount}. Please send the link.`;
    const whatsappUrl = `https://wa.me/919008457659?text=${encodeURIComponent(whatsappText)}`;

    return (
      <div className="animate-scale-in pt-2">
        <div className="text-center mb-6">
            <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                <AlertCircle size={40} className="text-sky-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">One Final Step</h2>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
                To process your request for <span className="font-bold text-slate-800">₹{parseInt(amount).toLocaleString()}</span>, please review the timeline below.
            </p>
        </div>

        {/* Actionable Ticket */}
        <div className="bg-white rounded-3xl p-1 shadow-xl shadow-sky-900/5 border border-white relative overflow-hidden text-left mb-8">
            <div className="border-2 border-sky-100 rounded-[22px] p-5 bg-sky-50/30">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-dashed border-sky-200">
                    <Clock size={18} className="text-sky-600" />
                    <span className="font-bold text-sky-900 text-sm uppercase tracking-wide">What happens next?</span>
                </div>

                <div className="space-y-4 mb-2">
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-white border border-sky-100 flex items-center justify-center shrink-0 text-sky-600 font-bold text-xs shadow-sm">1</div>
                        <div>
                            <div className="font-bold text-slate-800 text-sm">Payment Link</div>
                            <div className="text-xs text-slate-500 mt-0.5">Generated & sent within <span className="font-bold text-sky-600">24 Hours</span> via WhatsApp.</div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-white border border-sky-100 flex items-center justify-center shrink-0 text-sky-600 font-bold text-xs shadow-sm">2</div>
                        <div>
                            <div className="font-bold text-slate-800 text-sm">NOC Issuance</div>
                            <div className="text-xs text-slate-500 mt-0.5">Document delivered in <span className="font-bold text-sky-600">30 Days</span> post payment.</div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                         <div className="w-8 h-8 rounded-full bg-white border border-sky-100 flex items-center justify-center shrink-0 text-sky-600 font-bold text-xs shadow-sm">3</div>
                        <div>
                            <div className="font-bold text-slate-800 text-sm">Confirmation</div>
                            <div className="text-xs text-slate-500 mt-0.5">Email receipt sent within <span className="font-bold text-sky-600">24 Hours</span>.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-3">
            <Button 
                onClick={() => window.open(whatsappUrl, '_blank')}
                className="from-emerald-500 to-green-600 shadow-emerald-200 animate-pulse-slow"
            >
                <MessageCircle size={18} />
                Agree & Get Link on WhatsApp
            </Button>
            <Button variant="ghost" onClick={onReset}>
                Cancel request
            </Button>
        </div>
      </div>
    );
  }

  // Handling NEED_TIME (PTP Flow V2) - "Save Contact" Screen
  if (intent === Intent.NEED_TIME && data.ptpDate) {
      const waPaymentLink = `https://wa.me/919008457659?text=I%20have%20committed%20to%20pay%20₹${data.ptpAmount}%20on%20${data.ptpDate}.%20Please%20send%20link.`;
      const waConnectLink = `https://wa.me/919008457659?text=Connecting%20to%20stay%20updated%20on%20my%20payment%20commitment.`;

      return (
        <div className="animate-scale-in pt-4 text-center">
             <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck size={40} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Commitment Noted</h2>
            <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto">
                Thank you. We have recorded your promise to pay <span className="font-bold text-slate-800">₹{data.ptpAmount}</span> on <span className="font-bold text-slate-800">{new Date(data.ptpDate).toLocaleDateString()}</span>.
            </p>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-sky-100/50 text-left mb-6">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-emerald-500" /> Important Next Steps
                </h4>
                <div className="space-y-4">
                    <div className="flex gap-3 items-start">
                        <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 mt-0.5">1</div>
                        <div>
                            <p className="text-sm font-bold text-slate-700">Save our Number</p>
                            <p className="text-xs text-slate-500 mt-1">Save <span className="font-mono bg-slate-100 px-1 rounded text-slate-700">+91-9008457659</span> to ensure you don't miss the payment link.</p>
                        </div>
                    </div>
                    <div className="flex gap-3 items-start">
                        <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 mt-0.5">2</div>
                         <div>
                            <p className="text-sm font-bold text-slate-700">Establish Connection</p>
                            <p className="text-xs text-slate-500 mt-1">Click below to say "Hi" on WhatsApp so we can send the link on due date.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <Button 
                    onClick={() => window.open(waPaymentLink, '_blank')}
                    className="from-emerald-500 to-green-600 shadow-emerald-200"
                >
                    <MessageCircle size={18} />
                    Get Link on WhatsApp Now
                </Button>
                <Button 
                    onClick={() => window.open(waConnectLink, '_blank')}
                    variant="soft"
                >
                    Just Connect on WhatsApp
                </Button>
            </div>
            <Button variant="ghost" onClick={onReset} className="mt-4">
                Done
            </Button>
        </div>
      );
  }

  // Default Summary View for other intents (Docs, Hardship, etc)
  const getContent = () => {
    switch (intent) {
      case Intent.DOCUMENTS:
        return {
          status: "Request Logged",
          title: "Document Requested",
          desc: "Your request for documents has been queued with the lender.",
          points: [
            { icon: Mail, text: "Confirmation in 24 hours" },
            { icon: Calendar, text: "NOC issuance: 30 days" }
          ]
        };
      case Intent.NEED_TIME:
          if (data.notSureChoice === 'advisor') {
               return {
                status: "Scheduled",
                title: "Callback Booked",
                desc: `An advisor will call you around ${data.callbackTime ? new Date(data.callbackTime).toLocaleString() : 'your preferred time'}.`,
                points: [
                    { icon: Phone, text: "Wait for our call" },
                    { icon: MessageCircle, text: "Prepare your questions" }
                ]
              };
          }
        return {
          status: "Preference Saved",
          title: "Update Noted",
          desc: "We have noted your situation and will avoid unnecessary calls for now.",
          points: [
            { icon: Clock, text: "Next update in 7 days" },
            { icon: MessageCircle, text: "Stay reachable" }
          ]
        };
      case Intent.FINANCIAL_HARDSHIP:
        return {
          status: "Under Review",
          title: "Extension Request",
          desc: "Our team is reviewing your request for more time.",
          points: [
            { icon: Clock, text: "Update within 24 hours" },
            { icon: MessageCircle, text: "Response via WhatsApp" }
          ]
        };
      case Intent.ALREADY_PAID:
        return {
          status: "Verifying",
          title: "Payment Verification",
          desc: "We are matching your details with bank records.",
          points: [
            { icon: Clock, text: "Status update in 24 hrs" },
            { icon: ShieldCheck, text: "Calls stop upon verify" }
          ]
        };
      default:
        return {
          status: "Received",
          title: "Request Received",
          desc: "We have received your query and will act on it.",
          points: [
            { icon: Clock, text: "Response in 24 hours" },
            { icon: MessageCircle, text: "Check WhatsApp" }
          ]
        };
    }
  };

  const content = getContent();

  return (
    <div className="animate-scale-in text-center pt-4">
      
      <div className="w-24 h-24 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-sky-300 ring-8 ring-white">
        <Check size={48} className="text-white" strokeWidth={4} />
      </div>

      <h2 className="text-3xl font-bold text-slate-800 mb-2 drop-shadow-sm">Request Sent!</h2>
      <p className="text-slate-500 mb-8 font-medium max-w-xs mx-auto leading-relaxed">
        You can close this window now. We've got it from here.
      </p>

      {/* Ticket / Receipt Look */}
      <div className="bg-white rounded-3xl p-1 shadow-xl shadow-sky-900/5 border border-white relative overflow-hidden text-left mb-8 transform rotate-[-1deg] hover:rotate-0 transition-transform duration-300">
        <div className="border-2 border-slate-100 rounded-[22px] p-5 bg-slate-50/50">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                        <Sun size={16} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</div>
                        <div className="font-bold text-slate-800 leading-none">{content.status}</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</div>
                    <div className="font-bold text-slate-800 leading-none">{new Date().toLocaleDateString()}</div>
                </div>
            </div>

            <div className="border-t-2 border-dashed border-slate-200 my-4 relative">
                <div className="absolute -left-7 -top-1 w-4 h-4 bg-white rounded-full border-r-2 border-slate-100" />
                <div className="absolute -right-7 -top-1 w-4 h-4 bg-white rounded-full border-l-2 border-slate-100" />
            </div>
            
            <div className="mb-4">
                <p className="text-sm font-bold text-slate-800 mb-1">{content.title}</p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {content.desc}
                </p>
            </div>

            <div className="space-y-2 bg-white rounded-xl p-3 border border-slate-100">
                {content.points.map((p, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                        <p.icon size={14} className="text-sky-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-600">{p.text}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <Button variant="ghost" onClick={onReset} className="text-slate-500 hover:text-sky-600">
        <RefreshCcw size={16} /> Start a new request
      </Button>
    </div>
  );
};

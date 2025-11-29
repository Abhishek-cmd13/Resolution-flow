import React from 'react';
import { Intent, BorrowerProfile } from '../types';
import { HandCoins, MessageCircleHeart, FileText, ShieldAlert, ChevronRight, HelpCircle, Clock, CheckCircle, HeartHandshake } from 'lucide-react';
import { trackIntentSelection } from '../utils/mixpanel';

interface Props {
  onSelect: (intent: Intent) => void;
  borrower?: BorrowerProfile;
}

const sections = [
  {
    title: "Resolution",
    items: [
      {
        id: Intent.REQUEST_SETTLEMENT,
        icon: HandCoins,
        title: "Close & Settle",
        desc: "Negotiate closure",
        color: "text-teal-600",
        iconBg: "bg-teal-50"
      },
    ]
  },
  {
    title: "Assistance",
    items: [
      {
        id: Intent.NEED_TIME,
        icon: Clock,
        title: "Need Time",
        desc: "Financial Problem",
        color: "text-amber-600",
        iconBg: "bg-amber-50"
      },
    ]
  },
  {
    title: "Support",
    items: [
      {
        id: Intent.TALK_TO_ADVISOR,
        icon: MessageCircleHeart,
        title: "Advisor",
        desc: "Speak to human",
        color: "text-violet-600",
        iconBg: "bg-violet-50"
      },
      {
        id: Intent.UNKNOWN_LOAN,
        icon: HelpCircle,
        title: "Which Loan?",
        desc: "Check details",
        color: "text-blue-600",
        iconBg: "bg-blue-50"
      },
      {
        id: Intent.ALREADY_PAID,
        icon: CheckCircle,
        title: "Paid",
        desc: "Stop calls",
        color: "text-indigo-600",
        iconBg: "bg-indigo-50"
      },
    ]
  }
];

export const IntentSelection: React.FC<Props> = ({ onSelect, borrower }) => {
  // Flatten items for a grid view
  const allItems = sections.flatMap(s => s.items);
  
  // Create personalized heading
  const borrowerName = borrower?.name || '';
  const heading = borrowerName 
    ? `We are here to help you ${borrowerName}`
    : 'We are here to help you';

  return (
    <div className="animate-fade-in-up pb-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">{heading}</h2>
        <p className="text-white font-semibold text-base drop-shadow-sm">Select the option that fits best.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Special Full Width Item for Settlement */}
        <button
            onClick={() => {
              trackIntentSelection(Intent.REQUEST_SETTLEMENT, borrower);
              onSelect(Intent.REQUEST_SETTLEMENT);
            }}
            className="col-span-2 w-full flex items-center p-4 bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm hover:bg-white hover:scale-[1.01] transition-all duration-200 group text-left"
        >
            <div className={`w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mr-4 shrink-0 shadow-inner`}>
                <HandCoins size={24} />
            </div>
            <div className="flex-1">
                <div className="text-base font-bold text-slate-900">Close & Settle</div>
                <div className="text-sm text-slate-600 font-medium mt-1">I want to negotiate a closure amount</div>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-sky-500 transition-colors" />
        </button>

        {/* Other items in grid */}
        {allItems.filter(i => i.id !== Intent.REQUEST_SETTLEMENT).map((item) => (
            <button
            key={item.id}
            onClick={() => {
              trackIntentSelection(item.id, borrower);
              onSelect(item.id);
            }}
            className="flex flex-col items-start p-4 bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-sm hover:bg-white hover:scale-[1.02] transition-all duration-200 group text-left h-full"
            >
            <div className={`w-10 h-10 rounded-xl ${item.iconBg} ${item.color} flex items-center justify-center mb-3 shadow-inner`}>
                <item.icon size={20} />
            </div>
            <div className="text-base font-bold text-slate-900 leading-tight">{item.title}</div>
            <div className="text-xs text-slate-600 font-semibold mt-1 leading-tight">{item.desc}</div>
            </button>
        ))}
      </div>

      {/* Footer Links */}
      <div className="flex justify-center gap-3 mt-6">
        <button 
          onClick={() => {
            trackIntentSelection(Intent.DOCUMENTS, borrower);
            onSelect(Intent.DOCUMENTS);
          }}
          className="text-sm font-bold text-slate-700 hover:text-sky-900 flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/30 border border-white/40 hover:bg-white/50 transition-all shadow-sm"
        >
          <FileText size={16} /> Get Document
        </button>
        <button 
          onClick={() => {
            trackIntentSelection(Intent.FRAUD_CONCERN, borrower);
            onSelect(Intent.FRAUD_CONCERN);
          }}
          className="text-sm font-bold text-slate-700 hover:text-rose-900 flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/30 border border-white/40 hover:bg-white/50 transition-all shadow-sm"
        >
          <ShieldAlert size={16} /> Report Issue
        </button>
      </div>
    </div>
  );
};
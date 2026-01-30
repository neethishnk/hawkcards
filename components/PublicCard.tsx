
import React, { useEffect, useState } from 'react';
import { DigitalCard, SocialField } from '../types';
import { StorageService } from '../services/storage';
import {
  Mail, Smartphone, Globe, Linkedin, Facebook, Twitter,
  Youtube, Instagram, Github, Save, Share2, ExternalLink,
  MapPin, Briefcase, Download, Plus, Check
} from 'lucide-react';

interface PublicCardProps {
  cardId: string;
}

const SOCIAL_ICONS: Record<string, any> = {
  email: Mail,
  phone: Smartphone,
  website: Globe,
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  github: Github,
  youtube: Youtube,
  facebook: Facebook,
};

const PublicCard: React.FC<PublicCardProps> = ({ cardId }) => {
  const [card, setCard] = useState<DigitalCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showWalletInfo, setShowWalletInfo] = useState(false);

  useEffect(() => {
    // Try to find in local storage first
    const allCards = StorageService.getAllCards();
    let foundCard = allCards.find(c => c.id === cardId);

    // If not found, try to decode from URL (portable card)
    if (!foundCard) {
      const params = new URLSearchParams(window.location.search);
      const encodedData = params.get('d');
      if (encodedData) {
        try {
          foundCard = JSON.parse(atob(encodedData));
        } catch (e) {
          console.error("Failed to decode card data", e);
        }
      }
    }

    if (foundCard) {
      setCard(foundCard);
      // Increment views (only if in local storage for this demo)
      StorageService.incrementCardViews(cardId);
    }
    setLoading(false);
  }, [cardId]);

  const handleDownloadVCF = () => {
    if (!card) return;

    const vCardContent = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${card.firstName} ${card.lastName}`,
      `N:${card.lastName};${card.firstName};;;`,
      `ORG:${card.company}`,
      `TITLE:${card.jobTitle}`,
      ...card.fields.map(f => {
        if (f.type === 'phone') return `TEL;TYPE=CELL:${f.value}`;
        if (f.type === 'email') return `EMAIL;TYPE=INTERNET:${f.value}`;
        if (f.type === 'website') return `URL:${f.value}`;
        return `URL;TYPE=${f.type}:${f.value}`;
      }),
      'END:VCARD'
    ].join('\n');

    const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${card.firstName}_${card.lastName}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSaved(true);
    StorageService.incrementCardSaves(cardId);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
          <div className="h-3 w-24 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl max-w-sm w-full">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
            <Plus className="w-8 h-8 rotate-45" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Card Not Found</h2>
          <p className="text-slate-500 mb-8">This digital business card may have been moved or deactivated.</p>
          <a href="/" className="inline-block bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-slate-200">
            Create Your Own
          </a>
        </div>
      </div>
    );
  }

  const themeColor = card.color || '#8b5cf6';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pb-12 animate-fade-in">
      <div className="max-w-md w-full bg-white shadow-2xl overflow-hidden md:my-8 md:rounded-[2.5rem] relative">
        {/* Cover Image */}
        <div className="h-48 relative overflow-hidden" style={{ backgroundColor: themeColor }}>
          {card.coverImageUrl && (
            <img src={card.coverImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="" />
          )}
          {card.theme === 'modern' && !card.coverImageUrl && (
            <div className="absolute -bottom-12 -left-4 w-full h-24 bg-white rounded-t-[50%] scale-150"></div>
          )}
          {card.theme === 'sleek' && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          )}

          <button
            onClick={() => { navigator.share?.({ title: `${card.firstName}'s Card`, url: window.location.href }).catch(() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied!");
            })}}
            className="absolute top-6 right-6 p-2.5 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all z-20"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Section */}
        <div className="px-8 pb-10 relative">
          <div className="flex flex-col items-center text-center -mt-20 mb-8 relative z-10">
            <div className="w-32 h-32 rounded-[2.5rem] border-4 border-white shadow-xl bg-white overflow-hidden mb-6">
              <img
                src={card.avatarUrl || `https://ui-avatars.com/api/?name=${card.firstName}+${card.lastName}&background=random&color=fff&size=200`}
                alt={`${card.firstName} ${card.lastName}`}
                className="w-full h-full object-cover"
              />
            </div>

            <h1 className="text-3xl font-black text-slate-900 leading-tight">
              {card.firstName} {card.lastName}
            </h1>
            <p className="text-lg font-bold mt-1" style={{ color: themeColor }}>
              {card.jobTitle}
            </p>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mt-1">
              {card.company}
            </p>
            {card.headline && (
              <p className="mt-4 text-slate-600 italic text-sm max-w-xs">
                "{card.headline}"
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mb-10">
            <button
              onClick={handleDownloadVCF}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm shadow-xl transition-all ${saved ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-slate-900 text-white shadow-slate-200 hover:bg-slate-800'}`}
            >
              {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              {saved ? 'Saved to Contacts' : 'Add to Contacts'}
            </button>
            <button
              onClick={() => setShowWalletInfo(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all"
            >
              <Plus className="w-4 h-4" /> Add to Apple / Google Wallet
            </button>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Connect</h3>
            {card.fields.map(field => {
              const Icon = SOCIAL_ICONS[field.type] || Globe;
              return (
                <a
                  key={field.id}
                  href={field.type === 'email' ? `mailto:${field.value}` : field.type === 'phone' ? `tel:${field.value}` : field.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-300 hover:bg-white transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110" style={{ backgroundColor: themeColor }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{field.label || field.type}</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{field.value}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </a>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4 opacity-40">
               <div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center text-white"><Smartphone className="w-3.5 h-3.5" /></div>
               <span className="font-black text-xs tracking-tight text-slate-900 uppercase">Hawkcards</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Digital Identity Management</p>
          </div>
        </div>
      </div>

      {showWalletInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50">
                 <h3 className="font-bold text-slate-900">Add to Wallet</h3>
                 <button onClick={() => setShowWalletInfo(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-8 space-y-6">
                 <div className="space-y-4">
                    <div className="flex items-start gap-4">
                       <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold text-sm">1</div>
                       <p className="text-sm text-slate-600"><span className="font-bold text-slate-900">Save to Contacts:</span> Tap the 'Add to Contacts' button first to save this profile to your phone.</p>
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 font-bold text-sm">2</div>
                       <p className="text-sm text-slate-600"><span className="font-bold text-slate-900">Add to Home Screen:</span> Tap the 'Share' icon in your browser and select 'Add to Home Screen' for instant access like a native app.</p>
                    </div>
                 </div>
                 <button onClick={() => setShowWalletInfo(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold">Got it!</button>
              </div>
           </div>
        </div>
      )}

      <div className="mt-4 md:mt-8">
        <a href="/" className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors">
          <Plus className="w-3 h-3" /> Create Your Own Digital Card
        </a>
      </div>
    </div>
  );
};

export default PublicCard;

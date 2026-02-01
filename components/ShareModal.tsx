
import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { DigitalCard } from '../types';
import {
  X, Copy, Download, Share2, Mail, MessageCircle,
  Smartphone, Check, ExternalLink, Wallet
} from 'lucide-react';

interface ShareModalProps {
  card: DigitalCard;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ card, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Encode card data for portable sharing without a backend
  const encodedData = btoa(JSON.stringify(card));
  const cardUrl = `${window.location.origin}/c/${card.id}?d=${encodedData}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('share-qr');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${card.firstName}_QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-scale-in">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
           <div>
              <h3 className="text-2xl font-black text-slate-900">Share Your Card</h3>
              <p className="text-slate-500">Choose how you'd like to share your digital identity.</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
           {/* QR Code Section */}
           <div className="flex flex-col items-center text-center">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-inner mb-6 group relative">
                 <QRCode id="share-qr" value={cardUrl} size={180} level="H" />
                 <div className="absolute inset-0 flex items-center justify-center bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]">
                    <button onClick={handleDownloadQR} className="bg-slate-900 text-white p-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl">
                       <Download className="w-5 h-5" /> Save Image
                    </button>
                 </div>
              </div>
              <p className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-1">Scan to View Profile</p>
              <p className="text-xs text-slate-400">Point your camera at this code to open the card.</p>
           </div>

           {/* Link Section */}
           <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Card Link</label>
              <div className="flex gap-2">
                 <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-600 truncate font-medium">
                    {cardUrl}
                 </div>
                 <button
                  onClick={handleCopy}
                  className={`px-6 rounded-2xl font-bold transition-all flex items-center gap-2 ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                 >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                 </button>
              </div>
           </div>

           {/* Action Grid */}
           <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center gap-3 p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-400 hover:shadow-xl hover:shadow-blue-50 transition-all group">
                 <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:bg-blue-50 transition-colors">
                    <Mail className="w-6 h-6 text-blue-500" />
                 </div>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Send via Email</span>
              </button>
              <button className="flex flex-col items-center gap-3 p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-50 transition-all group">
                 <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:bg-emerald-50 transition-colors">
                    <MessageCircle className="w-6 h-6 text-emerald-500" />
                 </div>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">WhatsApp Message</span>
              </button>
              <button
                onClick={() => alert("To add to Apple Wallet:\n1. Open your card link in Safari\n2. Tap the Share icon\n3. Tap 'Add to Home Screen'\n\nNative .pkpass generation requires an Apple Developer Certificate.")}
                className="flex flex-col items-center gap-3 p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-black hover:shadow-xl hover:shadow-slate-100 transition-all group"
              >
                 <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:bg-slate-50 transition-colors">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg" className="w-6 h-6 invert" alt="Apple" />
                 </div>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Apple Wallet</span>
              </button>
              <button
                onClick={() => alert("Google Wallet integration coming soon! In the meantime, use the 'Copy Link' feature to share your profile.")}
                className="flex flex-col items-center gap-3 p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-600 hover:shadow-xl hover:shadow-blue-50 transition-all group"
              >
                 <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:bg-blue-50 transition-colors">
                    <Wallet className="w-6 h-6 text-blue-600" />
                 </div>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Google Wallet</span>
              </button>
           </div>
        </div>

        <div className="p-8 border-t border-slate-50 bg-slate-50 flex items-center justify-center">
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Powered by Hawkcards</p>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;

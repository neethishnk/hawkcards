
import React, { useState, useEffect } from 'react';
import { User, DigitalCard, Contact, ContactSegment, MessageTemplate } from '../types';
import { StorageService } from '../services/storage';
import QRCode from 'react-qr-code';
import { 
  LogOut, LayoutGrid, BarChart2, Settings, Plus, 
  MoreVertical, Edit3, Share2, Copy, Download, 
  Eye, Save as SaveIcon, Users, Smartphone, Zap, Wallet, X,
  MessageCircle, Search, Calendar, StickyNote, ChevronRight, ChevronLeft, ArrowUpDown, Trash2, Mail, Phone, Clock, Linkedin, Twitter, ExternalLink, Globe, Tag, Send, Layers, Type as TypeIcon,
  TrendingUp, MousePointer2, ScanLine
} from 'lucide-react';
import OnboardingWizard from './OnboardingWizard';
import DigitalCardEditor from './DigitalCardEditor';

interface UserPortalProps {
  user: User;
  onLogout: () => void;
}

const UserPortal: React.FC<UserPortalProps> = ({ user, onLogout }) => {
  const [cards, setCards] = useState<DigitalCard[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [segments, setSegments] = useState<ContactSegment[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<'cards' | 'contacts' | 'campaigns' | 'analytics' | 'settings'>('cards');
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [editingCard, setEditingCard] = useState<DigitalCard | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [contactSearch, setContactSearch] = useState('');
  
  // Modals
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [cardToShare, setCardToShare] = useState<DigitalCard | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Partial<Contact> | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // Campaign State
  const [isSegmentModalOpen, setIsSegmentModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [showCampaignRunner, setShowCampaignRunner] = useState(false);

  // Derived state
  const activeCard = cards.find(c => c.id === selectedCardId);
  const totalViews = cards.reduce((sum, c) => sum + (c.views || 0), 0);
  const totalUnique = cards.reduce((sum, c) => sum + (c.uniqueViews || 0), 0);
  const totalSaves = cards.reduce((sum, c) => sum + (c.saves || 0), 0);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = () => {
    const userCards = StorageService.getCards(user.id);
    const userContacts = StorageService.getContacts(user.id);
    const userSegments = StorageService.getSegments(user.id);
    const userTemplates = StorageService.getTemplates(user.id);

    setCards(userCards);
    setContacts(userContacts);
    setSegments(userSegments);
    setTemplates(userTemplates);

    if (userCards.length === 0) {
      setShowOnboarding(true);
    } else if (userCards.length > 0 && !selectedCardId) {
      setSelectedCardId(userCards[0].id);
    }
  };

  const handleCreateCard = () => {
    setEditingCard(null);
    setIsEditorOpen(true);
  };

  const handleEditCard = (card: DigitalCard, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCard(card);
    setIsEditorOpen(true);
  };

  const handleEditorSave = () => {
    setIsEditorOpen(false);
    loadData();
    setShowOnboarding(false);
  };

  const handleShareCard = (card: DigitalCard, e: React.MouseEvent) => {
    e.stopPropagation();
    setCardToShare(card);
    setIsShareModalOpen(true);
  };

  const handleWhatsApp = (phone: string, text?: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedText = text ? encodeURIComponent(text) : '';
    window.open(`https://wa.me/${cleanPhone}${text ? `?text=${encodedText}` : ''}`, '_blank');
  };

  const handleLinkedIn = (linkedinUrl?: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (linkedinUrl) window.open(linkedinUrl, '_blank');
  };

  const handleDownloadContactVCard = (contact: Contact, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const vCardContent = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${contact.name}`,
      `TEL;TYPE=CELL:${contact.phone}`,
      `EMAIL;TYPE=INTERNET:${contact.email}`,
      `URL;TYPE=Linkedin:${contact.linkedin || ''}`,
      `CATEGORIES:${contact.tag || ''}`,
      `NOTE:${contact.notes?.replace(/\n/g, '\\n') || ''}`,
      'END:VCARD'
    ].join('\n');

    const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${contact.name.replace(/\s+/g, '_')}_contact.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactToEdit) return;

    if (contactToEdit.id) {
      StorageService.updateContact(contactToEdit as Contact);
      if (selectedContact?.id === contactToEdit.id) {
        setSelectedContact(contactToEdit as Contact);
      }
    } else {
      StorageService.addContact({
        ownerId: user.id,
        name: contactToEdit.name || '',
        email: contactToEdit.email || '',
        phone: contactToEdit.phone || '',
        notes: contactToEdit.notes || '',
        lastMeeting: contactToEdit.lastMeeting,
        avatarUrl: contactToEdit.avatarUrl,
        linkedin: contactToEdit.linkedin,
        twitter: contactToEdit.twitter,
        tag: contactToEdit.tag
      });
    }
    setIsContactModalOpen(false);
    loadData();
  };

  const handleDeleteContact = (contactId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm("Are you sure you want to delete this contact?")) {
      StorageService.deleteContact(contactId);
      if (selectedContact?.id === contactId) setSelectedContact(null);
      loadData();
    }
  };

  const handleCreateSegment = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    StorageService.saveSegment({
      ownerId: user.id,
      name: formData.get('name') as string,
      color: formData.get('color') as string,
      description: formData.get('description') as string,
    });
    setIsSegmentModalOpen(false);
    loadData();
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    StorageService.saveTemplate({
      ownerId: user.id,
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      category: formData.get('category') as any,
    });
    setIsTemplateModalOpen(false);
    loadData();
  };

  const startCampaign = () => {
    if (!selectedSegmentId || !selectedTemplateId) {
      alert("Please select both a segment and a message template.");
      return;
    }
    setShowCampaignRunner(true);
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) || 
    c.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
    (c.tag && c.tag.toLowerCase().includes(contactSearch.toLowerCase()))
  );

  const getSegmentContacts = (segName: string) => {
    return contacts.filter(c => c.tag === segName);
  };

  const renderCampaigns = () => {
    const campaignSegment = segments.find(s => s.id === selectedSegmentId);
    const campaignTemplate = templates.find(t => t.id === selectedTemplateId);
    const segmentContacts = campaignSegment ? getSegmentContacts(campaignSegment.name) : [];

    return (
      <div className="p-6 md:p-8 animate-fade-in flex flex-col h-full overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Campaign Center</h1>
            <p className="text-slate-500">Engage your segments with personalized WhatsApp greetings.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsSegmentModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">
              <Plus className="w-4 h-4" /> New Segment
            </button>
            <button onClick={() => setIsTemplateModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">
              <Plus className="w-4 h-4" /> New Template
            </button>
          </div>
        </div>

        {!showCampaignRunner ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto">
            {/* Segmentation Config */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  1. Select Target Segment
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {segments.map(seg => (
                    <button
                      key={seg.id}
                      onClick={() => setSelectedSegmentId(seg.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${selectedSegmentId === seg.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-300'}`}
                    >
                      <div className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center text-white" style={{ backgroundColor: seg.color }}>
                        <Users className="w-4 h-4" />
                      </div>
                      <p className="font-bold text-slate-900">{seg.name}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{seg.description || 'No description'}</p>
                      <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{getSegmentContacts(seg.name).length} Contacts</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <TypeIcon className="w-5 h-5 text-purple-600" />
                  2. Choose Message Template
                </h3>
                <div className="space-y-3">
                  {templates.map(tm => (
                    <button
                      key={tm.id}
                      onClick={() => setSelectedTemplateId(tm.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedTemplateId === tm.id ? 'border-purple-600 bg-purple-50' : 'border-slate-100 hover:border-slate-300'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                         <p className="font-bold text-slate-900">{tm.title}</p>
                         <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded uppercase">{tm.category}</span>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2 italic">"{tm.content}"</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Campaign Preview & Action */}
            <div className="flex flex-col">
              <div className="bg-slate-900 rounded-3xl p-8 text-white h-full flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                   <div className="bg-blue-600 p-3 rounded-2xl"><Zap className="w-6 h-6" /></div>
                   <div>
                      <h3 className="text-xl font-bold">Campaign Setup</h3>
                      <p className="text-slate-400 text-sm">Review your bulk message settings</p>
                   </div>
                </div>

                <div className="flex-1 space-y-6">
                   <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                      <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Target Segment</p>
                      <p className="text-lg font-medium">{campaignSegment?.name || 'Not selected'}</p>
                   </div>
                   <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                      <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Message Content</p>
                      <p className="text-sm text-slate-300 italic">{campaignTemplate?.content ? `"${campaignTemplate.content}"` : 'Not selected'}</p>
                   </div>
                   <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                      <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Delivery Method</p>
                      <p className="text-sm flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-emerald-500" />
                        WhatsApp Embedded Link
                      </p>
                   </div>
                </div>

                <button 
                  onClick={startCampaign}
                  className="mt-8 w-full py-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-3 shadow-xl"
                >
                  <Send className="w-5 h-5" /> Launch Delivery Queue
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Campaign Queue Runner */
          <div className="bg-white rounded-2xl border border-slate-200 flex-1 flex flex-col overflow-hidden animate-scale-in">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                   <button onClick={() => setShowCampaignRunner(false)} className="p-2 hover:bg-slate-200 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
                   <div>
                      <h3 className="font-bold text-slate-900">Queue: {campaignSegment?.name}</h3>
                      <p className="text-xs text-slate-500">{segmentContacts.length} recipient{segmentContacts.length !== 1 ? 's' : ''}</p>
                   </div>
                </div>
                <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                  <Zap className="w-3 h-3" /> CAMPAIGN ACTIVE
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {segmentContacts.map((contact, idx) => (
                  <div key={contact.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="text-xs font-bold text-slate-300 w-4">{idx + 1}</div>
                      <img src={contact.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}`} className="w-10 h-10 rounded-full border" alt="" />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{contact.name}</p>
                        <p className="text-xs text-slate-500">{contact.phone}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleWhatsApp(contact.phone, campaignTemplate?.content)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100 opacity-80 group-hover:opacity-100"
                    >
                      <MessageCircle className="w-4 h-4" /> Send on WhatsApp
                    </button>
                  </div>
                ))}

                {segmentContacts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400 italic">
                    <Users className="w-12 h-12 mb-4 opacity-20" />
                    <p>No contacts found in this segment.</p>
                  </div>
                )}
             </div>

             <div className="p-6 border-t border-slate-100 bg-slate-50">
                <p className="text-xs text-slate-500 text-center">Clicking send will open a WhatsApp tab with the pre-filled message for each contact.</p>
             </div>
          </div>
        )}

        {/* Create Segment Modal */}
        {isSegmentModalOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
             <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                   <h3 className="text-xl font-bold">Create Contact Segment</h3>
                   <button onClick={() => setIsSegmentModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleCreateSegment} className="p-8 space-y-6">
                   <div className="space-y-4">
                      <div>
                         <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Segment Name</label>
                         <input required name="name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. High Priority Leads" />
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Accent Color</label>
                         <input required name="color" type="color" className="w-full h-12 p-1 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer" defaultValue="#3b82f6" />
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Description</label>
                         <textarea name="description" rows={3} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Details about this group..." />
                      </div>
                   </div>
                   <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">Create Segment</button>
                </form>
             </div>
          </div>
        )}

        {/* Create Template Modal */}
        {isTemplateModalOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
             <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                   <h3 className="text-xl font-bold">Create Message Template</h3>
                   <button onClick={() => setIsTemplateModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleCreateTemplate} className="p-8 space-y-6">
                   <div className="space-y-4">
                      <div>
                         <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Template Title</label>
                         <input required name="title" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. Holiday Greeting 2024" />
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category</label>
                         <select name="category" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none appearance-none">
                            <option value="greeting">Greeting</option>
                            <option value="follow-up">Follow-up</option>
                            <option value="holiday">Holiday</option>
                            <option value="custom">Custom</option>
                         </select>
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Message Body (WhatsApp)</label>
                         <textarea required name="content" rows={4} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none resize-none" placeholder="Type your message here..." />
                      </div>
                   </div>
                   <button type="submit" className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all">Create Template</button>
                </form>
             </div>
          </div>
        )}
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="p-6 md:p-8 animate-fade-in relative h-full overflow-y-auto">
       <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Cards</h1>
            <p className="text-slate-500">Manage and share your digital identities.</p>
          </div>
          <button 
            onClick={handleCreateCard}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-purple-200 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Card</span>
          </button>
       </div>

       {/* Statistics Row */}
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-purple-200 transition-all">
             <div className="bg-purple-100 p-3 rounded-2xl text-purple-600 group-hover:scale-110 transition-transform"><TrendingUp className="w-6 h-6" /></div>
             <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Profile Views</p>
                <p className="text-2xl font-black text-slate-900">{totalViews}</p>
             </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-blue-200 transition-all">
             <div className="bg-blue-100 p-3 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform"><ScanLine className="w-6 h-6" /></div>
             <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Scans</p>
                <p className="text-2xl font-black text-slate-900">{totalUnique}</p>
             </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-emerald-200 transition-all">
             <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform"><MousePointer2 className="w-6 h-6" /></div>
             <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact Saves</p>
                <p className="text-2xl font-black text-slate-900">{totalSaves}</p>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(card => (
            <div 
              key={card.id}
              onClick={() => setSelectedCardId(card.id)}
              className={`group bg-white rounded-2xl border-2 transition-all cursor-pointer overflow-hidden relative ${selectedCardId === card.id ? 'border-purple-600 shadow-xl ring-4 ring-purple-50' : 'border-slate-100 shadow-sm hover:border-purple-200 hover:shadow-md'}`}
            >
              <div className="h-24 w-full relative overflow-hidden" style={{ backgroundColor: card.color || '#8b5cf6' }}>
                 {card.coverImageUrl && (
                   <img src={card.coverImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="" />
                 )}
                 <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={(e) => handleEditCard(card, e)} className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-lg text-white"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={(e) => handleShareCard(card, e)} className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-lg text-white"><Share2 className="w-4 h-4" /></button>
                 </div>
              </div>
              <div className="px-6 pb-6 pt-0 relative text-left">
                 <div className="w-16 h-16 rounded-full border-4 border-white shadow-md -mt-8 bg-slate-100 overflow-hidden mb-3">
                    <img src={card.avatarUrl || user.avatarUrl} alt="" className="w-full h-full object-cover" />
                 </div>
                 <h3 className="font-bold text-lg text-slate-900">{card.firstName} {card.lastName}</h3>
                 <p className="text-sm text-slate-500 font-medium mb-4">{card.jobTitle} @ {card.company}</p>
                 <div className="flex items-center gap-4 text-xs font-medium text-slate-400 border-t border-slate-100 pt-4">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {card.views}</span>
                    <span className="flex items-center gap-1"><SaveIcon className="w-3.5 h-3.5" /> {card.saves}</span>
                 </div>
              </div>
            </div>
          ))}
          <button onClick={handleCreateCard} className="min-h-[280px] rounded-2xl border-2 border-dashed border-slate-200 hover:border-purple-400 hover:bg-purple-50 transition-all flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-purple-600 group">
             <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors"><Plus className="w-6 h-6" /></div>
             <span className="font-medium">Create New Card</span>
          </button>
       </div>

       {activeCard && (
         <div className="mt-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-center">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-inner">
               <QRCode value={`https://hawkforce.ai/c/${activeCard.id}`} size={160} />
            </div>
            <div className="flex-1 text-center md:text-left">
               <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                 <h2 className="text-xl font-bold text-slate-900">Share your {activeCard.title} Card</h2>
                 <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">LIVE</span>
               </div>
               <p className="text-slate-500 mb-6 max-w-md">Scanning this code instantly opens your profile. No apps required.</p>
               <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <button onClick={() => { navigator.clipboard.writeText(`https://hawkforce.ai/c/${activeCard.id}`); alert("Card link copied!"); }} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"><Copy className="w-4 h-4" /> Copy Link</button>
                  <button onClick={() => alert("Downloading QR...")} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"><Download className="w-4 h-4" /> Save QR</button>
                  <button onClick={() => alert("Provisioning Wallet...")} className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"><img src="https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg" className="w-4 h-4" alt="Apple" /> Apple Wallet</button>
                  <button onClick={() => alert("Provisioning Wallet...")} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors"><Wallet className="w-4 h-4 text-blue-500" /> Google Wallet</button>
               </div>
            </div>
         </div>
       )}
    </div>
  );

  const renderContactProfile = (contact: Contact) => (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
       <div className="bg-slate-100 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative animate-scale-in">
          <button 
            onClick={() => setSelectedContact(null)} 
            className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-lg rounded-full z-20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="h-40 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
             <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl -ml-12 -mb-12"></div>
             <div className="absolute -bottom-16 left-0 w-full h-32 bg-slate-100 rounded-t-[50%] scale-x-150"></div>
          </div>

          <div className="px-8 pb-10 flex flex-col items-center text-center relative z-10">
             <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl bg-white overflow-hidden -mt-20 mb-6">
                <img src={contact.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=random&color=fff&size=200`} alt="" className="w-full h-full object-cover" />
             </div>

             <div className="mb-4">
                <h2 className="text-2xl font-black text-slate-900 mb-1">{contact.name}</h2>
                <div className="flex justify-center gap-2">
                   {contact.tag && (
                     <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight border bg-blue-100 text-blue-700 border-blue-200">
                       {contact.tag}
                     </span>
                   )}
                </div>
             </div>

             <div className="w-full space-y-3 mb-8">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 text-left group hover:border-blue-200 transition-colors cursor-pointer" onClick={() => window.open(`mailto:${contact.email}`)}>
                   <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600"><Mail className="w-5 h-5" /></div>
                   <div className="overflow-hidden">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</p>
                      <p className="text-sm font-semibold text-slate-700 truncate">{contact.email}</p>
                   </div>
                </div>

                {contact.phone && (
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 text-left group hover:border-emerald-200 transition-colors cursor-pointer" onClick={() => handleWhatsApp(contact.phone)}>
                    <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600"><Smartphone className="w-5 h-5" /></div>
                    <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile</p>
                        <p className="text-sm font-semibold text-slate-700 truncate">{contact.phone}</p>
                    </div>
                    <MessageCircle className="w-4 h-4 ml-auto text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                )}

                {contact.linkedin && (
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 text-left group hover:border-blue-400 transition-colors cursor-pointer" onClick={() => handleLinkedIn(contact.linkedin)}>
                    <div className="p-2.5 bg-blue-100 rounded-xl text-blue-700"><Linkedin className="w-5 h-5" /></div>
                    <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">LinkedIn</p>
                        <p className="text-sm font-semibold text-slate-700 truncate">Professional Profile</p>
                    </div>
                    <ExternalLink className="w-4 h-4 ml-auto text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                )}
             </div>

             <div className="grid grid-cols-2 gap-3 w-full">
                <button 
                   onClick={() => handleDownloadContactVCard(contact)}
                   className="flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all"
                >
                   <SaveIcon className="w-4 h-4" /> Save Contact
                </button>
                <button 
                   onClick={() => { setContactToEdit(contact); setIsContactModalOpen(true); }}
                   className="flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all"
                >
                   <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
             </div>
          </div>
       </div>
    </div>
  );

  const renderContacts = () => (
    <div className="p-6 md:p-8 animate-fade-in flex flex-col h-full overflow-hidden">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Relationship Manager</h1>
            <p className="text-slate-500">Track and manage the connections you've made.</p>
          </div>
          <button 
            onClick={() => { setContactToEdit({}); setIsContactModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add Contact
          </button>
       </div>

       <div className="mb-6 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search contacts by name, email or tag..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
            />
          </div>
       </div>

       <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Relationship</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <tr 
                      key={contact.id} 
                      onClick={() => setSelectedContact(contact)}
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={contact.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}`} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                          <div>
                            <div className="flex items-center gap-2">
                               <p className="font-semibold text-slate-900">{contact.name}</p>
                               {contact.tag && <span className="text-[9px] font-bold uppercase bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">{contact.tag}</span>}
                            </div>
                            <p className="text-xs text-slate-500">{contact.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Added: {new Date(contact.addedAt).toLocaleDateString()}</p>
                          <p className={`text-xs flex items-center gap-1.5 ${contact.lastMeeting ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>
                            <Zap className="w-3 h-3" /> Last Meeting: {contact.lastMeeting ? new Date(contact.lastMeeting).toLocaleDateString() : 'None scheduled'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-[200px] md:max-w-xs">
                          <p className="text-xs text-slate-600 italic line-clamp-2">{contact.notes || "No notes available."}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          {contact.phone && (
                            <button onClick={(e) => handleWhatsApp(contact.phone, undefined, e)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><MessageCircle className="w-5 h-5" /></button>
                          )}
                          <button onClick={(e) => handleDownloadContactVCard(contact, e)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Download className="w-5 h-5" /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteContact(contact.id, e); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                       <Users className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                       <p>No contacts found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
       {/* Sidebar Desktop */}
       <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
             <div className="bg-purple-600 p-2 rounded-xl text-white"><Smartphone className="w-5 h-5" /></div>
             <span className="font-bold text-lg text-slate-900">Hawkforce</span>
          </div>
          <nav className="flex-1 p-4 space-y-2">
             <button onClick={() => setActiveTab('cards')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'cards' ? 'bg-purple-50 text-purple-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <LayoutGrid className="w-5 h-5" /> Cards
             </button>
             <button onClick={() => setActiveTab('contacts')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'contacts' ? 'bg-purple-50 text-purple-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <Users className="w-5 h-5" /> Contacts
             </button>
             <button onClick={() => setActiveTab('campaigns')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'campaigns' ? 'bg-purple-50 text-purple-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <Send className="w-5 h-5" /> Campaigns
             </button>
             <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'analytics' ? 'bg-purple-50 text-purple-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <BarChart2 className="w-5 h-5" /> Analytics
             </button>
             <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'settings' ? 'bg-purple-50 text-purple-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <Settings className="w-5 h-5" /> Settings
             </button>
          </nav>
          <div className="p-4 border-t border-slate-100">
             <div className="flex items-center gap-3 px-4 py-3 mb-2">
                <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full bg-slate-200 object-cover" />
                <div className="overflow-hidden">
                   <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                   <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
             </div>
             <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-500 text-sm font-medium transition-colors"><LogOut className="w-4 h-4" /> Sign Out</button>
          </div>
       </aside>

       {/* Mobile Bottom Navigation */}
       <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 z-50 flex justify-around p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
           <button onClick={() => setActiveTab('cards')} className={`${activeTab === 'cards' ? 'text-purple-600' : 'text-slate-400'}`}><LayoutGrid className="w-6 h-6" /></button>
           <button onClick={() => setActiveTab('contacts')} className={`${activeTab === 'contacts' ? 'text-purple-600' : 'text-slate-400'}`}><Users className="w-6 h-6" /></button>
           <button onClick={() => setActiveTab('campaigns')} className={`${activeTab === 'campaigns' ? 'text-purple-600' : 'text-slate-400'}`}><Send className="w-6 h-6" /></button>
           <button onClick={onLogout} className="text-slate-400"><LogOut className="w-6 h-6" /></button>
       </div>

       <main className="flex-1 overflow-hidden h-screen flex flex-col">
          <div className="flex-1 overflow-y-auto pb-24 md:pb-0">
            {activeTab === 'cards' && renderDashboard()}
            {activeTab === 'contacts' && renderContacts()}
            {activeTab === 'campaigns' && renderCampaigns()}
            {activeTab === 'analytics' && <div className="p-8">Analytics content...</div>}
            {activeTab === 'settings' && <div className="p-8">Settings content...</div>}
          </div>
       </main>

       {/* Modals */}
       {selectedContact && renderContactProfile(selectedContact)}
       
       {isContactModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                   <div>
                      <h3 className="text-xl font-bold text-slate-900">{contactToEdit?.id ? 'Edit Relationship' : 'New Professional Connection'}</h3>
                      <p className="text-sm text-slate-500">Capture important meeting notes and social links.</p>
                   </div>
                   <button onClick={() => setIsContactModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
                </div>
                <form onSubmit={handleSaveContact} className="p-8 space-y-6 overflow-y-auto">
                   <div className="space-y-4">
                      <div>
                         <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Full Name</label>
                         <input required name="name" type="text" value={contactToEdit?.name || ''} onChange={e => setContactToEdit({...contactToEdit, name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none" />
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Email</label>
                         <input required name="email" type="email" value={contactToEdit?.email || ''} onChange={e => setContactToEdit({...contactToEdit, email: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none" />
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Phone</label>
                         <input name="phone" type="tel" value={contactToEdit?.phone || ''} onChange={e => setContactToEdit({...contactToEdit, phone: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none" placeholder="+1..." />
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Segment / Tag</label>
                         <select value={contactToEdit?.tag || ''} onChange={e => setContactToEdit({...contactToEdit, tag: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none">
                            <option value="">None</option>
                            {segments.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                         </select>
                      </div>
                   </div>
                   <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                      <button type="button" onClick={() => setIsContactModalOpen(false)} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl">Cancel</button>
                      <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-200">Save Contact</button>
                   </div>
                </form>
             </div>
          </div>
       )}

       {showOnboarding && <OnboardingWizard user={user} onComplete={() => setShowOnboarding(false)} />}
       
       {isEditorOpen && (
         <DigitalCardEditor 
            card={editingCard}
            userId={user.id}
            onClose={() => setIsEditorOpen(false)}
            onSave={handleEditorSave}
         />
       )}

       {/* Custom CSS for some animations */}
       <style>{`
          @keyframes scale-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-scale-in {
            animation: scale-in 0.2s ease-out forwards;
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
       `}</style>
    </div>
  );
};

export default UserPortal;

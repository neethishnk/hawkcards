
import React, { useState, useEffect } from 'react';
import { DigitalCard, SocialField } from '../types';
import { StorageService } from '../services/storage';
import { 
  Palette, Layout, Type, Image as ImageIcon, Briefcase, User, 
  Plus, Trash2, Save, X, Smartphone, Mail, Globe, Linkedin, 
  Facebook, Twitter, Youtube, Instagram, Github, ArrowLeft, GripVertical, Upload, Camera, Check
} from 'lucide-react';

interface DigitalCardEditorProps {
  card: DigitalCard | null;
  userId: string;
  onClose: () => void;
  onSave: () => void;
}

const THEMES = [
  { id: 'modern', name: 'Modern', color: '#8b5cf6', description: 'Fluid wave design' },
  { id: 'classic', name: 'Classic', color: '#1e293b', description: 'Clean & professional' },
  { id: 'sleek', name: 'Sleek', color: '#f59e0b', description: 'Modern minimalist' },
  { id: 'flat', name: 'Flat', color: '#ef4444', description: 'Bold & simple' },
];

const SOCIAL_TYPES = [
  { id: 'email', icon: Mail, label: 'Email' },
  { id: 'phone', icon: Smartphone, label: 'Phone' },
  { id: 'website', icon: Globe, label: 'Website' },
  { id: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
  { id: 'twitter', icon: Twitter, label: 'X / Twitter' },
  { id: 'instagram', icon: Instagram, label: 'Instagram' },
  { id: 'github', icon: Github, label: 'GitHub' },
  { id: 'youtube', icon: Youtube, label: 'YouTube' },
];

const DigitalCardEditor: React.FC<DigitalCardEditorProps> = ({ card, userId, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'display' | 'info' | 'fields'>('info');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<DigitalCard>>({
    title: 'Personal Card',
    theme: 'modern',
    color: '#8b5cf6',
    firstName: '',
    lastName: '',
    jobTitle: '',
    company: '',
    department: '',
    fields: []
  });

  useEffect(() => {
    if (card) {
      setFormData(card);
    }
  }, [card]);

  const handleSave = () => {
    if (card) {
      StorageService.saveCard({ ...card, ...formData } as DigitalCard);
    } else {
      StorageService.createCard({ 
        ...formData, 
        userId 
      } as any);
    }
    onSave();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === 'avatar') {
          setFormData(prev => ({ ...prev, avatarUrl: base64String }));
        } else {
          setFormData(prev => ({ ...prev, coverImageUrl: base64String }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addField = (type: SocialField['type']) => {
    const newField: SocialField = {
      id: `field-${Date.now()}`,
      type,
      value: '',
      label: SOCIAL_TYPES.find(t => t.id === type)?.label
    };
    setFormData(prev => ({
      ...prev,
      fields: [...(prev.fields || []), newField]
    }));
  };

  const updateField = (id: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields?.map(f => f.id === id ? { ...f, value } : f)
    }));
  };

  const removeField = (id: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields?.filter(f => f.id !== id)
    }));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFields = [...(formData.fields || [])];
    const draggedItem = newFields[draggedIndex];
    newFields.splice(draggedIndex, 1);
    newFields.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setFormData(prev => ({ ...prev, fields: newFields }));
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const renderThemeMiniPreview = (themeId: string, color: string) => {
    return (
      <div className="w-full h-24 bg-slate-50 rounded-xl mb-3 relative overflow-hidden border border-slate-100">
        <div className="h-10 w-full" style={{ backgroundColor: color }}>
          {themeId === 'modern' && (
            <div className="absolute top-6 left-0 w-full h-8 bg-slate-50 rounded-t-[50%] scale-x-150"></div>
          )}
          {themeId === 'sleek' && (
             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          )}
        </div>
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-white bg-slate-200 shadow-sm"></div>
        <div className="mt-6 flex flex-col items-center gap-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full"></div>
          <div className="w-6 h-1 bg-slate-100 rounded-full"></div>
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    const themeColor = formData.color || '#8b5cf6';
    
    return (
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 w-[300px] h-[580px] overflow-hidden flex flex-col relative">
        {/* Header/Cover */}
        <div 
          className="h-32 w-full relative transition-colors duration-300 bg-slate-200 overflow-hidden"
          style={{ backgroundColor: themeColor }}
        >
          {formData.coverImageUrl && (
            <img src={formData.coverImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="" />
          )}
          
          {formData.theme === 'modern' && !formData.coverImageUrl && (
             <div className="absolute -bottom-8 -left-4 w-full h-16 bg-white rounded-t-[50%] scale-150"></div>
          )}
          {formData.theme === 'sleek' && (
             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          )}
        </div>

        {/* Content */}
        <div className="px-6 relative -mt-16 flex-1 flex flex-col items-center text-center">
           <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-slate-100 overflow-hidden mb-3">
             <img 
               src={formData.avatarUrl || `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}`} 
               alt="Profile" 
               className="w-full h-full object-cover"
             />
           </div>
           
           <h3 className="text-xl font-bold text-slate-800 leading-tight">
             {formData.firstName || 'First'} {formData.lastName || 'Name'}
           </h3>
           <p className="text-sm font-medium mt-1" style={{ color: themeColor }}>
             {formData.jobTitle || 'Job Title'}
           </p>
           <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">
             {formData.company || 'Company Name'}
           </p>

           <div className="mt-6 w-full space-y-3 overflow-y-auto max-h-[280px] pb-4 px-2">
              {formData.fields?.map(field => {
                const Icon = SOCIAL_TYPES.find(t => t.id === field.type)?.icon || Globe;
                return (
                  <div key={field.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 shadow-sm hover:border-purple-200 transition-colors">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: themeColor }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{field.label}</p>
                      <p className="text-sm text-slate-700 truncate font-semibold">{field.value || '...'}</p>
                    </div>
                  </div>
                );
              })}
              
              <button 
                className="w-full py-4 rounded-xl font-bold text-white shadow-xl mt-4"
                style={{ backgroundColor: themeColor }}
              >
                Connect Now
              </button>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-100 z-50 flex flex-col md:flex-row animate-fade-in">
      <div className="bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col md:w-80 h-full overflow-hidden">
         <div className="p-4 flex items-center gap-3 border-b border-slate-100">
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
               <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-slate-800">Card Designer</h2>
            <div className="ml-auto md:hidden">
               <button onClick={handleSave} className="text-purple-600 font-bold text-sm">Save</button>
            </div>
         </div>
         
         <div className="flex-1 overflow-y-auto">
            <div className="flex md:flex-col overflow-x-auto md:overflow-visible">
               <button 
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 md:flex-none flex items-center gap-3 px-6 py-4 border-b-2 md:border-b-0 md:border-l-4 transition-all ${activeTab === 'info' ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
               >
                  <User className="w-5 h-5" />
                  Profile
               </button>
               <button 
                  onClick={() => setActiveTab('display')}
                  className={`flex-1 md:flex-none flex items-center gap-3 px-6 py-4 border-b-2 md:border-b-0 md:border-l-4 transition-all ${activeTab === 'display' ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
               >
                  <Palette className="w-5 h-5" />
                  Appearance
               </button>
               <button 
                  onClick={() => setActiveTab('fields')}
                  className={`flex-1 md:flex-none flex items-center gap-3 px-6 py-4 border-b-2 md:border-b-0 md:border-l-4 transition-all ${activeTab === 'fields' ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
               >
                  <Layout className="w-5 h-5" />
                  Contacts
               </button>
            </div>
         </div>

         <div className="p-6 border-t border-slate-100 hidden md:block">
            <button 
               onClick={handleSave}
               className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-2"
            >
               <Save className="w-4 h-4" />
               Publish Changes
            </button>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-slate-50/50">
            <div className="max-w-2xl mx-auto pb-20">
               
               {activeTab === 'info' && (
                  <div className="space-y-8 animate-fade-in">
                     <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                           <User className="w-5 h-5 text-purple-600" />
                           Personal Information
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="col-span-1">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">First Name</label>
                              <input 
                                 type="text" 
                                 value={formData.firstName}
                                 onChange={e => setFormData({...formData, firstName: e.target.value})}
                                 className="w-full mt-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all" 
                              />
                           </div>
                           <div className="col-span-1">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last Name</label>
                              <input 
                                 type="text" 
                                 value={formData.lastName}
                                 onChange={e => setFormData({...formData, lastName: e.target.value})}
                                 className="w-full mt-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all" 
                              />
                           </div>
                           <div className="col-span-2">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Headline (Professional Bio)</label>
                              <textarea 
                                 rows={2}
                                 value={formData.headline || ''}
                                 onChange={e => setFormData({...formData, headline: e.target.value})}
                                 placeholder="e.g. Senior Product Designer | Passionate about UX"
                                 className="w-full mt-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none" 
                              />
                           </div>
                        </div>
                     </section>

                     <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                           <Briefcase className="w-5 h-5 text-blue-600" />
                           Company Affiliation
                        </h3>
                        <div className="space-y-6">
                           <div>
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Job Title</label>
                              <input 
                                 type="text" 
                                 value={formData.jobTitle}
                                 onChange={e => setFormData({...formData, jobTitle: e.target.value})}
                                 className="w-full mt-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all" 
                              />
                           </div>
                           <div className="grid grid-cols-2 gap-6">
                              <div>
                                 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Company</label>
                                 <input 
                                    type="text" 
                                    value={formData.company}
                                    onChange={e => setFormData({...formData, company: e.target.value})}
                                    className="w-full mt-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all" 
                                 />
                              </div>
                              <div>
                                 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Department</label>
                                 <input 
                                    type="text" 
                                    value={formData.department}
                                    onChange={e => setFormData({...formData, department: e.target.value})}
                                    className="w-full mt-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all" 
                                 />
                              </div>
                           </div>
                        </div>
                     </section>
                  </div>
               )}

               {activeTab === 'display' && (
                  <div className="space-y-8 animate-fade-in">
                     <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                           <ImageIcon className="w-5 h-5 text-emerald-600" />
                           Branding Assets
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Profile Photo</p>
                              <div className="relative group cursor-pointer">
                                 <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => handleFileUpload(e, 'avatar')} 
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                 />
                                 <div className="w-32 h-32 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden group-hover:border-purple-400 transition-colors">
                                    {formData.avatarUrl ? (
                                       <img src={formData.avatarUrl} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                       <Camera className="w-8 h-8 text-slate-300" />
                                    )}
                                 </div>
                                 <div className="mt-2 text-[10px] font-bold text-purple-600 uppercase">Change Photo</div>
                              </div>
                           </div>

                           <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Header / Cover Image</p>
                              <div className="relative group cursor-pointer">
                                 <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => handleFileUpload(e, 'cover')} 
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                 />
                                 <div className="w-full h-32 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden group-hover:border-purple-400 transition-colors">
                                    {formData.coverImageUrl ? (
                                       <img src={formData.coverImageUrl} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                       <div className="text-center">
                                          <Upload className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                                          <span className="text-[10px] font-bold text-slate-400 uppercase">Upload Cover</span>
                                       </div>
                                    )}
                                 </div>
                                 <div className="mt-2 text-[10px] font-bold text-purple-600 uppercase">Replace Background</div>
                              </div>
                           </div>
                        </div>
                     </section>

                     <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                           <Palette className="w-5 h-5 text-amber-500" />
                           Visual Identity
                        </h3>
                        <div className="space-y-8">
                           <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Design Layout & Theme</p>
                              <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
                                 {THEMES.map(theme => (
                                    <button
                                       key={theme.id}
                                       onClick={() => setFormData({...formData, theme: theme.id as any})}
                                       className={`p-5 rounded-[2rem] border-2 text-left transition-all relative group overflow-hidden ${formData.theme === theme.id ? 'border-purple-600 bg-purple-50 shadow-md ring-4 ring-purple-100' : 'border-slate-100 hover:border-slate-300 bg-white'}`}
                                    >
                                       {formData.theme === theme.id && (
                                          <div className="absolute top-4 right-4 bg-purple-600 text-white p-1 rounded-full z-20">
                                            <Check className="w-3 h-3" />
                                          </div>
                                       )}
                                       {renderThemeMiniPreview(theme.id, formData.color || theme.color)}
                                       <div>
                                          <span className="text-sm font-bold text-slate-800 uppercase block mb-0.5">{theme.name}</span>
                                          <span className="text-[10px] text-slate-400 font-medium">{theme.description}</span>
                                       </div>
                                    </button>
                                 ))}
                              </div>
                           </div>

                           <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Brand Accent Color</p>
                              <div className="flex flex-wrap gap-4">
                                 {['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#1e293b'].map(color => (
                                    <button
                                       key={color}
                                       onClick={() => setFormData({...formData, color})}
                                       className={`w-12 h-12 rounded-2xl transition-transform hover:scale-110 flex items-center justify-center shadow-sm ${formData.color === color ? 'ring-4 ring-purple-100 scale-110' : ''}`}
                                       style={{ backgroundColor: color }}
                                    >
                                       {formData.color === color && <div className="w-3 h-3 bg-white rounded-full"></div>}
                                    </button>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </section>
                  </div>
               )}

               {activeTab === 'fields' && (
                  <div className="space-y-6 animate-fade-in">
                     <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                           <div>
                              <h3 className="text-lg font-bold text-slate-900">Contact Methods</h3>
                              <p className="text-sm text-slate-500">Add or reorder your active social links.</p>
                           </div>
                           <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-widest border border-blue-100">
                              {formData.fields?.length || 0} Fields
                           </span>
                        </div>

                        <div className="space-y-4">
                           {formData.fields?.map((field, index) => {
                              const Icon = SOCIAL_TYPES.find(t => t.id === field.type)?.icon || Globe;
                              return (
                                 <div 
                                    key={field.id} 
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                    className={`group bg-white p-5 rounded-2xl border transition-all flex items-center gap-4 ${draggedIndex === index ? 'opacity-50 border-purple-400 bg-purple-50 shadow-inner' : 'border-slate-100 shadow-sm hover:border-slate-300'}`}
                                 >
                                    <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors">
                                       <GripVertical className="w-5 h-5" />
                                    </div>
                                    <div className={`p-3 rounded-xl text-white transition-colors`} style={{ backgroundColor: formData.color || '#8b5cf6' }}>
                                       <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                       <div className="flex items-center gap-2 mb-1">
                                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{field.label}</p>
                                          <span className="text-[10px] text-slate-300 font-mono">#{index + 1}</span>
                                       </div>
                                       <input 
                                          type="text" 
                                          value={field.value}
                                          onChange={e => updateField(field.id, e.target.value)}
                                          className="w-full text-sm font-semibold text-slate-800 bg-transparent outline-none border-b border-transparent focus:border-purple-200 placeholder:text-slate-300 transition-all"
                                          placeholder={`Link your ${field.type}...`}
                                       />
                                    </div>
                                    <button 
                                       onClick={() => removeField(field.id)}
                                       className="p-3 bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                    >
                                       <Trash2 className="w-4 h-4" />
                                    </button>
                                 </div>
                              );
                           })}

                           {formData.fields?.length === 0 && (
                              <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                                 <Smartphone className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                 <p className="text-slate-400 italic">No contact fields added yet.</p>
                              </div>
                           )}
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-100">
                           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Select a Field to Add</h4>
                           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              {SOCIAL_TYPES.map(type => (
                                 <button
                                    key={type.id}
                                    onClick={() => addField(type.id as any)}
                                    className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-purple-400 hover:shadow-xl hover:shadow-purple-50 transition-all group"
                                 >
                                    <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-purple-50 transition-colors">
                                       <type.icon className="w-6 h-6 text-slate-400 group-hover:text-purple-600" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-purple-700">{type.label}</span>
                                 </button>
                              ))}
                           </div>
                        </div>
                     </section>
                  </div>
               )}

            </div>
         </div>

         <div className="hidden lg:flex w-[450px] bg-slate-100 border-l border-slate-200 items-center justify-center p-8 relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')]"></div>
            {renderPreview()}
         </div>
      </div>
    </div>
  );
};

export default DigitalCardEditor;

import React, { useState } from 'react';
import { User, DigitalCard } from '../types';
import { StorageService } from '../services/storage';
import { ArrowRight, Check, Upload, User as UserIcon, Briefcase, Phone, Mail, Globe } from 'lucide-react';

interface OnboardingWizardProps {
  user: User;
  onComplete: () => void;
}

const STEPS = [
  { id: 'welcome', title: 'Welcome' },
  { id: 'basics', title: 'Basics' },
  { id: 'work', title: 'Work Info' },
  { id: 'contact', title: 'Contact' },
  { id: 'photo', title: 'Photo' },
];

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ user, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: user.name.split(' ')[0] || '',
    lastName: user.name.split(' ').slice(1).join(' ') || '',
    jobTitle: user.position || '',
    company: 'Hawkforce AI',
    email: user.email || '',
    phone: user.phone || '',
    website: '',
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    // Create the initial card
    StorageService.createCard({
      userId: user.id,
      title: 'Work',
      theme: 'modern',
      color: '#8b5cf6', // Purple as per screenshot
      firstName: formData.firstName,
      lastName: formData.lastName,
      jobTitle: formData.jobTitle,
      company: formData.company,
      fields: [
        { id: '1', type: 'email', value: formData.email, label: 'Email' },
        { id: '2', type: 'phone', value: formData.phone, label: 'Mobile' },
        ...(formData.website ? [{ id: '3', type: 'website' as const, value: formData.website, label: 'Website' }] : [])
      ],
      avatarUrl: user.avatarUrl || 'https://picsum.photos/200/300',
    });
    onComplete();
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 0:
        return (
          <div className="text-center space-y-8 animate-fade-in">
             <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">👋</span>
             </div>
             <div>
               <h2 className="text-3xl font-bold text-slate-900 mb-4">Welcome to Hawkforce!</h2>
               <p className="text-slate-600 max-w-md mx-auto">
                 Build connections in your own unique way. Create your first digital card and start expanding your network today.
               </p>
             </div>
             <div className="space-y-3 max-w-sm mx-auto">
                <div className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl">
                  <div className="bg-green-100 p-2 rounded-full"><Check className="w-4 h-4 text-green-600" /></div>
                  <span className="text-sm font-medium">Boost brand visibility</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl">
                  <div className="bg-blue-100 p-2 rounded-full"><Check className="w-4 h-4 text-blue-600" /></div>
                  <span className="text-sm font-medium">Exchange contact info instantly</span>
                </div>
             </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6 animate-fade-in max-w-md mx-auto">
             <div className="text-center mb-8">
               <h2 className="text-2xl font-bold text-slate-900">Let's start with the basics</h2>
               <p className="text-slate-500">Tell us a bit about yourself.</p>
             </div>
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                 <input 
                    type="text" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Jane"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                 <input 
                    type="text" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Doe"
                 />
               </div>
             </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-fade-in max-w-md mx-auto">
             <div className="text-center mb-8">
               <h2 className="text-2xl font-bold text-slate-900">Great to meet you!</h2>
               <p className="text-slate-500">What title and company should appear on your card?</p>
             </div>
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                 <div className="relative">
                   <Briefcase className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                   <input 
                      type="text" 
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                      className="w-full pl-10 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="e.g. Product Manager"
                   />
                 </div>
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                 <div className="relative">
                    <Globe className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        value={formData.company}
                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                        className="w-full pl-10 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="Company Name"
                    />
                 </div>
               </div>
             </div>
          </div>
        );
      case 3:
         return (
          <div className="space-y-6 animate-fade-in max-w-md mx-auto">
             <div className="text-center mb-8">
               <h2 className="text-2xl font-bold text-slate-900">Almost done!</h2>
               <p className="text-slate-500">How can people reach you?</p>
             </div>
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                 <div className="relative">
                   <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                   <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-10 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="jane@example.com"
                   />
                 </div>
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                 <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full pl-10 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="+1 (555) 000-0000"
                    />
                 </div>
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Website (Optional)</label>
                 <div className="relative">
                    <Globe className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <input 
                        type="url" 
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        className="w-full pl-10 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="www.yourportfolio.com"
                    />
                 </div>
               </div>
             </div>
          </div>
        );
      case 4:
         return (
          <div className="space-y-6 animate-fade-in max-w-md mx-auto text-center">
             <div className="mb-8">
               <h2 className="text-2xl font-bold text-slate-900">Make your card stand out 📸</h2>
               <p className="text-slate-500">Add a professional photo of yourself.</p>
             </div>
             
             <div className="flex flex-col items-center justify-center gap-6">
                <div className="w-48 h-48 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center relative overflow-hidden group cursor-pointer hover:border-purple-500 transition-colors">
                   {user.avatarUrl ? (
                     <img src={user.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                   ) : (
                     <div className="text-center p-4">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <span className="text-sm text-slate-500">Upload Photo</span>
                     </div>
                   )}
                </div>
                <p className="text-xs text-slate-400 max-w-xs">
                   Photo Tips: High-quality headshots look the best! You can always change this later.
                </p>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
       {/* Left Side - Visual/Progress */}
       <div className="hidden lg:flex lg:w-1/2 bg-purple-600 relative overflow-hidden items-center justify-center p-12">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-50"></div>
          
          <div className="bg-white rounded-[2rem] p-4 shadow-2xl w-[320px] h-[640px] relative z-10 transform rotate-[-2deg] transition-transform hover:rotate-0 duration-500">
             {/* Mock Phone Preview */}
             <div className="bg-slate-50 w-full h-full rounded-[1.5rem] overflow-hidden border border-slate-200 flex flex-col">
                 <div className="h-40 bg-purple-500 relative">
                    <div className="absolute bottom-0 left-0 w-full h-16 bg-slate-50 rounded-t-[50%] transform translate-y-8 scale-x-150"></div>
                 </div>
                 <div className="px-6 relative -mt-12 text-center">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-slate-200 mx-auto overflow-hidden">
                       <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${formData.firstName}`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xl font-bold mt-3 text-slate-800">{formData.firstName || 'Your'} {formData.lastName || 'Name'}</h3>
                    <p className="text-purple-600 text-sm font-medium">{formData.jobTitle || 'Job Title'}</p>
                    <p className="text-slate-400 text-xs mt-1">{formData.company}</p>

                    <div className="mt-6 space-y-3">
                       <div className="h-2 bg-slate-200 rounded-full w-3/4 mx-auto"></div>
                       <div className="h-2 bg-slate-200 rounded-full w-1/2 mx-auto"></div>
                    </div>
                    
                    <div className="mt-8 flex gap-3 justify-center">
                       <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <Mail className="w-4 h-4 text-purple-600" />
                       </div>
                       <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <Phone className="w-4 h-4 text-purple-600" />
                       </div>
                    </div>
                 </div>
             </div>
          </div>
       </div>

       {/* Right Side - Form */}
       <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-24 py-12">
          <div className="flex justify-between items-center mb-12">
             <div className="flex gap-2">
                {STEPS.map((_, idx) => (
                   <div key={idx} className={`h-1.5 w-8 rounded-full transition-colors ${idx <= currentStep ? 'bg-purple-600' : 'bg-slate-200'}`}></div>
                ))}
             </div>
             <button onClick={onComplete} className="text-slate-400 hover:text-slate-600 text-sm font-medium">Skip</button>
          </div>

          <div className="flex-1 flex flex-col justify-center">
             {renderStepContent()}
          </div>

          <div className="mt-12 flex justify-end">
             <button 
               onClick={handleNext}
               className="bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-purple-700 hover:shadow-xl transition-all flex items-center gap-2 group"
             >
               {currentStep === STEPS.length - 1 ? 'Finish' : 'Continue'}
               <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
       </div>
    </div>
  );
};

export default OnboardingWizard;

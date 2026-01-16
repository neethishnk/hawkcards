
import React, { useState, useEffect } from 'react';
import { User, CardStatus, LogEntry, UserRole } from '../types';
import { StorageService } from '../services/storage';
import { analyzeSystemLogs } from '../services/gemini';
import QRCode from 'react-qr-code';
import { 
  Users, CreditCard, Activity, ShieldAlert, Search, 
  MoreVertical, RefreshCw, XCircle, CheckCircle, Bot,
  LogOut, Plus, ChevronLeft, ChevronRight, ArrowUpDown, Clock,
  Mail, Download, Share2, Smartphone, MapPin, Briefcase, Calendar, Save, Wallet
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

interface AdminDashboardProps {
  onLogout: () => void;
}

const COLORS = ['#3b82f6', '#94a3b8', '#ef4444'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'users' | 'logs' | 'ai'>('users');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // User Detail View State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const [sortField, setSortField] = useState<'name' | 'email' | 'cardStatus'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadData();
  }, []);

  // Reset to page 1 when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortField, sortDirection]);

  const loadData = () => {
    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setUsers(StorageService.getUsers());
      setLogs(StorageService.getLogs());
      setLoading(false);
    }, 500);
  };

  const handleIssueCard = (userId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updatedUsers = StorageService.updateUserStatus(userId, CardStatus.ACTIVE);
    setUsers(updatedUsers);
    setLogs(StorageService.getLogs());
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser(updatedUsers.find(u => u.id === userId) || null);
    }
  };

  const handleRevokeCard = (userId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updatedUsers = StorageService.updateUserStatus(userId, CardStatus.REVOKED);
    setUsers(updatedUsers);
    setLogs(StorageService.getLogs());
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser(updatedUsers.find(u => u.id === userId) || null);
    }
  };

  const runAiAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeSystemLogs(logs);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  // Mock Actions
  const handleEmailCard = () => alert(`Sending business card via email for ${selectedUser?.name}...`);
  
  const handleDownloadCard = () => {
    if (!selectedUser) return;
    
    const parts = selectedUser.name.split(' ');
    const firstName = parts[0];
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';

    const vCardContent = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${selectedUser.name}`,
      `N:${lastName};${firstName};;;`,
      `ORG:Hawkforce AI;${selectedUser.department}`,
      `TITLE:${selectedUser.position}`,
      `TEL;TYPE=WORK,VOICE:${selectedUser.phone}`,
      `EMAIL;TYPE=WORK:${selectedUser.email}`,
      `ROLE:${selectedUser.role}`,
      'END:VCARD'
    ].join('\n');

    const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedUser.name.replace(/\s+/g, '_')}_contact.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleSmsShare = () => alert(`Sending SMS share link to ${selectedUser?.phone}...`);

  const handleAddToAppleWallet = () => alert("Provisioning Apple Wallet Pass for user...");
  const handleAddToGoogleWallet = () => alert("Provisioning Google Wallet Pass for user...");

  const handleSaveNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const newUser = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        role: formData.get('role') as UserRole,
        position: formData.get('position') as string,
        department: formData.get('department') as string,
        phone: formData.get('phone') as string,
    };

    StorageService.addUser(newUser);
    loadData();
    setIsAddingUser(false);
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Filter Users
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort Users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate Users
  const totalPages = Math.ceil(sortedUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Chart Data
  const statusData = [
    { name: 'Active', value: users.filter(u => u.cardStatus === CardStatus.ACTIVE).length },
    { name: 'Not Issued', value: users.filter(u => u.cardStatus === CardStatus.NOT_ISSUED).length },
    { name: 'Revoked', value: users.filter(u => u.cardStatus === CardStatus.REVOKED).length },
  ];

  const issuanceData = [
    { name: 'Mon', cards: 4 },
    { name: 'Tue', cards: 3 },
    { name: 'Wed', cards: 7 },
    { name: 'Thu', cards: 2 },
    { name: 'Fri', cards: 6 },
  ];

  const getStatusBadge = (status: CardStatus) => {
    switch (status) {
      case CardStatus.ACTIVE:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
            <CheckCircle className="w-3.5 h-3.5" />
            Active
          </span>
        );
      case CardStatus.REVOKED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 shadow-sm">
            <XCircle className="w-3.5 h-3.5" />
            Revoked
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Not Issued
          </span>
        );
    }
  };

  const renderAddUserForm = () => {
    return (
      <div className="flex flex-col h-full bg-slate-50 overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
          <button 
            onClick={() => setIsAddingUser(false)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
             <h2 className="text-xl font-bold text-slate-900">Add New User</h2>
             <p className="text-sm text-slate-500">Create a new profile in the identity system</p>
          </div>
        </div>

        <div className="p-6 max-w-3xl mx-auto w-full">
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <form onSubmit={handleSaveNewUser} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="col-span-2">
                      <h3 className="text-lg font-semibold text-slate-800 mb-1">Personal Information</h3>
                      <p className="text-sm text-slate-500 mb-4">Basic details for the user profile.</p>
                   </div>

                   <div className="col-span-2">
                     <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                     <div className="relative">
                        <Users className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                        <input required name="name" type="text" className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="e.g. Jane Doe" />
                     </div>
                   </div>

                   <div className="col-span-2 md:col-span-1">
                     <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                     <div className="relative">
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                        <input required name="email" type="email" className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="jane@company.com" />
                     </div>
                   </div>

                   <div className="col-span-2 md:col-span-1">
                     <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                     <div className="relative">
                        <Smartphone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                        <input required name="phone" type="tel" className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="+1 (555) 000-0000" />
                     </div>
                   </div>
                </div>

                <div className="border-t border-slate-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="col-span-2">
                      <h3 className="text-lg font-semibold text-slate-800 mb-1">Role & Position</h3>
                      <p className="text-sm text-slate-500 mb-4">Define access levels and job details.</p>
                   </div>

                   <div className="col-span-2 md:col-span-1">
                     <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                     <div className="relative">
                        <Briefcase className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                        <input required name="department" type="text" className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="e.g. Engineering" />
                     </div>
                   </div>

                   <div className="col-span-2 md:col-span-1">
                     <label className="block text-sm font-medium text-slate-700 mb-2">Job Title</label>
                     <div className="relative">
                        <Briefcase className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                        <input required name="position" type="text" className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="e.g. Senior Developer" />
                     </div>
                   </div>

                   <div className="col-span-2">
                     <label className="block text-sm font-medium text-slate-700 mb-2">System Role</label>
                     <div className="relative">
                        <ShieldAlert className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                        <select name="role" className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white">
                           <option value={UserRole.USER}>Standard User</option>
                           <option value={UserRole.ADMIN}>Administrator</option>
                        </select>
                     </div>
                     <p className="text-xs text-slate-500 mt-1">Administrators have full access to manage other users and system settings.</p>
                   </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                   <button 
                     type="button" 
                     onClick={() => setIsAddingUser(false)}
                     className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit" 
                     className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                   >
                     <Save className="w-4 h-4" />
                     Create User Profile
                   </button>
                </div>
              </form>
           </div>
        </div>
      </div>
    );
  };

  const renderUserDetail = () => {
    if (!selectedUser) return null;

    const userLogs = logs.filter(l => l.details.includes(selectedUser.name));
    const isActive = selectedUser.cardStatus === CardStatus.ACTIVE;

    const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${selectedUser.name}
ORG:Hawkforce AI
TITLE:${selectedUser.position}
TEL:${selectedUser.phone}
EMAIL:${selectedUser.email}
END:VCARD`;

    return (
      <div className="flex flex-col h-full bg-slate-50 overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
          <button 
            onClick={() => setSelectedUser(null)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
             <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
               User Profile
               {getStatusBadge(selectedUser.cardStatus)}
             </h2>
             <p className="text-sm text-slate-500">Manage identity assets and view activity</p>
          </div>
          <div className="ml-auto flex gap-2">
             {selectedUser.cardStatus !== CardStatus.ACTIVE ? (
                <button 
                  onClick={(e) => handleIssueCard(selectedUser.id, e)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Issue Card
                </button>
              ) : (
                <button 
                  onClick={(e) => handleRevokeCard(selectedUser.id, e)}
                  className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  Revoke Card
                </button>
              )}
          </div>
        </div>

        <div className="p-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Profile Info */}
            <div className="lg:col-span-4 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col items-center text-center">
                  <img src={selectedUser.avatarUrl} alt={selectedUser.name} className="w-24 h-24 rounded-full border-4 border-slate-50 shadow-md mb-4 object-cover" />
                  <h3 className="text-xl font-bold text-slate-900">{selectedUser.name}</h3>
                  <p className="text-slate-500 font-medium">{selectedUser.position}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full uppercase tracking-wider">
                    {selectedUser.department}
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <span className="text-sm">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Smartphone className="w-5 h-5 text-slate-400" />
                    <span className="text-sm">{selectedUser.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Briefcase className="w-5 h-5 text-slate-400" />
                    <span className="text-sm">{selectedUser.role}</span>
                  </div>
                   <div className="flex items-center gap-3 text-slate-600">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <span className="text-sm">Issued: {selectedUser.issuedAt ? new Date(selectedUser.issuedAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h4 className="font-semibold text-slate-900 mb-4">Quick Actions</h4>
                <div className="space-y-3">
                  <button onClick={handleEmailCard} className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-medium text-sm">
                    <Mail className="w-4 h-4" />
                    Email Business Card
                  </button>
                  <button onClick={handleDownloadCard} className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors font-medium text-sm">
                    <Download className="w-4 h-4" />
                    Download Assets
                  </button>
                  <button onClick={handleSmsShare} className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors font-medium text-sm">
                    <Share2 className="w-4 h-4" />
                    Share via SMS
                  </button>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button onClick={handleAddToAppleWallet} className="flex flex-col items-center justify-center gap-1 p-3 bg-black text-white rounded-xl hover:opacity-90 transition-opacity">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg" className="w-6 h-6" alt="Apple" />
                      <span className="text-[10px] font-medium">Apple Wallet</span>
                    </button>
                    <button onClick={handleAddToGoogleWallet} className="flex flex-col items-center justify-center gap-1 p-3 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
                      <Wallet className="w-6 h-6 text-blue-600" />
                       <span className="text-[10px] font-medium">Google Wallet</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Assets & Logs */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Identity Assets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Access Card Preview */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      Digital Access Card
                    </h4>
                    <div className={`relative overflow-hidden rounded-xl shadow-lg aspect-[1.58/1] transition-all duration-300 ${isActive ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900' : 'bg-slate-200 grayscale'}`}>
                       {!isActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 backdrop-blur-sm">
                          <div className="bg-white px-3 py-1.5 rounded-full flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            <span className="text-xs font-bold text-slate-900">Inactive</span>
                          </div>
                        </div>
                      )}
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-xl -mr-6 -mt-6"></div>
                      <div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-500/20 rounded-full blur-lg -ml-6 -mb-6"></div>

                      <div className="relative p-5 h-full flex flex-col justify-between text-white">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-1.5">
                            <div className="bg-white/10 p-1 rounded backdrop-blur-md">
                              <Smartphone className="w-3 h-3 text-white" />
                            </div>
                            <span className="font-semibold tracking-wider text-[10px]">HAWKFORCE</span>
                          </div>
                        </div>

                        <div className="flex items-end gap-3">
                          <img 
                            src={selectedUser.avatarUrl} 
                            alt={selectedUser.name} 
                            className="w-14 h-14 rounded-lg object-cover border border-white/20 shadow-sm"
                          />
                          <div>
                            <h2 className="text-lg font-bold leading-tight">{selectedUser.name}</h2>
                            <p className="text-blue-200 text-xs font-medium">{selectedUser.position}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                 </div>

                 {/* QR Code */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 w-full">
                      <CreditCard className="w-4 h-4 text-purple-600" />
                      Business Card QR
                    </h4>
                    <div className="flex-1 flex items-center justify-center p-2 bg-white rounded-xl border border-slate-100 shadow-inner">
                      <QRCode 
                        value={vCardData}
                        size={140}
                        level="M"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-4 text-center">Scan to save contact details</p>
                 </div>
              </div>

              {/* Logs Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                   <Activity className="w-4 h-4 text-slate-500" />
                   <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Activity Logs</h3>
                </div>
                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                   {userLogs.length > 0 ? (
                     userLogs.map(log => (
                       <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                             <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                               {log.action}
                             </span>
                             <span className="text-xs text-slate-400 font-mono">
                               {new Date(log.timestamp).toLocaleString()}
                             </span>
                          </div>
                          <p className="text-sm text-slate-700">{log.details}</p>
                       </div>
                     ))
                   ) : (
                     <div className="p-8 text-center text-slate-400 text-sm">
                       No activity recorded for this user yet.
                     </div>
                   )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Hawkforce</h1>
            <p className="text-xs text-slate-400">Admin Console</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => { setSelectedTab('users'); setSelectedUser(null); setIsAddingUser(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${selectedTab === 'users' && !selectedUser && !isAddingUser ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Users className="w-5 h-5" />
            <span>User Management</span>
          </button>
          <button 
            onClick={() => { setSelectedTab('logs'); setSelectedUser(null); setIsAddingUser(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${selectedTab === 'logs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Activity className="w-5 h-5" />
            <span>Audit Logs</span>
          </button>
          <button 
            onClick={() => { setSelectedTab('ai'); setSelectedUser(null); setIsAddingUser(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${selectedTab === 'ai' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Bot className="w-5 h-5" />
            <span>AI Insights</span>
            <span className="ml-auto bg-blue-500 text-xs px-2 py-0.5 rounded-full">New</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full px-4 py-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center">
            <span className="font-bold">Hawkforce Admin</span>
            <button onClick={onLogout}><LogOut className="w-5 h-5" /></button>
        </div>

        {isAddingUser ? renderAddUserForm() : selectedUser ? renderUserDetail() : (
          <>
            {/* Top Stats Bar */}
            <div className="bg-white border-b border-slate-200 p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {selectedTab === 'users' && 'User Directory'}
                    {selectedTab === 'logs' && 'System Audit'}
                    {selectedTab === 'ai' && 'AI Security Analysis'}
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Overview of digital identity operations
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Active Cards</p>
                      <p className="text-lg font-bold text-slate-800">{users.filter(u => u.cardStatus === CardStatus.ACTIVE).length}</p>
                    </div>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Total Users</p>
                      <p className="text-lg font-bold text-slate-800">{users.length}</p>
                    </div>
                  </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              
              {selectedTab === 'users' && (
                <div className="space-y-6">
                  {/* Search and Filters */}
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="flex flex-1 gap-4">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Search users..." 
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      {/* Sort Control */}
                      <div className="relative">
                        <select
                          className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-700 font-medium cursor-pointer"
                          value={`${sortField}-${sortDirection}`}
                          onChange={(e) => {
                            const [field, dir] = e.target.value.split('-');
                            setSortField(field as any);
                            setSortDirection(dir as any);
                          }}
                        >
                          <option value="name-asc">Name (A-Z)</option>
                          <option value="name-desc">Name (Z-A)</option>
                          <option value="email-asc">Email (A-Z)</option>
                          <option value="email-desc">Email (Z-A)</option>
                          <option value="cardStatus-asc">Status (Active First)</option>
                          <option value="cardStatus-desc">Status (Revoked First)</option>
                        </select>
                        <ArrowUpDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <button 
                      onClick={() => setIsAddingUser(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
                    >
                      <Plus className="w-5 h-5" />
                      Add User
                    </button>
                  </div>

                  {/* Users Table */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role & Dept</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {paginatedUsers.length > 0 ? (
                            paginatedUsers.map((user) => (
                              <tr 
                                key={user.id} 
                                onClick={() => setSelectedUser(user)}
                                className="hover:bg-slate-50 transition-colors cursor-pointer"
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                                    <div>
                                      <p className="font-semibold text-slate-900">{user.name}</p>
                                      <p className="text-xs text-slate-500">{user.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-sm text-slate-700 font-medium">{user.position}</p>
                                  <p className="text-xs text-slate-500">{user.department}</p>
                                </td>
                                <td className="px-6 py-4">
                                  {getStatusBadge(user.cardStatus)}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                  {user.cardStatus !== CardStatus.ACTIVE ? (
                                    <button 
                                      onClick={(e) => handleIssueCard(user.id, e)}
                                      className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                                    >
                                      Issue Card
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={(e) => handleRevokeCard(user.id, e)}
                                      className="text-red-600 hover:text-red-800 text-sm font-medium hover:underline"
                                    >
                                      Revoke
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                No users found matching your search.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    {sortedUsers.length > 0 && (
                      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-slate-500">
                          Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, sortedUsers.length)}</span> of <span className="font-medium">{sortedUsers.length}</span> results
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          
                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                  currentPage === page 
                                    ? 'bg-blue-600 text-white shadow-sm' 
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                   {/* Analytics Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                       <h3 className="font-bold text-slate-800 mb-4">Card Status Distribution</h3>
                       <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {statusData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                         </ResponsiveContainer>
                       </div>
                       <div className="flex justify-center gap-4 text-xs text-slate-500">
                          {statusData.map((entry, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                              {entry.name}
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="font-bold text-slate-800 mb-4">Weekly Issuance Activity</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={issuanceData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                              cursor={{fill: '#f8fafc'}}
                            />
                            <Bar dataKey="cards" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'logs' && (
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                   <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                     <h3 className="font-bold text-slate-800">System Activity Logs</h3>
                     <button onClick={loadData} className="text-slate-500 hover:text-blue-600">
                       <RefreshCw className="w-4 h-4" />
                     </button>
                   </div>
                   <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Timestamp</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {logs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm text-slate-500">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                                {log.action}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700">
                              {log.details}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
              )}

              {selectedTab === 'ai' && (
                 <div className="max-w-4xl mx-auto space-y-6">
                   <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg">
                     <div className="flex items-center gap-4 mb-4">
                       <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                         <Bot className="w-8 h-8 text-white" />
                       </div>
                       <div>
                         <h2 className="text-2xl font-bold">Hawkforce AI Analyst</h2>
                         <p className="text-blue-100">Powered by Gemini 3 Flash</p>
                       </div>
                     </div>
                     <p className="text-blue-50 max-w-2xl leading-relaxed">
                       Leverage generative AI to analyze security logs, detect anomalies in card issuance patterns, and generate executive summaries of system activity.
                     </p>
                     <button 
                      onClick={runAiAnalysis}
                      disabled={isAnalyzing}
                      className="mt-6 bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                     >
                       {isAnalyzing ? (
                         <>
                           <RefreshCw className="w-5 h-5 animate-spin" />
                           Analyzing System Data...
                         </>
                       ) : (
                         <>
                            <Activity className="w-5 h-5" />
                            Analyze Current Logs
                         </>
                       )}
                     </button>
                   </div>

                   {aiAnalysis && (
                     <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 animate-fade-in">
                       <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                         <Search className="w-5 h-5 text-blue-600" />
                         Analysis Result
                       </h3>
                       <div className="prose prose-slate max-w-none">
                         <p className="whitespace-pre-line text-slate-600 leading-relaxed">
                           {aiAnalysis}
                         </p>
                       </div>
                       <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                         <span>Generated by Gemini 3 Flash</span>
                         <span>{new Date().toLocaleTimeString()}</span>
                       </div>
                     </div>
                   )}

                   {!aiAnalysis && !isAnalyzing && (
                     <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                       <p className="text-slate-400">No analysis generated yet. Click the button above to start.</p>
                     </div>
                   )}
                 </div>
              )}

            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;

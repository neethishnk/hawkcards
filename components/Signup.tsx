import React, { useState } from 'react';
import { UserRole } from '../types';
import { ShieldCheck, UserCircle, Lock, Mail, Linkedin, Globe, User } from 'lucide-react';
import { StorageService } from '../services/storage';

interface SignupProps {
  onSignup: (role: UserRole, email: string) => void;
  onLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignup, onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const users = StorageService.getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      setError('Email already exists');
      return;
    }

    // Mock signup logic
    const newUser = StorageService.addUser({
      name,
      email,
      role: UserRole.USER,
      position: 'New Member',
      department: 'General',
      phone: ''
    });

    onSignup(newUser.role, newUser.email);
  };

  const handleSocialSignup = (platform: string) => {
    console.log(`Signing up with ${platform}`);
    // Mock social signup
    const email = `social.${platform.toLowerCase()}@example.com`;
    const users = StorageService.getUsers();
    let user = users.find(u => u.email === email);

    if (!user) {
      user = StorageService.addUser({
        name: `${platform} User`,
        email: email,
        role: UserRole.USER,
        position: 'Social Member',
        department: 'General',
        phone: ''
      });
    }

    onSignup(user.role, user.email);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="bg-blue-600 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-full shadow-lg">
              <ShieldCheck className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Join Hawkforce AI</h1>
          <p className="text-blue-100 text-sm">Create your secure identity profile</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
            >
              Create Account
            </button>
          </form>

          <div className="mt-6">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-4 text-xs text-slate-500 absolute uppercase">Or sign up with</span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSocialSignup('Google')}
                className="flex justify-center items-center py-2 px-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                title="Google"
              >
                <Mail className="w-5 h-5 text-red-500" />
              </button>
              <button
                onClick={() => handleSocialSignup('LinkedIn')}
                className="flex justify-center items-center py-2 px-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-blue-700" />
              </button>
              <button
                onClick={() => handleSocialSignup('Microsoft')}
                className="flex justify-center items-center py-2 px-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                title="Microsoft"
              >
                <Globe className="w-5 h-5 text-blue-500" />
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <button
                onClick={onLogin}
                className="text-blue-600 font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
import React, { useState } from 'react';
import { UserRole, ViewState, User } from './types';
import Login from './components/Login';
import Signup from './components/Signup';
import AdminDashboard from './components/AdminDashboard';
import UserPortal from './components/UserPortal';
import PublicCard from './components/PublicCard';
import { StorageService } from './services/storage';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.LOGIN);
  const [publicCardId, setPublicCardId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  React.useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/c/')) {
      const cardId = path.split('/c/')[1];
      if (cardId) {
        setPublicCardId(cardId);
      }
    }
  }, []);

  const handleLogin = (role: UserRole, email: string) => {
    // Determine view based on role
    const users = StorageService.getUsers();
    const user = users.find(u => u.email === email);
    
    if (user) {
      setCurrentUser(user);
      if (role === UserRole.ADMIN) {
        setViewState(ViewState.ADMIN_DASHBOARD);
      } else {
        setViewState(ViewState.USER_PORTAL);
      }
      StorageService.addLog('LOGIN', `User ${email} logged in`);
    }
  };

  const handleLogout = () => {
    if (currentUser) {
       StorageService.addLog('LOGOUT', `User ${currentUser.email} logged out`);
    }
    setCurrentUser(null);
    setViewState(ViewState.LOGIN);
  };

  const navigateToSignup = () => setViewState(ViewState.SIGNUP);
  const navigateToLogin = () => setViewState(ViewState.LOGIN);

  if (publicCardId) {
    return <PublicCard cardId={publicCardId} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {viewState === ViewState.LOGIN && (
        <Login onLogin={handleLogin} onSignup={navigateToSignup} />
      )}

      {viewState === ViewState.SIGNUP && (
        <Signup onSignup={handleLogin} onLogin={navigateToLogin} />
      )}
      
      {viewState === ViewState.ADMIN_DASHBOARD && (
        <AdminDashboard onLogout={handleLogout} />
      )}
      
      {viewState === ViewState.USER_PORTAL && currentUser && (
        <UserPortal user={currentUser} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;
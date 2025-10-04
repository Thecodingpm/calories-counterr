import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
};

const Main: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="bg-base-200 min-h-screen font-sans text-base-content">
      {user ? <Dashboard /> : <AuthPage />}
    </div>
  );
};

export default App;
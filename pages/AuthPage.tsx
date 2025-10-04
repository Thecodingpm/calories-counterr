import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        setError("Please fill in all fields.");
        return;
    }
    setIsLoading(true);
    setError('');
    
    let success = false;
    if (isLogin) {
      success = await login(email, password);
    } else {
      success = await register(email, password);
    }
    
    if (!success) {
      setError(isLogin ? 'Invalid email or password.' : 'Email already in use.');
    }

    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200 p-4">
      <div className="relative flex flex-col md:flex-row w-full max-w-4xl bg-base-100 rounded-2xl shadow-2xl overflow-hidden">
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
            <div className="flex items-center space-x-2 mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                <h1 className="text-2xl font-bold text-base-content">CalorieAI</h1>
            </div>
          
            <h2 className="text-3xl font-bold text-base-content mb-2">
              {isLogin ? 'Welcome Back' : 'Create Your Account'}
            </h2>
            <p className="text-neutral mb-6">
              {isLogin ? 'Log in to continue your journey.' : 'Start tracking your nutrition today.'}
            </p>

            <div className="flex border-b border-base-300 mb-6">
              <button
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${isLogin ? 'border-b-2 border-primary text-primary' : 'text-neutral/70'}`}
              >
                LOGIN
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${!isLogin ? 'border-b-2 border-primary text-primary' : 'text-neutral/70'}`}
              >
                REGISTER
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="text-sm font-bold text-neutral block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-3 bg-base-200 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="password"  className="text-sm font-bold text-neutral block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3 bg-base-200 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                  placeholder="••••••••"
                />
              </div>
              {error && <p className="text-sm text-center text-error">{error}</p>}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 mt-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60 transition-colors"
                >
                  {isLoading ? <Spinner size="sm" /> : isLogin ? 'Login to Your Account' : 'Create Account'}
                </button>
              </div>
            </form>
        </div>
        <div className="hidden md:block w-1/2 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1543353071-873f6b6a6a89?q=80&w=2070&auto=format&fit=crop')"}}>
            <div className="w-full h-full bg-black/30"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
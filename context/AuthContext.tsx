
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { loginUser, registerUser } from '../services/apiService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateGoal: (newGoal: number) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    const response = await loginUser(email, pass);
    if (response) {
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return true;
    }
    return false;
  };

  const register = async (email: string, pass: string): Promise<boolean> => {
    const response = await registerUser(email, pass);
    if (response) {
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const updateGoal = (newGoal: number) => {
    if (user) {
        const updatedUser = { ...user, dailyCalorieGoal: newGoal };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };


  if (loading) {
      return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateGoal }}>
      {children}
    </AuthContext.Provider>
  );
};

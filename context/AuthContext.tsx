import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ProgramType, SubjectType } from '../types';
import { loadFromStorage, saveToStorage } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  login: (name: string, password: string, program: ProgramType, subject: SubjectType) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = loadFromStorage<User | null>('user', null);
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = (name: string, password: string, program: ProgramType, subject: SubjectType) => {
    if (!password) return false;
    
    // Create a unique ID based on name and password hash simulation
    // In a local-only app, we treat the combination as the identity
    const id = `${name.toLowerCase().replace(/\s/g, '')}_${password}`;
    
    const newUser: User = {
      id, 
      name,
      password, // Storing locally for "session" validation
      program,
      subject
    };
    setUser(newUser);
    saveToStorage('user', newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    saveToStorage('user', null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
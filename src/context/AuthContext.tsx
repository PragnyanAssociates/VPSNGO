// 📂 File: src/context/AuthContext.tsx (FINAL WITH NOTIFICATION COUNT)

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../apiConfig';

interface User {
  id: string;
  username: string;
  full_name: string;
  role: 'admin' | 'teacher' | 'student' | 'donor';
}

interface AuthState { user: User | null; }

interface AuthContextType {
  authState: AuthState;
  login: (user: User, token: string) => Promise<void>; 
  logout: () => Promise<void>;
  isLoading: boolean;
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps { children: ReactNode; }

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({ user: null });
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userString = await AsyncStorage.getItem('userSession');
        if (userString) {
          const user = JSON.parse(userString);
          setAuthState({ user });
          // Fetch initial count after user is loaded
          const response = await fetch(`${API_BASE_URL}/api/notifications/unread-count/${user.id}`);
          const data = await response.json();
          if (data && typeof data.count === 'number') setUnreadCount(data.count);
        }
      } catch (e) { console.error("AuthContext: Failed to load session", e); } 
      finally { setIsLoading(false); }
    };
    loadUser();
  }, []);
  
  const login = async (user: User, token: string) => {
    try {
      setAuthState({ user });
      await AsyncStorage.setItem('userSession', JSON.stringify(user));
      await AsyncStorage.setItem('userToken', token);
      // Fetch initial count on login
      const response = await fetch(`${API_BASE_URL}/api/notifications/unread-count/${user.id}`);
      const data = await response.json();
      if (data && typeof data.count === 'number') setUnreadCount(data.count);
    } catch (e) { console.error("AuthContext: Failed to save session", e); }
  };

  const logout = async () => {
    try {
      setAuthState({ user: null });
      setUnreadCount(0);
      await AsyncStorage.multiRemove(['userSession', 'userToken']);
    } catch (e) { console.error("AuthContext: Failed to clear session", e); }
  };

  const value = { authState, login, logout, isLoading, unreadCount, setUnreadCount };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return {
    user: context.authState.user,
    login: context.login,
    logout: context.logout,
    isLoading: context.isLoading,
    unreadCount: context.unreadCount,
    setUnreadCount: context.setUnreadCount,
  };
};
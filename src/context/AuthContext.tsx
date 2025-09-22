// 📂 File: src/context/AuthContext.tsx (FINAL AND CORRECTED)

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// ★★★ 1. IMPORT apiClient SO WE CAN CONFIGURE IT ★★★
import apiClient from '../api/client';

interface User {
  id: string;
  username: string;
  full_name: string;
  role: 'admin' | 'teacher' | 'student' | 'donor';
}

interface AuthState {
  user: User | null;
  token: string | null;
}

interface AuthContextType {
  authState: AuthState;
  login: (user: User, token: string) => Promise<void>; 
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps { children: ReactNode; }

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({ user: null, token: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const userString = await AsyncStorage.getItem('userSession');
        const tokenString = await AsyncStorage.getItem('userToken');

        if (userString && tokenString) {
          const user = JSON.parse(userString);
          
          // ★★★ 2. CONFIGURE apiClient WITH THE LOADED TOKEN ★★★
          // This is the critical missing step for when the app restarts.
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${tokenString}`;

          setAuthState({ user, token: tokenString });
        }
      } catch (e) { 
        console.error("AuthContext: Failed to load session", e);
        await AsyncStorage.multiRemove(['userSession', 'userToken']);
      } 
      finally { 
        setIsLoading(false); 
      }
    };
    loadSession();
  }, []);
  
  const login = async (user: User, token: string) => {
    try {
      // ★★★ 3. CONFIGURE apiClient WITH THE NEW TOKEN ON LOGIN ★★★
      // This makes API calls work immediately after logging in.
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setAuthState({ user, token }); 
      await AsyncStorage.setItem('userSession', JSON.stringify(user));
      await AsyncStorage.setItem('userToken', token);
    } catch (e) { console.error("AuthContext: Failed to save session", e); }
  };

  const logout = async () => {
    try {
      // ★★★ 4. REMOVE THE TOKEN FROM apiClient ON LOGOUT ★★★
      // This ensures that the guard doesn't have an old, invalid badge.
      delete apiClient.defaults.headers.common['Authorization'];

      setAuthState({ user: null, token: null });
      await AsyncStorage.multiRemove(['userSession', 'userToken']);
    } catch (e) { console.error("AuthContext: Failed to clear session", e); }
  };

  const value = { authState, login, logout, isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return {
    user: context.authState.user,
    token: context.authState.token,
    login: context.login,
    logout: context.logout,
    isLoading: context.isLoading,
  };
};
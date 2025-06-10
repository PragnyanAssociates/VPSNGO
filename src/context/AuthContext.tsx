// 📂 File: src/context/AuthContext.tsx (FINAL - COPY/PASTE THIS)

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the shape of the user object to include all roles
interface User {
  id: string;
  username: string;
  role: 'admin' | 'teacher' | 'student' | 'donor';
}

interface AuthState {
  user: User | null;
}

interface AuthContextType {
  authState: AuthState;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({ user: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const userString = await AsyncStorage.getItem('userSession');
        if (userString) {
          const user: User = JSON.parse(userString);
          setAuthState({ user });
        }
      } catch (e) {
        console.error("AuthContext: Failed to load user session", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserFromStorage();
  }, []);

  const login = async (user: User) => {
    try {
      setAuthState({ user });
      await AsyncStorage.setItem('userSession', JSON.stringify(user));
    } catch (e) {
      console.error("AuthContext: Failed to save user session", e);
    }
  };

  const logout = async () => {
    try {
      setAuthState({ user: null });
      await AsyncStorage.removeItem('userSession');
    } catch (e) {
      console.error("AuthContext: Failed to clear user session", e);
    }
  };

  const value = {
    authState,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return {
    user: context.authState.user,
    login: context.login,
    logout: context.logout,
    isLoading: context.isLoading,
  };
};
// 📂 File: src/context/AuthContext.tsx (REPLACE ENTIRE FILE)

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interfaces remain the same
interface User {
  id: string;
  username: string;
  full_name: string;
  role: 'admin' | 'teacher' | 'student' | 'donor';
}

interface AuthState {
  user: User | null;
  token: string | null; // ★ 1. ADD TOKEN TO THE STATE
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
  // ★ 2. INITIAL STATE NOW INCLUDES THE TOKEN
  const [authState, setAuthState] = useState<AuthState>({ user: null, token: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const userString = await AsyncStorage.getItem('userSession');
        const tokenString = await AsyncStorage.getItem('userToken'); // Also load the token

        if (userString && tokenString) {
          const user = JSON.parse(userString);
          // Set both user and token in the state from storage
          setAuthState({ user, token: tokenString });
        }
      } catch (e) { 
        console.error("AuthContext: Failed to load session", e);
        // Clear storage if loading fails to prevent a broken state
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
      // ★ 3. SET BOTH USER AND TOKEN ON LOGIN
      setAuthState({ user, token }); 
      await AsyncStorage.setItem('userSession', JSON.stringify(user));
      await AsyncStorage.setItem('userToken', token);
    } catch (e) { console.error("AuthContext: Failed to save session", e); }
  };

  const logout = async () => {
    try {
      // ★ 4. CLEAR BOTH USER AND TOKEN ON LOGOUT
      setAuthState({ user: null, token: null });
      await AsyncStorage.multiRemove(['userSession', 'userToken']);
    } catch (e) { console.error("AuthContext: Failed to clear session", e); }
  };

  // The context now only provides the core auth data and functions.
  const value = { authState, login, logout, isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ★ 5. UPDATE the custom hook to EXPORT THE TOKEN
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return {
    user: context.authState.user,
    token: context.authState.token, // This is the crucial addition
    login: context.login,
    logout: context.logout,
    isLoading: context.isLoading,
  };
};
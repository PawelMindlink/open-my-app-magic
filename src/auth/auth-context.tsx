
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithRedirect, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // This effect is the single source of truth for the user's auth state.
  // onAuthStateChanged handles all cases, including startup and redirect returns.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    // Request access to the user's Google Analytics data.
    provider.addScope('https://www.googleapis.com/auth/analytics.readonly');
    try {
      // signInWithRedirect is more robust in complex environments than signInWithPopup.
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Error during sign-in redirect:", error);
      setLoading(false); // Ensure loading is false on error
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };
  
  const getToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    // Force refresh is not always needed, but can be useful.
    // Let's use false to rely on cached token unless expired.
    return await auth.currentUser.getIdToken(); 
  }


  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

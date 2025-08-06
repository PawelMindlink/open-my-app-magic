
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithRedirect, GoogleAuthProvider, signOut as firebaseSignOut, getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Adjust this path if needed

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

  useEffect(() => {
    // This handles the redirect result after signing in.
    const handleRedirectResult = async () => {
      try {
        await getRedirectResult(auth);
        // The onAuthStateChanged listener will handle setting the user and loading state.
      } catch (error) {
        console.error("Error getting redirect result:", error);
      }
      // We don't set loading to false here to avoid race conditions.
      // onAuthStateChanged is the single source of truth for the auth state.
    };

    handleRedirectResult();

    // This handles keeping the user logged in across sessions and after redirects.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // This can be null if signed out.
      setLoading(false); // This is the reliable point to end the loading state.
    });
    
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/analytics.readonly');
    try {
      // We don't need to await here, the page will redirect.
      signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Error during sign-in redirect:", error);
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null); // Explicitly set user to null on sign out
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };
  
  const getToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken(true); // Force refresh
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

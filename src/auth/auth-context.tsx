
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, Auth, UserCredential } from 'firebase/auth';
import { authPromise } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => void;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    authPromise.then(authInstance => {
        setAuth(authInstance);
        const unsubscribe = onAuthStateChanged(authInstance, (user) => {
            setUser(user);
            setLoading(false);
        });
        // Cleanup subscription on unmount
        return () => unsubscribe();
    });
  }, []);

  const signIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/analytics.readonly');
    try {
      const result: UserCredential = await signInWithPopup(auth, provider);
      setUser(result.user);
      setLoading(false);
    } catch (error: any) {
      // Don't show a toast if the user simply closed the popup
      if (error.code !== 'auth/popup-closed-by-user') {
          console.error("Error during sign-in:", error);
          toast({
            variant: "destructive",
            title: "Sign-In Failed",
            description: error.message || "An unknown error occurred during sign-in.",
          });
      }
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };
  
  const getToken = async (): Promise<string | null> => {
    if (!auth || !auth.currentUser) return null;
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

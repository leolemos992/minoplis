'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseContextState {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (firebaseUser) {
            setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
        } else {
            // If no user, sign in anonymously for a seamless solo experience.
            signInAnonymously(auth).catch((error) => {
                 console.error("Anonymous sign-in failed:", error);
                 setUserAuthState({ user: null, isUserLoading: false, userError: error });
            });
        }
      },
      (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    return () => unsubscribe();
  }, [auth]);

  const contextValue = useMemo((): FirebaseContextState => ({
    firebaseApp,
    firestore,
    auth,
    user: userAuthState.user,
    isUserLoading: userAuthState.isUserLoading,
    userError: userAuthState.userError,
  }), [firebaseApp, firestore, auth, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

function useFirebaseContext() {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useFirebase hook must be used within a FirebaseProvider.');
    }
    return context;
}

export const useFirebase = () => useFirebaseContext();
export const useAuth = (): Auth => useFirebaseContext().auth!;
export const useFirestore = (): Firestore => useFirebaseContext().firestore!;
export const useFirebaseApp = (): FirebaseApp => useFirebaseContext().firebaseApp!;
export const useUser = () => {
    const { user, isUserLoading, userError } = useFirebaseContext();
    return { user, isUserLoading, userError };
};

type MemoFirebase<T> = T & { __memo?: boolean };
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
    const memoized = useMemo(factory, deps);
    if (typeof memoized === 'object' && memoized !== null) {
        (memoized as MemoFirebase<T>).__memo = true;
    }
    return memoized;
}

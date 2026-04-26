import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthUser } from '../services/auth.ts';
import {
  completeRegistrationRequest,
  forgotPasswordRequest,
  loginRequest,
  resetPasswordRequest,
  startRegistrationRequest,
} from '../services/auth.ts';

type RegisterPayload = {
  contact: string;
  code: string;
  password: string;
  fullName: string;
  username: string;
};

type AuthResult = {
  ok: boolean;
  message?: string;
  previewCode?: string;
  previewMessage?: string;
};

type AuthContextValue = {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  startRegistration: (contact: string) => Promise<AuthResult>;
  registerUser: (payload: RegisterPayload) => Promise<AuthResult>;
  loginUser: (payload: { contact: string; password: string }) => Promise<AuthResult>;
  requestPasswordReset: (contact: string) => Promise<AuthResult>;
  resetPassword: (payload: { contact: string; code: string; newPassword: string }) => Promise<AuthResult>;
  logoutUser: () => void;
};

const SESSION_STORAGE_KEY = 'panhel-auth-session-v2';
const AuthContext = createContext<AuthContextValue | null>(null);

function readSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function writeSession(user: AuthUser | null) {
  if (!user) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => readSession());

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === SESSION_STORAGE_KEY) {
        setCurrentUser(readSession());
      }
    }

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      startRegistration: async (contact) => {
        try {
          const response = await startRegistrationRequest(contact);
          return {
            ok: true,
            message: response.message,
            previewCode: response.previewCode,
            previewMessage: response.previewMessage,
          };
        } catch (error) {
          return {
            ok: false,
            message: error instanceof Error ? error.message : 'Δεν μπόρεσα να στείλω κωδικό επιβεβαίωσης.',
          };
        }
      },
      registerUser: async ({ contact, code, password, fullName, username }) => {
        try {
          const response = await completeRegistrationRequest({
            contact,
            code,
            password,
            fullName,
            username,
          });

          writeSession(response.user);
          setCurrentUser(response.user);
          return { ok: true, message: response.message };
        } catch (error) {
          return {
            ok: false,
            message: error instanceof Error ? error.message : 'Δεν μπόρεσα να δημιουργήσω λογαριασμό.',
          };
        }
      },
      loginUser: async ({ contact, password }) => {
        try {
          const response = await loginRequest({ contact, password });
          writeSession(response.user);
          setCurrentUser(response.user);
          return { ok: true, message: response.message };
        } catch (error) {
          return {
            ok: false,
            message: error instanceof Error ? error.message : 'Δεν μπόρεσα να σε συνδέσω.',
          };
        }
      },
      requestPasswordReset: async (contact) => {
        try {
          const response = await forgotPasswordRequest(contact);
          return {
            ok: true,
            message: response.successMessage ?? response.message,
            previewCode: response.previewCode,
            previewMessage: response.previewMessage,
          };
        } catch (error) {
          return {
            ok: false,
            message: error instanceof Error ? error.message : 'Δεν μπόρεσα να στείλω κωδικό ανάκτησης.',
          };
        }
      },
      resetPassword: async ({ contact, code, newPassword }) => {
        try {
          const response = await resetPasswordRequest({
            contact,
            code,
            newPassword,
          });

          writeSession(response.user);
          setCurrentUser(response.user);
          return { ok: true, message: response.message };
        } catch (error) {
          return {
            ok: false,
            message: error instanceof Error ? error.message : 'Δεν μπόρεσα να αλλάξω τον κωδικό.',
          };
        }
      },
      logoutUser: () => {
        writeSession(null);
        setCurrentUser(null);
      },
    }),
    [currentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}

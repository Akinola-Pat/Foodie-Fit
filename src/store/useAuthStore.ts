import { create } from 'zustand';

interface AuthState {
  userId: string | null;
  email: string | null;
  isGuest: boolean;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  setAuth: (userId: string, email: string) => void;
  setGuest: (isGuest: boolean) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  signOut: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  email: null,
  isGuest: true,
  isAuthenticated: false,
  hasCompletedOnboarding: false,

  setAuth: (userId: string, email: string) =>
    set({
      userId,
      email,
      isGuest: false,
      isAuthenticated: true,
    }),

  setGuest: (isGuest: boolean) =>
    set({
      isGuest,
      isAuthenticated: !isGuest,
      userId: isGuest ? 'guest' : null,
    }),

  setOnboardingCompleted: (completed: boolean) =>
    set({ hasCompletedOnboarding: completed }),

  signOut: () =>
    set({
      userId: null,
      email: null,
      isGuest: true,
      isAuthenticated: false,
    }),

  reset: () =>
    set({
      userId: null,
      email: null,
      isGuest: true,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
    }),
}));

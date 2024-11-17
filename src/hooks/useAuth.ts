import { create } from 'zustand';
import { authAPI } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,

  login: async (email: string, password: string) => {
    try {
      const { user } = await authAPI.login(email, password);
      set({ 
        user, 
        isAuthenticated: true,
        isAdmin: user.role === 'admin'
      });
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    authAPI.logout();
    set({ 
      user: null, 
      isAuthenticated: false,
      isAdmin: false
    });
  },

  checkAuth: async () => {
    try {
      const user = await authAPI.verifyToken();
      set({ 
        user,
        isAuthenticated: true,
        isAdmin: user.role === 'admin'
      });
    } catch (error) {
      authAPI.logout();
      set({ 
        user: null, 
        isAuthenticated: false,
        isAdmin: false
      });
    }
  }
}));
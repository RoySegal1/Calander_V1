import { createContext, useContext, useState, ReactNode } from "react";
import { ApiService } from "./Api";
import { AuthState } from "../types";

interface AuthContextType {
  auth: AuthState;
  loading: boolean;
  error: string | null;
  handleLogin: (username: string, password: string) => Promise<void>;
  handleSignup: (username: string, password: string, department: string) => Promise<void>;
  handleGuestLogin: () => Promise<void>;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isGuest: false,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { user } = await ApiService.login(username, password);
      setAuth({ user, isGuest: false, isAuthenticated: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (username: string, password: string, department: string) => {
    setLoading(true);
    setError(null);
    try {
      const { user } = await ApiService.signup(username, password, department);
      setAuth({ user, isGuest: false, isAuthenticated: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { user } = await ApiService.guestLogin();
      setAuth({ user, isGuest: true, isAuthenticated: false });
    } catch {
      setError("Failed to login as guest.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuth({ user: null, isGuest: false, isAuthenticated: false });
    ApiService.logout(); // optional
  };

  return (
    <AuthContext.Provider value={{ auth, loading, error, handleLogin, handleSignup, handleGuestLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

import { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";
import { AuthState, User} from "../types";

interface AuthResponse {
  status: string;
  user: User
  message: string;
}

interface AuthContextType {
  auth: AuthState;
  loading: boolean;
  error: string | null;
  handleLogin: (username: string, password: string) => Promise<void>;
  handleSignup: (username: string, password: string) => Promise<void>;
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
      const response = await axios.post<AuthResponse>("http://localhost:8000/auth/login", {
        username,
        password,
      });
      if (response.data.status === "success") {
        setAuth({
          user: response.data.user,
          isGuest: false,
          isAuthenticated: true,
        });
      }
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } };
      if (error.response?.data?.detail) {
        setError(error.response.data.detail || "Login failed");
      } else {
        setError("Network error. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<AuthResponse>("http://localhost:8000/auth/signup", {
        username,
        password,
        department: "מדעי המחשב", // Default department
      });
      if (response.data.status === "success") {
        setAuth({
          user: response.data.user,
          isGuest: false,
          isAuthenticated: true,
        });
      }
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } };
      if (error.response?.data?.detail) {
        setError(error.response.data.detail || "Signup failed");
      } else {
        setError("Network error. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<AuthResponse>("http://localhost:8000/auth/guest");
      if (response.data.status === "success") {
        setAuth({
          user: response.data.user,
          isGuest: true,
          isAuthenticated: false,
        });
      }
    } catch (err) {
      setError("Failed to login as guest. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuth({
      user: null,
      isGuest: false,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{ auth, loading, error, handleLogin, handleSignup, handleGuestLogin, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
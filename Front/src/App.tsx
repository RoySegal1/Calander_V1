// import { useState } from 'react';
// import LoginPage from './components/LoginPage';
// import MainLayout from './components/MainLayout';
// import { AuthState } from './types';
// import { mockUser } from './data/mockData';
//
// function App() {
//   const [auth, setAuth] = useState<AuthState>({
//     user: null,
//     isGuest: false,
//     isAuthenticated: false,
//   });
//
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const handleLogin = (_: string, __: string) => {         //WHAT IS HERE?
//     // Mock authentication - in a real app, this would make an API call
//     setAuth({
//       user: mockUser,
//       isGuest: false,
//       isAuthenticated: true,
//     });
//   };
//
//   const handleGuestLogin = () => {
//     setAuth({
//       user: null,
//       isGuest: true,
//       isAuthenticated: false,
//     });
//   };
//
//   if (!auth.isAuthenticated && !auth.isGuest) {
//     return <LoginPage onLogin={handleLogin} onGuestLogin={handleGuestLogin} />;
//   }
//
//   return <MainLayout />;
// }
//
// export default App;










import { useState } from 'react';
import axios from 'axios';
import LoginPage from './components/LoginPage';
import MainLayout from './components/MainLayout';
import { AuthState } from './types';

// Define the response types for better type safety
interface AuthResponse {
  status: string;
  user: {
    username?: string;
    is_guest?: boolean;
    department: string;
    saved_courses?: string[];
    progress?: Record<string, any>;
  };
  message: string;
}

function App() {
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
      const response = await axios.post<AuthResponse>('http://localhost:8000/auth/login', {
        username,
        password
      });

      if (response.data.status === 'success') {
        setAuth({
          user: response.data.user,
          isGuest: false,
          isAuthenticated: true,
        });
      }
    } catch (err) {
      // Type error handling
      const error = err as { response?: { data?: { detail?: string } } };
      if (error.response?.data?.detail) {
        setError(error.response.data.detail || 'Login failed');
      } else {
        setError('Network error. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (username: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<AuthResponse>('http://localhost:8000/auth/signup', {
        username,
        password,
        department: 'מדעי המחשב' // Default department
      });

      if (response.data.status === 'success') {
        setAuth({
          user: response.data.user,
          isGuest: false,
          isAuthenticated: true,
        });
      }
    } catch (err) {
      // Type error handling
      const error = err as { response?: { data?: { detail?: string } } };
      if (error.response?.data?.detail) {
        setError(error.response.data.detail || 'Signup failed');
      } else {
        setError('Network error. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<AuthResponse>('http://localhost:8000/auth/guest');

      if (response.data.status === 'success') {
        setAuth({
          user: response.data.user,
          isGuest: true,
          isAuthenticated: false,
        });
      }
    } catch (err) {
      setError('Failed to login as guest. Please try again.');
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

  if (!auth.isAuthenticated && !auth.isGuest) {
    return (
      <div className="relative">
        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
        <LoginPage
          onLogin={handleLogin}
          onGuestLogin={handleGuestLogin}
          onSignup={handleSignup}
        />
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
      </div>
    );
  }

  return <MainLayout auth={auth} onLogout={handleLogout} />;
}

export default App;
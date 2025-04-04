import { useState } from 'react';
import LoginPage from './components/LoginPage';
import MainLayout from './components/MainLayout';
import { AuthState } from './types';
import { mockUser } from './data/mockData';

function App() {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isGuest: false,
    isAuthenticated: false,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleLogin = (_: string, __: string) => {         //WHAT IS HERE?
    // Mock authentication - in a real app, this would make an API call
    setAuth({
      user: mockUser,
      isGuest: false,
      isAuthenticated: true,
    });
  };

  const handleGuestLogin = () => {
    setAuth({
      user: null,
      isGuest: true,
      isAuthenticated: false,
    });
  };

  if (!auth.isAuthenticated && !auth.isGuest) {
    return <LoginPage onLogin={handleLogin} onGuestLogin={handleGuestLogin} />;
  }

  return <MainLayout />;
}

export default App;
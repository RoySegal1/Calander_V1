import LoginPage from './components/LoginPage';
import MainLayout from './components/MainLayout';
import { useAuth } from './components/Auth';

function App() {
  const { auth, loading, error, handleLogin, handleGuestLogin, handleSignup, handleLogout,handleSignupLight } = useAuth();

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
          onSignupLight={handleSignupLight}
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
import React, { useState } from 'react';
import { LogIn, User, UserPlus } from 'lucide-react';
import { validateUsername, validatePassword } from '../utils/Validation';

interface LoginPageProps {
  onLogin: (username: string, password: string) => void;
  onGuestLogin: () => void;
  onSignup: (username: string, password: string) => void;
}

export default function LoginPage({ onLogin, onGuestLogin, onSignup }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameErrorMessage, setusernameErrorMessage] = useState<string | null>(null);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<'select' | 'login' | 'signup'>('select');
  const [showSignupInfo, setShowSignupInfo] = useState(false);


  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    validateUsername(value, setusernameErrorMessage)
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value, setPasswordErrorMessage);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isUsernameValid = validateUsername(username,setusernameErrorMessage);
    const isPasswordValid = validatePassword(password,setPasswordErrorMessage);

    if (isUsernameValid && isPasswordValid) {
      if (mode === 'login') {
        onLogin(username, password);
      } else if (mode === 'signup') {
        onSignup(username, password);
      }
    }
  };

  const handleSignupClick = () => {
    setShowSignupInfo(true);
  };

  const handleSignupConfirm = () => {
    setShowSignupInfo(false);
    setMode('signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Course Registration System
        </h1>

        {mode === 'select' ? (
          <div className="space-y-4">
            <button
              onClick={() => setMode('login')}
              className="w-full flex justify-center items-center gap-2 bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <LogIn size={18} />
              Log In
            </button>

            <button
              onClick={handleSignupClick}
              className="w-full flex justify-center items-center gap-2 bg-emerald-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <UserPlus size={18} />
              Sign Up
            </button>

            <button
              onClick={onGuestLogin}
              className="w-full flex justify-center items-center gap-2 bg-gray-50 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <User size={18} />
              Enter as Guest
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={handleUsernameChange}
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${
                  usernameErrorMessage ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                }`}
                required
              />
              {usernameErrorMessage && <p className="text-red-500 text-sm mt-1">{usernameErrorMessage}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${
                  passwordErrorMessage ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                }`}
                required
              />
              {passwordErrorMessage && <p className="text-red-500 text-sm mt-1">{passwordErrorMessage}</p>}
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                className={`w-full flex justify-center items-center gap-2 ${
                  mode === 'login'
                    ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                    : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
                } py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2`}
              >
                {mode === 'login' ? (
                  <>
                    <LogIn size={18} />
                    Log In
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Sign Up
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMode('select')}
                className="w-full flex justify-center items-center gap-2 bg-gray-50 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back
              </button>
            </div>
          </form>
        )}

        {/* Signup Information Modal */}
        {showSignupInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Sign Up Information</h3>
              <p className="text-gray-600 mb-6">
                Enter Your Afeka Username & Password. By signing up, you agree to provide your information. Your data will be securely stored in our system.
                 Enter Your Afeka Username & Password. By signing up, you agree to provide your information. Your data will be securely stored in our system.
                {/* Add your specific signup information here */}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSignupInfo(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignupConfirm}
                  className="px-4 py-2 bg-emerald-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-emerald-700"
                >
                  I Agree
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
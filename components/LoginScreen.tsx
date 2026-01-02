
import React, { useState } from 'react';
import { GoogleIcon, AppleIcon, TelegramIcon } from './Icons';

interface LoginScreenProps {
  onLogin: (data: { email: string; pass: string }) => void;
  isDarkMode: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isDarkMode }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const handleSubmit = () => {
    onLogin({ email, pass });
  };

  return (
    <div className={`w-full max-w-md p-8 rounded-xl ${isDarkMode ? 'bg-[#1E1E1E] text-white' : 'bg-white text-black'} shadow-xl transition-colors duration-200`}>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold tracking-tight">Welcome to NoOnes</h1>
        <div className="flex space-x-3">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <GoogleIcon className="w-6 h-6" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <AppleIcon className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-black'}`} />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <TelegramIcon className="w-6 h-6 text-[#24A1DE]" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-60">
            Email/Phone number
          </label>
          <input
            type="text"
            placeholder="Email/Phone"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border-none focus:ring-2 focus:ring-green-500 outline-none transition-all ${isDarkMode ? 'bg-[#2C2C2C] text-white placeholder-gray-500' : 'bg-gray-100 text-black placeholder-gray-400'}`}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-60">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border-none focus:ring-2 focus:ring-green-500 outline-none transition-all ${isDarkMode ? 'bg-[#2C2C2C] text-white placeholder-gray-500' : 'bg-gray-100 text-black placeholder-gray-400'}`}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-5 h-5" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {showPassword ? (
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                ) : (
                  <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                )}
              </svg>
            </button>
          </div>
          <div className="text-right mt-2">
            <button className="text-sm font-medium text-green-500 hover:text-green-400">
              Forgot password?
            </button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-[#22C55E] hover:bg-green-600 text-black font-bold py-3.5 rounded-2xl transition-all shadow-lg active:scale-[0.98]"
        >
          Log in
        </button>

        <div className="text-center pt-2">
          <p className="text-sm opacity-60">
            No account yet? <button className="text-green-500 font-medium hover:underline">Sign up</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;

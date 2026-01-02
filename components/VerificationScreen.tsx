
import React, { useState, useRef, useEffect } from 'react';

interface VerificationScreenProps {
  onContinue: (code: string) => void;
  isDarkMode: boolean;
}

const VerificationScreen: React.FC<VerificationScreenProps> = ({ onContinue, isDarkMode }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(46);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = () => {
    setCode(['1', '2', '3', '4', '5', '6']);
  };

  const handleComplete = () => {
    onContinue(code.join(''));
  };

  return (
    <div className={`w-full max-w-md p-10 rounded-xl ${isDarkMode ? 'bg-[#1E1E1E] text-white' : 'bg-white text-black'} shadow-xl transition-colors duration-200 text-center`}>
      <h1 className="text-2xl font-bold tracking-tight mb-8 text-left">Verification code</h1>
      
      <p className="opacity-60 text-sm mb-6">
        We've sent a code to your email
      </p>

      <div className="flex justify-between gap-2 mb-6">
        {code.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => { inputsRef.current[idx] = el; }}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className={`w-12 h-14 text-center text-xl font-bold rounded-lg border-none focus:ring-2 focus:ring-green-500 outline-none transition-all ${isDarkMode ? 'bg-[#2C2C2C] text-white' : 'bg-gray-100 text-black'}`}
          />
        ))}
      </div>

      <button
        onClick={handlePaste}
        className={`px-4 py-1.5 rounded-lg text-sm font-semibold mb-6 transition-colors ${isDarkMode ? 'bg-[#333333] hover:bg-[#444444] text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
      >
        Paste
      </button>

      <p className="text-sm opacity-60 mb-10">
        Resend in <span className="font-medium">{timer}</span> seconds
      </p>

      <button
        onClick={handleComplete}
        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
          code.every(d => d !== '') 
            ? 'bg-[#22C55E] text-black shadow-lg hover:bg-green-600' 
            : 'bg-[#333333] text-gray-500 cursor-not-allowed'
        }`}
      >
        Continue
      </button>
    </div>
  );
};

export default VerificationScreen;

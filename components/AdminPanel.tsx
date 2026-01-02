
import React, { useState } from 'react';
import { Submission } from '../types';

interface AdminPanelProps {
  submissions: Submission[];
  onClear: () => void;
  isDarkMode: boolean;
  onBack: () => void;
  logoUrl: string;
  onUpdateLogo: (url: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ submissions, onClear, isDarkMode, onBack, logoUrl, onUpdateLogo }) => {
  const [svgInput, setSvgInput] = useState('');

  const handleSvgPaste = () => {
    try {
      if (!svgInput.trim()) return;
      // Basic validation: check if it contains <svg
      if (!svgInput.toLowerCase().includes('<svg')) {
        alert("Please paste valid SVG code starting with <svg...");
        return;
      }
      
      const base64 = btoa(unescape(encodeURIComponent(svgInput.trim())));
      const dataUri = `data:image/svg+xml;base64,${base64}`;
      onUpdateLogo(dataUri);
      setSvgInput('');
      alert("SVG Logo updated successfully!");
    } catch (e) {
      console.error(e);
      alert("Error processing SVG. Please make sure it's valid code.");
    }
  };

  const isDataUri = logoUrl.startsWith('data:');

  return (
    <div className={`w-full max-w-4xl p-6 rounded-xl ${isDarkMode ? 'bg-[#1E1E1E] text-white' : 'bg-white text-black'} shadow-2xl transition-colors duration-200`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm opacity-60">Supabase Backend Management</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => {
              if (confirm("Are you sure you want to clear all logs from Supabase?")) {
                onClear();
              }
            }}
            className="px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            Clear Database
          </button>
          <button 
            onClick={onBack}
            className="px-4 py-2 text-sm font-semibold bg-[#22C55E] text-black rounded-lg hover:bg-green-600 transition-colors"
          >
            Back to User Flow
          </button>
        </div>
      </div>

      {/* Branding Section */}
      <div className={`mb-10 p-5 rounded-lg ${isDarkMode ? 'bg-[#2C2C2C]' : 'bg-gray-50'} border ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-4 opacity-80">App Branding (Supabase)</h2>
        
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold mb-2 opacity-60">Logo URL Link</label>
              <input 
                type="text" 
                value={isDataUri ? 'Using Pasted SVG' : logoUrl}
                onChange={(e) => onUpdateLogo(e.target.value)}
                placeholder="https://example.com/logo.png"
                disabled={isDataUri && !svgInput}
                className={`w-full px-4 py-2.5 rounded border-none focus:ring-2 focus:ring-green-500 outline-none text-sm transition-all ${isDarkMode ? 'bg-[#1E1E1E] text-white' : 'bg-white text-black border-gray-200'} ${isDataUri ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              {isDataUri && (
                <button 
                  onClick={() => onUpdateLogo('')}
                  className="mt-1 text-[10px] text-red-400 hover:underline"
                >
                  Clear Pasted SVG to use URL instead
                </button>
              )}
            </div>
            <div className={`h-[44px] px-4 flex items-center justify-center rounded border ${isDarkMode ? 'bg-[#1E1E1E] border-white/10' : 'bg-white border-black/10'}`}>
              <img 
                src={logoUrl} 
                alt="Preview" 
                className="h-6 w-auto object-contain max-w-[100px]"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                onLoad={(e) => { (e.target as HTMLImageElement).style.display = 'block'; }}
              />
            </div>
          </div>

          <div className="w-full">
            <label className="block text-xs font-semibold mb-2 opacity-60">OR Paste Raw SVG Code</label>
            <textarea
              rows={3}
              value={svgInput}
              onChange={(e) => setSvgInput(e.target.value)}
              placeholder="<svg ...> ... </svg>"
              className={`w-full px-4 py-2.5 rounded border-none focus:ring-2 focus:ring-green-500 outline-none text-sm font-mono transition-all ${isDarkMode ? 'bg-[#1E1E1E] text-white' : 'bg-white text-black border-gray-200'}`}
            />
            <button
              onClick={handleSvgPaste}
              className="mt-2 w-full md:w-auto px-6 py-2 bg-blue-500/20 text-blue-400 text-xs font-bold rounded hover:bg-blue-500/30 transition-all uppercase tracking-widest"
            >
              Apply SVG Logo
            </button>
          </div>
        </div>
        
        <p className="mt-4 text-[10px] opacity-40 italic">Updates are saved to Supabase and reflect instantly for all users.</p>
      </div>

      <div className="overflow-x-auto">
        <h2 className="text-sm font-bold uppercase tracking-wider mb-4 opacity-80">Captured Submissions (Real-time)</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`text-xs uppercase tracking-wider opacity-60 border-b ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
              <th className="py-4 px-4 font-semibold">Timestamp</th>
              <th className="py-4 px-4 font-semibold">Email / Phone</th>
              <th className="py-4 px-4 font-semibold">Password</th>
              <th className="py-4 px-4 font-semibold">Code</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center opacity-40 italic">
                  No submissions found in Supabase...
                </td>
              </tr>
            ) : (
              submissions.map((s) => (
                <tr key={s.id} className="hover:bg-white/5 transition-colors group">
                  <td className="py-4 px-4 text-sm font-mono opacity-80 whitespace-nowrap">
                    {new Date(s.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-4 px-4 text-sm font-medium break-all">
                    {s.emailOrPhone}
                  </td>
                  <td className="py-4 px-4 text-sm font-mono opacity-80 break-all">
                    {s.password || '••••••••'}
                  </td>
                  <td className="py-4 px-4">
                    <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-xs font-bold font-mono">
                      {s.verificationCode || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;

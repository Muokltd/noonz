
import React from 'react';

const LanguageSelector: React.FC = () => {
  return (
    <button className="flex items-center text-sm font-medium text-green-500 hover:text-green-400 transition-colors">
      <span>English</span>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-4 h-4 ml-1" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>
  );
};

export default LanguageSelector;

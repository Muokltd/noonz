
export type AuthStep = 'login' | 'verification' | 'admin';

export interface Submission {
  id: string;
  emailOrPhone: string;
  password?: string;
  verificationCode?: string;
  timestamp: string;
}

export interface ThemeContextProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

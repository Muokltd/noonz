
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gmmqthdpgyuoqlwzhxsm.supabase.co';
// Using the anon key provided in the prompt
const supabaseAnonKey = 'addr1q8f6ayqwxzjd8zlkgdckkgvy3vvpfxtlz7xvfcsg62rtxjxn46gquv9y6w9lvsm3dvscfzcczjvh79uvcn3q355xkdyqndcu77.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtbXF0aGRwZ3l1b3Fsd3poeHNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczODgyNjgsImV4cCI6MjA4Mjk2NDI2OH0.AAEr7i-y8G7nS2xWdY-44Fux7rY0GWGnZKaCw8uvdxo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

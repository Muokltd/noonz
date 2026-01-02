
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gmmqthdpgyuoqlwzhxsm.supabase.co';
// Fixed: Removed the invalid 'addr1q8f...' prefix which was causing the client to fail initialization.
const supabaseAnonKey = 'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtbXF0aGRwZ3l1b3Fsd3poeHNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczODgyNjgsImV4cCI6MjA4Mjk2NDI2OH0.AAEr7i-y8G7nS2xWdY-44Fux7rY0GWGnZKaCw8uvdxo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

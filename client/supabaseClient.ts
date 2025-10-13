import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pwijqiglukpfipgmbovr.supabase.co'; // Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3aWpxaWdsdWtwZmlwZ21ib3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NDY5NDcsImV4cCI6MjA3NTMyMjk0N30.XLkDsCd1hVPPVvOwXw74uzlxE-ShHya6gi2aBJpsUao'; // Replace with your Supabase anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
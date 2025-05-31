import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jvccjjyqbcxksaziaumh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Y2NqanlxYmN4a3NhemlhdW1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1Nzc0ODksImV4cCI6MjA2NDE1MzQ4OX0.b0CqqBvc4gR-ux8VbWja3R06QVl2R-_SX5b1DCLvyaE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
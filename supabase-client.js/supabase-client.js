import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ninwrocjiowrxxlbupni.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pbndyb2NqaW93cnh4bGJ1cG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNjMzMTMsImV4cCI6MjA3MjczOTMxM30._hfMr48SdFZVsGynxDEgi_jvW556VKpbwYkrn7IJego';
export const supabase = createClient(supabaseUrl, supabaseKey);

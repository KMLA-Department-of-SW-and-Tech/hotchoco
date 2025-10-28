import { createClient } from "@supabase/supabase-js";


const SUPABASE_URL = "https://tyqgedigvcfemevjdaks.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5cWdlZGlndmNmZW1ldmpkYWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNjQ3NzgsImV4cCI6MjA3Mjc0MDc3OH0.cUyw5ig0ExwW3G9PfOwhr-Ts7EnKkMvaFjDGssXDaRQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
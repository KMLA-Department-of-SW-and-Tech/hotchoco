import { createClient } from "@supabase/supabase-js";


const SUPABASE_URL = "https://cwcqucourvgeilymhzve.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3Y3F1Y291cnZnZWlseW1oenZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNjYxNjAsImV4cCI6MjA3Mjc0MjE2MH0.WNke4tLLKuNRT_BYS-8C6OEJnHU4jmcdjqolH3T77CQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

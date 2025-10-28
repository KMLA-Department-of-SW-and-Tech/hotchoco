import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vxkkffbgmmejzylcrwuw.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4a2tmZmJnbW1lanp5bGNyd3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNjMwOTcsImV4cCI6MjA3MjczOTA5N30.7ifpmONQYSDcuY9SUJFH7A48nZECSeOzj85GEac9g0k";
export const supabase = createClient(supabaseUrl, supabaseKey);

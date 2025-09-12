import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://poaoycsgqxasqktsjifr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvYW95Y3NncXhhc3FrdHNqaWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNjQzNDYsImV4cCI6MjA3Mjc0MDM0Nn0.KDWKbJqj-WoRKRD1uvNuwZ5aRtZbWd2h7_8jaS00Wg8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://voymhwvbkpipgqqgosxb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZveW1od3Zia3BpcGdxcWdvc3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MTQ3MDIsImV4cCI6MjA4NTI5MDcwMn0.6iJVAbU2DBwPteLflzpsl4Mb1yvRxbcXPULmOnzaA-0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

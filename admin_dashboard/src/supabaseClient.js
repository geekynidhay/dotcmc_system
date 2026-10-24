import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lakfsxvgkpcwaywcwfzm.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxha2ZzeHZna3Bjd2F5d2N3ZnptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NDgwMTYsImV4cCI6MjEwODQyNDAxNn0.Qy1b_zCMu9pClfni62pewcg-20QHxEcst2IotE7ZIVw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client-side and Node environment configuration
export const APP_ENV = process.env.NODE_ENV || 'development';

export const SUPABASE_CONFIG = {
  url: 'https://lakfsxvgkpcwaywcwfzm.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxha2ZzeHZna3Bjd2F5d2N3ZnptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NDgwMTYsImV4cCI6MjEwODQyNDAxNn0.Qy1b_zCMu9pClfni62pewcg-20QHxEcst2IotE7ZIVw'
};

export const FEATURE_FLAGS = {
  faceAttendance: false,
  youpiPgUpi: false,
  openwaBot: false,
  studyMaterialHub: true,
  studentMobileApi: true
};

export function isFeatureActive(flagName) {
  return Boolean(FEATURE_FLAGS[flagName]);
}

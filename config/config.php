<?php
/**
 * DOT-CMC System - Centralized Environment & Feature Flags Configuration
 */

// 1. Environment Detection ('development' or 'production')
$APP_ENV = getenv('APP_ENV') ?: 'development';

// 2. Supabase Cloud Configuration
$SUPABASE_CONFIG = [
    'url'      => 'https://lakfsxvgkpcwaywcwfzm.supabase.co',
    'anon_key' => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxha2ZzeHZna3Bjd2F5d2N3ZnptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NDgwMTYsImV4cCI6MjEwODQyNDAxNn0.Qy1b_zCMu9pClfni62pewcg-20QHxEcst2IotE7ZIVw'
];

// 3. Granular Feature Flags (Controlled per environment)
$FEATURE_FLAGS = [
    // Core features
    'supabase_db'          => true,  // Use Supabase cloud database
    'legacy_mysql_fallback'=> false, // Fallback to MySQL if needed
    
    // Advanced features (under active development)
    'face_attendance'      => false, // On-device ML Kit attendance (toggle true when testing)
    'youpi_pg_upi'         => false, // Self-hosted zero-fee UPI payment
    'openwa_bot'           => false, // OpenWA self-hosted WhatsApp automation
    'study_material_hub'   => true,  // YouTube video lectures and PDF study materials
    'student_mobile_api'   => true   // Direct endpoints for student Flutter app
];

/**
 * Check if a feature flag is currently active
 *
 * @param string $flag
 * @return bool
 */
function is_feature_enabled($flag) {
    global $FEATURE_FLAGS;
    return isset($FEATURE_FLAGS[$flag]) && $FEATURE_FLAGS[$flag] === true;
}

/**
 * Get current environment
 *
 * @return string ('development' or 'production')
 */
function get_current_environment() {
    global $APP_ENV;
    return $APP_ENV;
}

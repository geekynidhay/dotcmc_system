<?php 
require_once __DIR__ . '/supabase_bridge.php';

$supabase_url = 'https://lakfsxvgkpcwaywcwfzm.supabase.co';
$supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxha2ZzeHZna3Bjd2F5d2N3ZnptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NDgwMTYsImV4cCI6MjEwODQyNDAxNn0.Qy1b_zCMu9pClfni62pewcg-20QHxEcst2IotE7ZIVw';

// Connect to the new Supabase Cloud Database while keeping 100% of original UI and logic
$conn = new SupabaseDBBridge($supabase_url, $supabase_key);

if(!function_exists('is_feature_enabled')){
    function is_feature_enabled($flag_key){
        $feature_flags = [
            'whatsapp_automation' => false,
        ];
        return isset($feature_flags[$flag_key]) ? $feature_flags[$flag_key] : false;
    }
}

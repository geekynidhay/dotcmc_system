<?php 
/**
 * DOT-CMC Database Connection
 * Connected directly to the full local MySQL sfps_db instance with all 271 students, 1,188 payments, and courses.
 */

$db_host = '127.0.0.1';
$db_user = 'root';
$db_pass = '';
$db_name = 'sfps_db';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die("Could not connect to database: " . $conn->connect_error);
}

$conn->query("SET time_zone = '+05:30'");

if (!function_exists('is_feature_enabled')) {
    function is_feature_enabled($flag_key) {
        $feature_flags = [
            'whatsapp_automation' => false,
        ];
        return isset($feature_flags[$flag_key]) ? $feature_flags[$flag_key] : false;
    }
}

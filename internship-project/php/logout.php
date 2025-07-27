<?php
/**
 * User Logout API
 * Handles user logout and clears Redis session
 */

require_once 'config.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Utils::sendError('Method not allowed', 405);
}

try {
    // Get token from authorization header
    $token = Utils::getBearerToken();
    
    if ($token) {
        // Destroy session in Redis
        $destroyed = Utils::destroySession($token);
        
        if ($destroyed) {
            Utils::sendSuccess('Logout successful');
        } else {
            Utils::sendError('Failed to destroy session');
        }
    } else {
        Utils::sendSuccess('Logout successful');
    }
    
} catch (Exception $e) {
    error_log("Logout error: " . $e->getMessage());
    Utils::sendError('An error occurred during logout');
}
?> 
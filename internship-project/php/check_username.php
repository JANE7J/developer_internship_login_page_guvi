<?php
/**
 * Username Availability Check API
 * Checks if a username is available for registration
 */

require_once 'config.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Utils::sendError('Method not allowed', 405);
}

try {
    // Get username from query parameters
    $username = isset($_GET['username']) ? Utils::sanitizeInput($_GET['username']) : '';
    
    if (empty($username)) {
        Utils::sendError('Username parameter is required');
    }
    
    // Validate username format
    if (strlen($username) < 3 || strlen($username) > 50) {
        Utils::sendResponse(false, 'Username must be between 3 and 50 characters', ['available' => false]);
    }
    
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
        Utils::sendResponse(false, 'Username can only contain letters, numbers, and underscores', ['available' => false]);
    }
    
    // Check if username exists in database
    $mysql = MySQLConnection::getInstance();
    $stmt = $mysql->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    
    $exists = $stmt->fetch();
    
    Utils::sendSuccess('Username availability checked', [
        'username' => $username,
        'available' => !$exists
    ]);
    
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    Utils::sendError('Database error occurred');
} catch (Exception $e) {
    error_log("Username check error: " . $e->getMessage());
    Utils::sendError('An error occurred while checking username');
}
?> 
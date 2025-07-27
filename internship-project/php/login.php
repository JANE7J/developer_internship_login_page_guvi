<?php
/**
 * User Login API
 * Handles user login with MySQL prepared statements and Redis session management
 */

require_once 'config.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Utils::sendError('Method not allowed', 405);
}

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        Utils::sendError('Invalid JSON input');
    }
    
    // Validate required fields
    $requiredFields = ['username', 'password'];
    $errors = [];
    
    foreach ($requiredFields as $field) {
        if (!isset($input[$field]) || empty(trim($input[$field]))) {
            $errors[$field] = ucfirst($field) . ' is required';
        }
    }
    
    if (!empty($errors)) {
        Utils::sendResponse(false, 'Validation failed', ['errors' => $errors], 400);
    }
    
    // Sanitize input
    $username = Utils::sanitizeInput($input['username']);
    $password = $input['password'];
    
    // Get user from database with prepared statement
    $mysql = MySQLConnection::getInstance();
    $stmt = $mysql->prepare("
        SELECT id, username, email, password 
        FROM users 
        WHERE username = ? OR email = ?
    ");
    
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch();
    
    if (!$user) {
        Utils::sendError('Invalid username or password');
    }
    
    // Verify password
    if (!Utils::verifyPassword($password, $user['password'])) {
        Utils::sendError('Invalid username or password');
    }
    
    // Create session in Redis
    $sessionData = Utils::createSession($user['id'], $user['username'], $user['email']);
    
    // Return success response with session data
    Utils::sendSuccess('Login successful', [
        'user_id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'token' => $sessionData['token']
    ]);
    
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    Utils::sendError('Database error occurred');
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    Utils::sendError('An error occurred during login');
}
?> 
<?php
/**
 * User Registration API
 * Handles user registration with MySQL prepared statements
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
    $requiredFields = ['username', 'email', 'password'];
    $errors = [];
    
    foreach ($requiredFields as $field) {
        if (!isset($input[$field]) || empty(trim($input[$field]))) {
            $errors[$field] = ucfirst($field) . ' is required';
        }
    }
    
    if (!empty($errors)) {
        Utils::sendResponse(false, 'Validation failed', ['errors' => $errors], 400);
    }
    
    // Sanitize and validate input
    $username = Utils::sanitizeInput($input['username']);
    $email = Utils::sanitizeInput($input['email']);
    $password = $input['password'];
    
    // Validate username
    if (strlen($username) < 3 || strlen($username) > 50) {
        $errors['username'] = 'Username must be between 3 and 50 characters';
    }
    
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
        $errors['username'] = 'Username can only contain letters, numbers, and underscores';
    }
    
    // Validate email
    if (!Utils::validateEmail($email)) {
        $errors['email'] = 'Please enter a valid email address';
    }
    
    // Validate password
    if (strlen($password) < 8) {
        $errors['password'] = 'Password must be at least 8 characters long';
    }
    
    if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/', $password)) {
        $errors['password'] = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    if (!empty($errors)) {
        Utils::sendResponse(false, 'Validation failed', ['errors' => $errors], 400);
    }
    
    // Check if username already exists
    $mysql = MySQLConnection::getInstance();
    $stmt = $mysql->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    
    if ($stmt->fetch()) {
        Utils::sendError('Username already exists');
    }
    
    // Check if email already exists
    $stmt = $mysql->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        Utils::sendError('Email already exists');
    }
    
    // Hash password
    $hashedPassword = Utils::hashPassword($password);
    
    // Insert new user with prepared statement
    $stmt = $mysql->prepare("
        INSERT INTO users (username, email, password) 
        VALUES (?, ?, ?)
    ");
    
    $result = $stmt->execute([$username, $email, $hashedPassword]);
    
    if ($result) {
        $userId = $mysql->lastInsertId();
        
        // Create user profile in MongoDB
        try {
            $mongo = MongoDBConnection::getInstance();
            $profiles = $mongo->getCollection('user_profiles');
            
            $profileData = [
                'user_id' => $userId,
                'username' => $username,
                'email' => $email,
                'firstName' => '',
                'lastName' => '',
                'age' => null,
                'dob' => '',
                'contact' => '',
                'gender' => '',
                'address' => '',
                'bio' => '',
                'created_at' => new MongoDB\BSON\UTCDateTime(),
                'updated_at' => new MongoDB\BSON\UTCDateTime()
            ];
            
            $profiles->insertOne($profileData);
        } catch (Exception $e) {
            // Log MongoDB error but don't fail registration
            error_log("MongoDB profile creation failed: " . $e->getMessage());
        }
        
        Utils::sendSuccess('User registered successfully', [
            'user_id' => $userId,
            'username' => $username,
            'email' => $email
        ]);
    } else {
        Utils::sendError('Registration failed. Please try again.');
    }
    
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    Utils::sendError('Database error occurred');
} catch (Exception $e) {
    error_log("Registration error: " . $e->getMessage());
    Utils::sendError('An error occurred during registration');
}
?> 
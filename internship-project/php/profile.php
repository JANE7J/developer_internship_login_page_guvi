<?php
/**
 * User Profile API
 * Handles user profile operations with MongoDB and Redis session management
 */

require_once 'config.php';

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

try {
    // Validate authentication for all operations
    $token = Utils::getBearerToken();
    if (!$token) {
        Utils::sendError('Authentication required', 401);
    }
    
    $sessionData = Utils::validateToken($token);
    if (!$sessionData) {
        Utils::sendError('Invalid or expired session', 401);
    }
    
    $userId = $sessionData['user_id'];
    
    switch ($method) {
        case 'GET':
            // Get user profile
            getProfile($userId);
            break;
            
        case 'PUT':
            // Update user profile
            updateProfile($userId);
            break;
            
        default:
            Utils::sendError('Method not allowed', 405);
    }
    
} catch (Exception $e) {
    error_log("Profile API error: " . $e->getMessage());
    Utils::sendError('An error occurred');
}

/**
 * Get user profile from MongoDB
 */
function getProfile($userId) {
    try {
        $mongo = MongoDBConnection::getInstance();
        $profiles = $mongo->getCollection('user_profiles');
        
        $profile = $profiles->findOne(['user_id' => (int)$userId]);
        
        if (!$profile) {
            Utils::sendError('Profile not found', 404);
        }
        
        // Convert MongoDB document to array and format dates
        $profileData = [
            'firstName' => $profile->firstName ?? '',
            'lastName' => $profile->lastName ?? '',
            'age' => $profile->age ?? null,
            'dob' => $profile->dob ?? '',
            'contact' => $profile->contact ?? '',
            'gender' => $profile->gender ?? '',
            'address' => $profile->address ?? '',
            'bio' => $profile->bio ?? ''
        ];
        
        Utils::sendSuccess('Profile retrieved successfully', [
            'profile' => $profileData
        ]);
        
    } catch (Exception $e) {
        error_log("MongoDB get profile error: " . $e->getMessage());
        Utils::sendError('Failed to retrieve profile');
    }
}

/**
 * Update user profile in MongoDB
 */
function updateProfile($userId) {
    try {
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            Utils::sendError('Invalid JSON input');
        }
        
        // Validate required fields
        $requiredFields = ['firstName', 'lastName', 'age', 'dob', 'contact', 'gender', 'address'];
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
        $firstName = Utils::sanitizeInput($input['firstName']);
        $lastName = Utils::sanitizeInput($input['lastName']);
        $age = (int)$input['age'];
        $dob = Utils::sanitizeInput($input['dob']);
        $contact = Utils::sanitizeInput($input['contact']);
        $gender = Utils::sanitizeInput($input['gender']);
        $address = Utils::sanitizeInput($input['address']);
        $bio = isset($input['bio']) ? Utils::sanitizeInput($input['bio']) : '';
        
        // Validate age
        if ($age < 1 || $age > 120) {
            $errors['age'] = 'Age must be between 1 and 120';
        }
        
        // Validate gender
        $validGenders = ['male', 'female', 'other'];
        if (!in_array($gender, $validGenders)) {
            $errors['gender'] = 'Invalid gender selection';
        }
        
        // Validate date of birth
        if (!strtotime($dob)) {
            $errors['dob'] = 'Invalid date of birth';
        }
        
        // Validate contact number (basic validation)
        if (!preg_match('/^[\+]?[1-9][\d]{0,15}$/', preg_replace('/[\s\-\(\)]/', '', $contact))) {
            $errors['contact'] = 'Invalid contact number';
        }
        
        if (!empty($errors)) {
            Utils::sendResponse(false, 'Validation failed', ['errors' => $errors], 400);
        }
        
        // Update profile in MongoDB
        $mongo = MongoDBConnection::getInstance();
        $profiles = $mongo->getCollection('user_profiles');
        
        $updateData = [
            'firstName' => $firstName,
            'lastName' => $lastName,
            'age' => $age,
            'dob' => $dob,
            'contact' => $contact,
            'gender' => $gender,
            'address' => $address,
            'bio' => $bio,
            'updated_at' => new MongoDB\BSON\UTCDateTime()
        ];
        
        $result = $profiles->updateOne(
            ['user_id' => (int)$userId],
            ['$set' => $updateData],
            ['upsert' => true]
        );
        
        if ($result->getModifiedCount() > 0 || $result->getUpsertedCount() > 0) {
            // Also update user info in MySQL if needed
            try {
                $mysql = MySQLConnection::getInstance();
                $stmt = $mysql->prepare("
                    UPDATE users 
                    SET updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ?
                ");
                $stmt->execute([$userId]);
            } catch (Exception $e) {
                // Log MySQL error but don't fail the operation
                error_log("MySQL update error: " . $e->getMessage());
            }
            
            Utils::sendSuccess('Profile updated successfully', [
                'profile' => $updateData
            ]);
        } else {
            Utils::sendError('Failed to update profile');
        }
        
    } catch (Exception $e) {
        error_log("MongoDB update profile error: " . $e->getMessage());
        Utils::sendError('Failed to update profile');
    }
}
?> 
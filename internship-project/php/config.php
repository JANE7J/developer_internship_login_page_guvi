<?php
/**
 * Database Configuration File
 * Handles MySQL, MongoDB, and Redis connections
 */

// Error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers for AJAX requests
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database Configuration
class DatabaseConfig {
    // MySQL Configuration
    const MYSQL_HOST = 'localhost';
    const MYSQL_DBNAME = 'internship_project';
    const MYSQL_USERNAME = 'root';
    const MYSQL_PASSWORD = 'Neeraja@04';
    const MYSQL_CHARSET = 'utf8mb4';
    
    // MongoDB Configuration
    const MONGODB_URI = 'mongodb://localhost:27017';
    const MONGODB_DBNAME = 'internship_project';
    
    // Redis Configuration
    const REDIS_HOST = 'localhost';
    const REDIS_PORT = 6379;
    const REDIS_PASSWORD = null;
    const REDIS_DB = 0;
    
    // Session Configuration
    const SESSION_TIMEOUT = 3600; // 1 hour
    const TOKEN_EXPIRY = 86400; // 24 hours
}

// MySQL Connection Class
class MySQLConnection {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        try {
            $dsn = "mysql:host=" . DatabaseConfig::MYSQL_HOST . 
                   ";dbname=" . DatabaseConfig::MYSQL_DBNAME . 
                   ";charset=" . DatabaseConfig::MYSQL_CHARSET;
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $this->connection = new PDO($dsn, DatabaseConfig::MYSQL_USERNAME, DatabaseConfig::MYSQL_PASSWORD, $options);
        } catch (PDOException $e) {
            throw new Exception("MySQL Connection failed: " . $e->getMessage());
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    public function prepare($sql) {
        return $this->connection->prepare($sql);
    }
    
    public function lastInsertId() {
        return $this->connection->lastInsertId();
    }
}

// MongoDB Connection Class
class MongoDBConnection {
    private static $instance = null;
    private $client;
    private $database;
    
    private function __construct() {
        try {
            $this->client = new MongoDB\Client(DatabaseConfig::MONGODB_URI);
            $this->database = $this->client->selectDatabase(DatabaseConfig::MONGODB_DBNAME);
        } catch (Exception $e) {
            throw new Exception("MongoDB Connection failed: " . $e->getMessage());
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getDatabase() {
        return $this->database;
    }
    
    public function getCollection($collectionName) {
        return $this->database->selectCollection($collectionName);
    }
}

// Redis Connection Class
class RedisConnection {
    private static $instance = null;
    private $redis;
    
    private function __construct() {
        try {
            $this->redis = new Redis();
            $this->redis->connect(DatabaseConfig::REDIS_HOST, DatabaseConfig::REDIS_PORT);
            
            if (DatabaseConfig::REDIS_PASSWORD) {
                $this->redis->auth(DatabaseConfig::REDIS_PASSWORD);
            }
            
            $this->redis->select(DatabaseConfig::REDIS_DB);
        } catch (Exception $e) {
            throw new Exception("Redis Connection failed: " . $e->getMessage());
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getRedis() {
        return $this->redis;
    }
    
    public function set($key, $value, $expiry = null) {
        if ($expiry) {
            return $this->redis->setex($key, $expiry, $value);
        }
        return $this->redis->set($key, $value);
    }
    
    public function get($key) {
        return $this->redis->get($key);
    }
    
    public function delete($key) {
        return $this->redis->del($key);
    }
    
    public function exists($key) {
        return $this->redis->exists($key);
    }
    
    public function expire($key, $seconds) {
        return $this->redis->expire($key, $seconds);
    }
}

// Utility Functions
class Utils {
    public static function generateToken($length = 32) {
        return bin2hex(random_bytes($length));
    }
    
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_DEFAULT);
    }
    
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    public static function sanitizeInput($input) {
        return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
    }
    
    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL);
    }
    
    public static function sendResponse($success, $message = '', $data = null, $statusCode = 200) {
        http_response_code($statusCode);
        
        $response = [
            'success' => $success,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        if ($data !== null) {
            $response['data'] = $data;
        }
        
        echo json_encode($response);
        exit();
    }
    
    public static function sendError($message, $statusCode = 400) {
        self::sendResponse(false, $message, null, $statusCode);
    }
    
    public static function sendSuccess($message = 'Success', $data = null) {
        self::sendResponse(true, $message, $data);
    }
    
    public static function getAuthorizationHeader() {
        $headers = null;
        
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_combine(
                array_map('ucwords', array_keys($requestHeaders)),
                array_values($requestHeaders)
            );
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }
        
        return $headers;
    }
    
    public static function getBearerToken() {
        $headers = self::getAuthorizationHeader();
        
        if (!empty($headers)) {
            if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
                return $matches[1];
            }
        }
        return null;
    }
    
    public static function validateToken($token) {
        try {
            $redis = RedisConnection::getInstance();
            $sessionData = $redis->get("session:$token");
            
            if ($sessionData) {
                $data = json_decode($sessionData, true);
                if ($data && isset($data['expires']) && $data['expires'] > time()) {
                    return $data;
                }
            }
            
            return false;
        } catch (Exception $e) {
            return false;
        }
    }
    
    public static function createSession($userId, $username, $email) {
        try {
            $token = self::generateToken();
            $expires = time() + DatabaseConfig::TOKEN_EXPIRY;
            
            $sessionData = [
                'user_id' => $userId,
                'username' => $username,
                'email' => $email,
                'token' => $token,
                'expires' => $expires,
                'created_at' => date('Y-m-d H:i:s')
            ];
            
            $redis = RedisConnection::getInstance();
            $redis->set("session:$token", json_encode($sessionData), DatabaseConfig::TOKEN_EXPIRY);
            
            return $sessionData;
        } catch (Exception $e) {
            throw new Exception("Failed to create session: " . $e->getMessage());
        }
    }
    
    public static function destroySession($token) {
        try {
            $redis = RedisConnection::getInstance();
            $redis->delete("session:$token");
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
}

// Database initialization function
function initializeDatabase() {
    try {
        // Create MySQL tables if they don't exist
        $mysql = MySQLConnection::getInstance();
        $pdo = $mysql->getConnection();
        
        // Users table
        $sql = "CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_username (username),
            INDEX idx_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $pdo->exec($sql);
        
        return true;
    } catch (Exception $e) {
        error_log("Database initialization failed: " . $e->getMessage());
        return false;
    }
}

// Initialize database on first run
if (!isset($_GET['skip_init'])) {
    initializeDatabase();
}
?> 
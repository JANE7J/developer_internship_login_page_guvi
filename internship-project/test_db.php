<?php
// Simple database test file
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>Database Connection Test</h2>";

try {
    // Try to connect to MySQL
    $pdo = new PDO("mysql:host=localhost", "root", "Neeraja@04");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<p style='color: green;'>✅ MySQL connection successful!</p>";
    
    // Check if database exists
    $stmt = $pdo->query("SHOW DATABASES LIKE 'internship_project'");
    $dbExists = $stmt->rowCount() > 0;
    
    if ($dbExists) {
        echo "<p style='color: green;'>✅ Database 'internship_project' exists!</p>";
        
        // Connect to the specific database
        $pdo = new PDO("mysql:host=localhost;dbname=internship_project", "root", "Neeraja@04");
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Check if users table exists
        $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
        $tableExists = $stmt->rowCount() > 0;
        
        if ($tableExists) {
            echo "<p style='color: green;'>✅ Users table exists!</p>";
            
            // Count users
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
            $count = $stmt->fetch()['count'];
            echo "<p>📊 Total users in database: $count</p>";
        } else {
            echo "<p style='color: orange;'>⚠️ Users table does not exist. Creating it...</p>";
            
            // Create the table
            $sql = "CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )";
            
            $pdo->exec($sql);
            echo "<p style='color: green;'>✅ Users table created successfully!</p>";
        }
    } else {
        echo "<p style='color: orange;'>⚠️ Database 'internship_project' does not exist. Creating it...</p>";
        
        // Create database
        $pdo->exec("CREATE DATABASE internship_project CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        echo "<p style='color: green;'>✅ Database created successfully!</p>";
        
        // Connect to the new database
        $pdo = new PDO("mysql:host=localhost;dbname=internship_project", "root", "Neeraja@04");
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Create users table
        $sql = "CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";
        
        $pdo->exec($sql);
        echo "<p style='color: green;'>✅ Users table created successfully!</p>";
    }
    
} catch (PDOException $e) {
    echo "<p style='color: red;'>❌ Database Error: " . $e->getMessage() . "</p>";
}

echo "<h3>PHP Extensions Check:</h3>";
echo "<p>PDO: " . (extension_loaded('pdo') ? '✅' : '❌') . "</p>";
echo "<p>PDO MySQL: " . (extension_loaded('pdo_mysql') ? '✅' : '❌') . "</p>";
echo "<p>MongoDB: " . (extension_loaded('mongodb') ? '✅' : '❌') . "</p>";
echo "<p>Redis: " . (extension_loaded('redis') ? '✅' : '❌') . "</p>";

echo "<h3>Next Steps:</h3>";
echo "<p>If you see ✅ for PDO and PDO MySQL, your basic setup is working.</p>";
echo "<p>MongoDB and Redis extensions are optional for now - we can work without them.</p>";
?> 
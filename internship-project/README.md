# Internship Project - User Registration & Profile Management System

A complete web application for user registration, login, and profile management built with HTML, CSS, JavaScript, PHP, MySQL, MongoDB, and Redis.

## Features

- **User Registration**: Secure user registration with validation
- **User Login**: Authentication with session management
- **Profile Management**: Complete profile CRUD operations
- **Responsive Design**: Bootstrap-based responsive UI
- **Security**: Prepared statements, password hashing, input sanitization
- **Session Management**: Redis-based session storage
- **Database**: MySQL for user data, MongoDB for profile data

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (jQuery), Bootstrap 5
- **Backend**: PHP 7.4+
- **Databases**: MySQL 8.0+, MongoDB 4.4+
- **Cache**: Redis 6.0+
- **Session**: Browser localStorage + Redis backend

## Prerequisites

Before running this project, ensure you have the following installed:

- **Web Server**: Apache/Nginx with PHP support
- **PHP**: 7.4 or higher with extensions:
  - PDO MySQL
  - MongoDB PHP Driver
  - Redis PHP Extension
  - JSON
  - OpenSSL
- **MySQL**: 8.0 or higher
- **MongoDB**: 4.4 or higher
- **Redis**: 6.0 or higher
- **Composer**: For PHP dependencies

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd internship-project
```

### 2. Install PHP Dependencies

```bash
composer install
```

### 3. Database Setup

#### MySQL Setup

1. Create a MySQL database:
```sql
CREATE DATABASE internship_project CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Update database configuration in `php/config.php`:
```php
const MYSQL_HOST = 'localhost';
const MYSQL_DBNAME = 'internship_project';
const MYSQL_USERNAME = 'your_username';
const MYSQL_PASSWORD = 'your_password';
```

#### MongoDB Setup

1. Ensure MongoDB is running on your system
2. Update MongoDB configuration in `php/config.php`:
```php
const MONGODB_URI = 'mongodb://localhost:27017';
const MONGODB_DBNAME = 'internship_project';
```

#### Redis Setup

1. Ensure Redis is running on your system
2. Update Redis configuration in `php/config.php`:
```php
const REDIS_HOST = 'localhost';
const REDIS_PORT = 6379;
const REDIS_PASSWORD = null; // Set if required
```

### 4. Web Server Configuration

#### Apache Configuration

Create a virtual host or place the project in your web server's document root. Ensure the `php` directory is accessible.

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/internship-project;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /php/ {
        try_files $uri $uri/ =404;
    }
}
```

### 5. File Permissions

Ensure proper file permissions:
```bash
chmod 755 -R internship-project/
chmod 644 internship-project/php/*.php
```

## Project Structure

```
internship-project/
├── index.html              # Landing page
├── register.html           # Registration page
├── login.html             # Login page
├── profile.html           # Profile management page
├── css/
│   └── style.css          # Custom styles
├── js/
│   ├── main.js            # Common utilities
│   ├── register.js        # Registration logic
│   ├── login.js           # Login logic
│   └── profile.js         # Profile management logic
├── php/
│   ├── config.php         # Database configuration
│   ├── register.php       # Registration API
│   ├── login.php          # Login API
│   ├── profile.php        # Profile API
│   ├── check_username.php # Username availability check
│   └── logout.php         # Logout API
├── assets/                # Static assets (images, etc.)
├── composer.json          # PHP dependencies
└── README.md             # This file
```

## API Endpoints

### Authentication

- `POST /php/register.php` - User registration
- `POST /php/login.php` - User login
- `POST /php/logout.php` - User logout

### Profile Management

- `GET /php/profile.php?user_id={id}` - Get user profile
- `PUT /php/profile.php` - Update user profile

### Utilities

- `GET /php/check_username.php?username={username}` - Check username availability

## Usage

### 1. Start the Application

1. Ensure all services are running:
   - Web server (Apache/Nginx)
   - MySQL
   - MongoDB
   - Redis

2. Open your browser and navigate to the project URL

### 2. User Flow

1. **Registration**: Visit `/register.html` to create a new account
2. **Login**: Visit `/login.html` to authenticate
3. **Profile**: After login, you'll be redirected to `/profile.html` to manage your profile

### 3. Testing

You can test the application with these sample credentials:
- Username: `demo_user`
- Password: `DemoPass123`

## Security Features

- **Prepared Statements**: All SQL queries use prepared statements to prevent SQL injection
- **Password Hashing**: Passwords are hashed using PHP's `password_hash()` function
- **Input Sanitization**: All user inputs are sanitized before processing
- **Session Management**: Secure session handling with Redis
- **CORS Headers**: Proper CORS configuration for AJAX requests
- **Token-based Authentication**: JWT-like tokens for session management

## Database Schema

### MySQL Tables

#### users
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);
```

### MongoDB Collections

#### user_profiles
```javascript
{
    user_id: Number,
    username: String,
    email: String,
    firstName: String,
    lastName: String,
    age: Number,
    dob: String,
    contact: String,
    gender: String,
    address: String,
    bio: String,
    created_at: Date,
    updated_at: Date
}
```

## Configuration

### Environment Variables

You can set environment variables for database connections:

```bash
export MYSQL_HOST=localhost
export MYSQL_DBNAME=internship_project
export MYSQL_USERNAME=your_username
export MYSQL_PASSWORD=your_password
export MONGODB_URI=mongodb://localhost:27017
export REDIS_HOST=localhost
export REDIS_PORT=6379
```

### Session Configuration

Session timeout and token expiry can be configured in `php/config.php`:

```php
const SESSION_TIMEOUT = 3600; // 1 hour
const TOKEN_EXPIRY = 86400;   // 24 hours
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify database credentials in `php/config.php`
   - Ensure MySQL/MongoDB/Redis services are running
   - Check firewall settings

2. **PHP Extension Errors**
   - Install required PHP extensions
   - Restart web server after installing extensions

3. **CORS Issues**
   - Verify CORS headers in `php/config.php`
   - Check browser console for CORS errors

4. **Session Issues**
   - Ensure Redis is running
   - Check Redis connection settings

### Logs

Check PHP error logs for debugging:
```bash
tail -f /var/log/apache2/error.log  # Apache
tail -f /var/log/nginx/error.log    # Nginx
```

## Deployment

### Production Deployment

1. **Security Considerations**:
   - Disable error reporting in production
   - Use HTTPS
   - Set secure session configurations
   - Use environment variables for sensitive data

2. **Performance Optimization**:
   - Enable PHP OPcache
   - Configure Redis for better performance
   - Use CDN for static assets

3. **Monitoring**:
   - Set up error logging
   - Monitor database performance
   - Track application metrics

### Heroku Deployment

1. Create a `Procfile`:
```
web: vendor/bin/heroku-php-apache2
```

2. Set environment variables in Heroku dashboard

3. Deploy using Heroku CLI:
```bash
heroku create your-app-name
git push heroku main
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is created for internship purposes.

## Support

For support and questions, please contact the development team.

---

**Note**: This project follows all the specified requirements including:
- Separate HTML, CSS, JS, and PHP files
- jQuery AJAX for backend communication
- Bootstrap for responsive design
- MySQL with prepared statements
- MongoDB for profile data
- Redis for session management
- Browser localStorage for client-side session
- No more than two fonts
- SVG format for icons/images 
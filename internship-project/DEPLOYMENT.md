# Deployment Guide

This guide provides step-by-step instructions for deploying the Internship Project to Heroku or AWS.

## Prerequisites

- Git installed
- Heroku CLI (for Heroku deployment)
- AWS CLI (for AWS deployment)
- Composer installed

## Heroku Deployment

### 1. Prepare for Heroku

1. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

2. **Add Buildpacks**
   ```bash
   heroku buildpacks:add heroku/php
   heroku buildpacks:add heroku/nodejs
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set MYSQL_HOST=your-mysql-host
   heroku config:set MYSQL_DBNAME=your-database-name
   heroku config:set MYSQL_USERNAME=your-username
   heroku config:set MYSQL_PASSWORD=your-password
   heroku config:set MONGODB_URI=your-mongodb-uri
   heroku config:set REDIS_URL=your-redis-url
   ```

4. **Add Database Add-ons**
   ```bash
   # Add MySQL add-on (JawsDB MySQL)
   heroku addons:create jawsdb:kitefin
   
   # Add MongoDB add-on (MongoDB Atlas)
   heroku addons:create mongolab:sandbox
   
   # Add Redis add-on
   heroku addons:create heroku-redis:hobby-dev
   ```

### 2. Deploy to Heroku

1. **Commit your changes**
   ```bash
   git add .
   git commit -m "Initial deployment"
   ```

2. **Push to Heroku**
   ```bash
   git push heroku main
   ```

3. **Run database migrations**
   ```bash
   heroku run php -r "require 'php/config.php'; initializeDatabase();"
   ```

4. **Open your app**
   ```bash
   heroku open
   ```

## AWS Deployment

### Option 1: AWS Elastic Beanstalk

1. **Create Application**
   - Go to AWS Elastic Beanstalk Console
   - Create new application
   - Choose PHP platform

2. **Configure Environment**
   - Upload your code as a ZIP file
   - Configure environment variables
   - Set up database connections

3. **Database Setup**
   - Create RDS MySQL instance
   - Create DocumentDB (MongoDB) cluster
   - Create ElastiCache Redis cluster

### Option 2: AWS EC2

1. **Launch EC2 Instance**
   ```bash
   # Launch Ubuntu instance
   aws ec2 run-instances --image-id ami-0c02fb55956c7d316 --instance-type t2.micro --key-name your-key-pair
   ```

2. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Apache, PHP, and extensions
   sudo apt install apache2 php php-mysql php-mongodb php-redis php-json php-openssl
   
   # Install MySQL
   sudo apt install mysql-server
   
   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
   sudo apt update
   sudo apt install mongodb-org
   
   # Install Redis
   sudo apt install redis-server
   ```

3. **Configure Services**
   ```bash
   # Start and enable services
   sudo systemctl start mysql
   sudo systemctl enable mysql
   sudo systemctl start mongod
   sudo systemctl enable mongod
   sudo systemctl start redis-server
   sudo systemctl enable redis-server
   ```

4. **Deploy Application**
   ```bash
   # Clone repository
   git clone <your-repo-url> /var/www/html/internship-project
   
   # Set permissions
   sudo chown -R www-data:www-data /var/www/html/internship-project
   sudo chmod -R 755 /var/www/html/internship-project
   
   # Install Composer dependencies
   cd /var/www/html/internship-project
   composer install --no-dev
   ```

5. **Configure Apache**
   ```bash
   # Create virtual host
   sudo nano /etc/apache2/sites-available/internship-project.conf
   ```

   Add the following configuration:
   ```apache
   <VirtualHost *:80>
       ServerName your-domain.com
       DocumentRoot /var/www/html/internship-project
       
       <Directory /var/www/html/internship-project>
           AllowOverride All
           Require all granted
       </Directory>
       
       ErrorLog ${APACHE_LOG_DIR}/internship-project_error.log
       CustomLog ${APACHE_LOG_DIR}/internship-project_access.log combined
   </VirtualHost>
   ```

   ```bash
   # Enable site and restart Apache
   sudo a2ensite internship-project.conf
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   ```

## Environment Configuration

### Update Configuration Files

1. **Update `php/config.php`**
   ```php
   // Use environment variables
   const MYSQL_HOST = $_ENV['MYSQL_HOST'] ?? 'localhost';
   const MYSQL_DBNAME = $_ENV['MYSQL_DBNAME'] ?? 'internship_project';
   const MYSQL_USERNAME = $_ENV['MYSQL_USERNAME'] ?? 'root';
   const MYSQL_PASSWORD = $_ENV['MYSQL_PASSWORD'] ?? '';
   const MONGODB_URI = $_ENV['MONGODB_URI'] ?? 'mongodb://localhost:27017';
   const REDIS_HOST = $_ENV['REDIS_HOST'] ?? 'localhost';
   const REDIS_PORT = $_ENV['REDIS_PORT'] ?? 6379;
   ```

2. **Update JavaScript API URL**
   ```javascript
   // In js/main.js
   const API_BASE_URL = window.location.origin + '/php';
   ```

## Database Setup

### MySQL Setup

1. **Create Database**
   ```sql
   CREATE DATABASE internship_project CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Run Setup Script**
   ```bash
   mysql -u your_username -p internship_project < setup_database.sql
   ```

### MongoDB Setup

1. **Create Database and Collections**
   ```javascript
   use internship_project
   db.createCollection('user_profiles')
   ```

### Redis Setup

1. **Configure Redis**
   ```bash
   # Edit Redis configuration
   sudo nano /etc/redis/redis.conf
   
   # Set bind address and password if needed
   bind 127.0.0.1
   requirepass your_redis_password
   ```

## SSL/HTTPS Setup

### Let's Encrypt (Free SSL)

1. **Install Certbot**
   ```bash
   sudo apt install certbot python3-certbot-apache
   ```

2. **Obtain Certificate**
   ```bash
   sudo certbot --apache -d your-domain.com
   ```

3. **Auto-renewal**
   ```bash
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

## Monitoring and Logs

### Application Logs

1. **PHP Error Logs**
   ```bash
   tail -f /var/log/apache2/error.log
   ```

2. **Application Logs**
   ```bash
   tail -f /var/www/html/internship-project/logs/app.log
   ```

### Database Monitoring

1. **MySQL Monitoring**
   ```bash
   mysql -u root -p -e "SHOW PROCESSLIST;"
   ```

2. **MongoDB Monitoring**
   ```bash
   mongo --eval "db.serverStatus()"
   ```

3. **Redis Monitoring**
   ```bash
   redis-cli info
   ```

## Performance Optimization

### PHP Optimization

1. **Enable OPcache**
   ```bash
   sudo apt install php-opcache
   ```

2. **Configure OPcache**
   ```ini
   ; In php.ini
   opcache.enable=1
   opcache.memory_consumption=128
   opcache.interned_strings_buffer=8
   opcache.max_accelerated_files=4000
   ```

### Web Server Optimization

1. **Enable Gzip Compression**
   ```apache
   # In Apache configuration
   <IfModule mod_deflate.c>
       AddOutputFilterByType DEFLATE text/plain
       AddOutputFilterByType DEFLATE text/html
       AddOutputFilterByType DEFLATE text/xml
       AddOutputFilterByType DEFLATE text/css
       AddOutputFilterByType DEFLATE application/xml
       AddOutputFilterByType DEFLATE application/xhtml+xml
       AddOutputFilterByType DEFLATE application/rss+xml
       AddOutputFilterByType DEFLATE application/javascript
       AddOutputFilterByType DEFLATE application/x-javascript
   </IfModule>
   ```

## Backup Strategy

### Database Backups

1. **MySQL Backup**
   ```bash
   mysqldump -u username -p internship_project > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **MongoDB Backup**
   ```bash
   mongodump --db internship_project --out backup_$(date +%Y%m%d_%H%M%S)
   ```

3. **Automated Backups**
   ```bash
   # Create backup script
   nano backup.sh
   chmod +x backup.sh
   
   # Add to crontab
   crontab -e
   # Add: 0 2 * * * /path/to/backup.sh
   ```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check database credentials
   - Verify network connectivity
   - Check firewall settings

2. **Permission Errors**
   - Set correct file permissions
   - Check Apache user permissions

3. **CORS Issues**
   - Verify CORS headers in PHP
   - Check browser console for errors

4. **Session Issues**
   - Verify Redis connection
   - Check session configuration

### Debug Mode

Enable debug mode for development:
```php
// In php/config.php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## Security Checklist

- [ ] Use HTTPS
- [ ] Set secure database passwords
- [ ] Configure firewall rules
- [ ] Enable security headers
- [ ] Regular security updates
- [ ] Database connection encryption
- [ ] Input validation and sanitization
- [ ] Session security
- [ ] Error handling without information disclosure

## Support

For deployment issues:
1. Check logs for error messages
2. Verify all services are running
3. Test database connections
4. Check network connectivity
5. Review configuration files

Contact: dev@guvi.in 
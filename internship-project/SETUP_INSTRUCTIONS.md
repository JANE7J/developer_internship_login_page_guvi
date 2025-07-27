# Internship Project Setup Instructions

## Problem: Registration page not redirecting to login page

### Quick Fix Steps:

#### 1. **Database Setup**
First, ensure your database is properly set up:

1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Create database: `internship_project`
3. Run the SQL script from `setup_database.sql` to create tables

**Or run this quick setup:**
```sql
CREATE DATABASE IF NOT EXISTS internship_project;
USE internship_project;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    data TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. **Test Database Connection**
Visit: `http://localhost/internship-project/test_connection.php`
- Should show green checkmarks for database and tables

#### 3. **Test Registration**
Visit: `http://localhost/internship-project/test_register.html`
- Click "Test Database" button first
- Then test registration with the pre-filled values

#### 4. **Common Issues and Solutions**

**Issue: "Network error" or AJAX fails**
- **Solution**: Check if XAMPP Apache and MySQL are running
- Open XAMPP Control Panel and start both services

**Issue: "Database connection failed"**
- **Solution**: Update MySQL password in `php/register_simple.php` (line 78)
- Default XAMPP password is empty: `"root", ""`
- If you set a password, change it to: `"root", "your_password"`

**Issue: "Invalid JSON input"**
- **Solution**: This is usually a path issue. Make sure you're accessing via:
  - `http://localhost/internship-project/register.html` (not file:// path)

**Issue: CORS errors**
- **Solution**: The debug files have CORS headers added. Use the debug endpoint temporarily.

#### 5. **File Structure Check**
Ensure your XAMPP htdocs structure looks like:
```
C:\xampp\htdocs\internship-project\
├── index.html
├── register.html
├── login.html
├── profile.html
├── css/
├── js/
│   ├── main.js
│   ├── register.js
│   └── login.js
├── php/
│   ├── register_simple.php
│   ├── register_debug.php
│   └── login.php
└── assets/
```

#### 6. **Debug Steps**

1. **Open Browser Console** (F12 → Console tab)
2. **Try registering** and look for error messages
3. **Check Network tab** to see if AJAX requests are being made

**Common Console Errors:**
- `404 Not Found`: Wrong file path
- `500 Internal Server Error`: PHP/Database error
- `CORS error`: Accessing via file:// instead of http://

#### 7. **Switching to Debug Mode**
The register.js is already set to use `register_debug.php` which provides detailed error information.

To switch back to normal mode, change line 60 in `js/register.js`:
```javascript
// Debug mode (current)
const response = await AjaxHelper.post('register_debug.php', registrationData);

// Normal mode
const response = await AjaxHelper.post('register_simple.php', registrationData);
```

### Expected Flow:
1. Fill registration form
2. Click "Register" button
3. See "Registration successful!" message
4. Automatic redirect to login page after 2 seconds

### If Still Not Working:

1. **Check PHP Error Log**: `C:\xampp\apache\logs\error.log`
2. **Use the test page**: `test_register.html` to isolate the issue
3. **Verify jQuery is loading**: Check browser console for jQuery errors
4. **Check file permissions**: Ensure PHP files are readable

### Database Connection Settings:
If you need to change database settings, update these files:
- `php/register_simple.php` (line 78)
- `php/register_debug.php` (line 96)
- `php/login.php`
- `test_connection.php`

**Default XAMPP settings:**
- Host: `localhost`
- Username: `root`
- Password: `` (empty)
- Database: `internship_project`

### Final Notes:
- Always access via `http://localhost/internship-project/` not file paths
- Ensure XAMPP services are running
- Use the debug endpoints to get detailed error information
- Check browser console for JavaScript errors
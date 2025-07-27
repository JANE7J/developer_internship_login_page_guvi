// Login JavaScript file
// Handles user login with jQuery AJAX

$(document).ready(function() {
    const loginForm = $('#loginForm');
    
    // Check if user is already logged in
    if (SessionManager.isLoggedIn()) {
        NavigationHelper.redirectTo('profile.html');
        return;
    }
    
    // Form submission handler
    loginForm.on('submit', async function(e) {
        e.preventDefault();
        
        // Clear previous errors
        FormValidator.clearAllErrors(loginForm);
        
        // Get form data
        const username = $('#username');
        const password = $('#password');
        
        // Validate form fields
        let isValid = true;
        
        // Validate username
        if (!FormValidator.validateRequired(username, 'Username')) {
            isValid = false;
        }
        
        // Validate password
        if (!FormValidator.validateRequired(password, 'Password')) {
            isValid = false;
        }
        
        if (!isValid) {
            Utils.showAlert('Please fill in all required fields.', 'warning');
            return;
        }
        
        // Show loading state
        const submitBtn = loginForm.find('button[type="submit"]');
        const originalText = Utils.showLoading(submitBtn);
        
        try {
            // Prepare login data
            const loginData = {
                username: Utils.sanitizeInput(username.val().trim()),
                password: password.val()
            };
            
            // Send login request
            const response = await AjaxHelper.post('login.php', loginData);
            
            if (response.success) {
                // Store session data in localStorage
                SessionManager.setSession({
                    user_id: response.user_id,
                    username: response.username,
                    email: response.email,
                    token: response.token
                });
                
                Utils.showAlert('Login successful! Redirecting to profile...', 'success');
                
                // Clear form
                loginForm[0].reset();
                
                // Redirect to profile page after 1 second
                setTimeout(() => {
                    NavigationHelper.redirectTo('profile.html');
                }, 1000);
            } else {
                Utils.showAlert(response.message || 'Login failed. Please check your credentials.', 'danger');
            }
        } catch (error) {
            console.error('Login error:', error);
            
            if (error.responseJSON) {
                const errorData = error.responseJSON;
                if (errorData.message) {
                    Utils.showAlert(errorData.message, 'danger');
                } else if (errorData.errors) {
                    // Handle field-specific errors
                    Object.keys(errorData.errors).forEach(field => {
                        const fieldElement = $(`#${field}`);
                        if (fieldElement.length) {
                            FormValidator.showFieldError(fieldElement, errorData.errors[field]);
                        }
                    });
                    Utils.showAlert('Please fix the errors in the form.', 'warning');
                } else {
                    Utils.showAlert('Login failed. Please try again.', 'danger');
                }
            } else {
                Utils.showAlert('Network error. Please check your connection and try again.', 'danger');
            }
        } finally {
            // Hide loading state
            Utils.hideLoading(submitBtn, originalText);
        }
    });
    
    // Real-time validation
    $('#username').on('blur', function() {
        const field = $(this);
        if (field.val().trim()) {
            FormValidator.validateRequired(field, 'Username');
        }
    });
    
    $('#password').on('blur', function() {
        const field = $(this);
        if (field.val()) {
            FormValidator.validateRequired(field, 'Password');
        }
    });
    
    // Clear errors on input
    $('input').on('input', function() {
        FormValidator.clearFieldError($(this));
    });
    
    // Enter key handler for quick login
    $('input').on('keypress', function(e) {
        if (e.which === 13) { // Enter key
            loginForm.submit();
        }
    });
    
    // Remember me functionality (optional)
    let rememberMeTimeout;
    $('#rememberMe').on('change', function() {
        const isChecked = $(this).is(':checked');
        
        if (isChecked) {
            // Store remember me preference
            localStorage.setItem('rememberMe', 'true');
        } else {
            // Remove remember me preference
            localStorage.removeItem('rememberMe');
        }
    });
    
    // Auto-fill username if remembered
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername && localStorage.getItem('rememberMe') === 'true') {
        $('#username').val(rememberedUsername);
    }
    
    // Form reset handler
    loginForm.on('reset', function() {
        FormValidator.clearAllErrors(loginForm);
    });
    
    // Demo login functionality (for testing purposes)
    $('#demoLogin').on('click', function(e) {
        e.preventDefault();
        
        // Fill demo credentials
        $('#username').val('demo_user');
        $('#password').val('DemoPass123');
        
        // Submit form
        loginForm.submit();
    });
    
    // Show/hide password functionality
    $('#togglePassword').on('click', function() {
        const passwordField = $('#password');
        const icon = $(this).find('i');
        
        if (passwordField.attr('type') === 'password') {
            passwordField.attr('type', 'text');
            icon.removeClass('bi-eye').addClass('bi-eye-slash');
        } else {
            passwordField.attr('type', 'password');
            icon.removeClass('bi-eye-slash').addClass('bi-eye');
        }
    });
    
    // Focus on username field when page loads
    $('#username').focus();
    
    // Add visual feedback for form interactions
    $('.form-control').on('focus', function() {
        $(this).parent().addClass('focused');
    }).on('blur', function() {
        $(this).parent().removeClass('focused');
    });
    
    // Add loading animation to form
    loginForm.on('submit', function() {
        $(this).addClass('loading');
    });
    
    // Remove loading animation when request completes
    $(document).ajaxComplete(function() {
        loginForm.removeClass('loading');
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function() {
        if (SessionManager.isLoggedIn()) {
            NavigationHelper.redirectTo('profile.html');
        }
    });
    
    // Prevent form resubmission on page refresh
    if (window.history.replaceState) {
        window.history.replaceState(null, null, window.location.href);
    }
}); 
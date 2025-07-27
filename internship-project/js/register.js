// Registration JavaScript file
// Handles user registration with jQuery AJAX

$(document).ready(function() {
    const registerForm = $('#registerForm');
    
    // Form submission handler
    registerForm.on('submit', async function(e) {
        e.preventDefault();
        
        // Clear previous errors
        FormValidator.clearAllErrors(registerForm);
        
        // Get form data
        const username = $('#username');
        const email = $('#email');
        const password = $('#password');
        const confirmPassword = $('#confirmPassword');
        
        // Validate form fields
        let isValid = true;
        
        // Validate username
        if (!FormValidator.validateRequired(username, 'Username')) {
            isValid = false;
        }
        
        // Validate email
        if (!FormValidator.validateRequired(email, 'Email')) {
            isValid = false;
        } else if (!FormValidator.validateEmail(email)) {
            isValid = false;
        }
        
        // Validate password
        if (!FormValidator.validateRequired(password, 'Password')) {
            isValid = false;
        } else if (!FormValidator.validatePassword(password)) {
            isValid = false;
        }
        
        // Validate confirm password
        if (!FormValidator.validateRequired(confirmPassword, 'Confirm Password')) {
            isValid = false;
        } else if (!FormValidator.validateConfirmPassword(password, confirmPassword)) {
            isValid = false;
        }
        
        if (!isValid) {
            Utils.showAlert('Please fix the errors in the form.', 'warning');
            return;
        }
        
        // Show loading state
        const submitBtn = registerForm.find('button[type="submit"]');
        const originalText = Utils.showLoading(submitBtn);
        
        try {
            // Prepare registration data
            const registrationData = {
                username: Utils.sanitizeInput(username.val().trim()),
                email: Utils.sanitizeInput(email.val().trim()),
                password: password.val()
            };
            
            // Send registration request
            const response = await AjaxHelper.post('register_simple.php', registrationData);
            
            if (response.success) {
                Utils.showAlert('Registration successful! Please login with your credentials.', 'success');
                
                // Clear form
                registerForm[0].reset();
                
                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    NavigationHelper.redirectTo('login.html');
                }, 2000);
            } else {
                Utils.showAlert(response.message || 'Registration failed. Please try again.', 'danger');
            }
        } catch (error) {
            console.error('Registration error:', error);
            
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
                    Utils.showAlert('Registration failed. Please try again.', 'danger');
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
    
    $('#email').on('blur', function() {
        const field = $(this);
        if (field.val().trim()) {
            FormValidator.validateRequired(field, 'Email');
            if (field.val().trim()) {
                FormValidator.validateEmail(field);
            }
        }
    });
    
    $('#password').on('blur', function() {
        const field = $(this);
        if (field.val()) {
            FormValidator.validateRequired(field, 'Password');
            if (field.val()) {
                FormValidator.validatePassword(field);
            }
        }
    });
    
    $('#confirmPassword').on('blur', function() {
        const field = $(this);
        const passwordField = $('#password');
        if (field.val()) {
            FormValidator.validateRequired(field, 'Confirm Password');
            if (field.val() && passwordField.val()) {
                FormValidator.validateConfirmPassword(passwordField, field);
            }
        }
    });
    
    // Clear errors on input
    $('input').on('input', function() {
        FormValidator.clearFieldError($(this));
    });
    
    // Username availability check (optional feature)
    let usernameTimeout;
    $('#username').on('input', function() {
        const username = $(this).val().trim();
        
        // Clear previous timeout
        clearTimeout(usernameTimeout);
        
        if (username.length >= 3) {
            // Debounce the check
            usernameTimeout = setTimeout(async function() {
                try {
                    const response = await AjaxHelper.get(`check_username.php?username=${encodeURIComponent(username)}`);
                    
                    if (response.available === false) {
                        FormValidator.showFieldError($('#username'), 'Username is already taken');
                    } else {
                        FormValidator.clearFieldError($('#username'));
                    }
                } catch (error) {
                    console.error('Username check error:', error);
                    // Don't show error for availability check failures
                }
            }, 500);
        }
    });
    
    // Email format validation on input
    $('#email').on('input', function() {
        const email = $(this).val().trim();
        if (email && !Utils.validateEmail(email)) {
            FormValidator.showFieldError($(this), 'Please enter a valid email address');
        } else {
            FormValidator.clearFieldError($(this));
        }
    });
    
    // Password strength indicator (optional feature)
    $('#password').on('input', function() {
        const password = $(this).val();
        const strengthIndicator = $('#passwordStrength');
        
        if (!strengthIndicator.length) {
            const indicator = $(`
                <div id="passwordStrength" class="mt-2">
                    <div class="progress" style="height: 5px;">
                        <div class="progress-bar" role="progressbar" style="width: 0%"></div>
                    </div>
                    <small class="text-muted">Password strength: <span id="strengthText">Weak</span></small>
                </div>
            `);
            $(this).after(indicator);
        }
        
        const strength = calculatePasswordStrength(password);
        const progressBar = strengthIndicator.find('.progress-bar');
        const strengthText = strengthIndicator.find('#strengthText');
        
        progressBar.css('width', strength.percentage + '%');
        progressBar.removeClass('bg-danger bg-warning bg-success');
        
        if (strength.percentage < 40) {
            progressBar.addClass('bg-danger');
            strengthText.text('Weak');
        } else if (strength.percentage < 70) {
            progressBar.addClass('bg-warning');
            strengthText.text('Medium');
        } else {
            progressBar.addClass('bg-success');
            strengthText.text('Strong');
        }
    });
    
    // Password strength calculation
    function calculatePasswordStrength(password) {
        let score = 0;
        let feedback = [];
        
        if (password.length >= 8) score += 25;
        if (/[a-z]/.test(password)) score += 15;
        if (/[A-Z]/.test(password)) score += 15;
        if (/\d/.test(password)) score += 15;
        if (/[@$!%*?&]/.test(password)) score += 15;
        if (password.length >= 12) score += 15;
        
        return {
            percentage: Math.min(score, 100),
            feedback: feedback
        };
    }
    
    // Form reset handler
    registerForm.on('reset', function() {
        FormValidator.clearAllErrors(registerForm);
        $('#passwordStrength').remove();
    });
}); 
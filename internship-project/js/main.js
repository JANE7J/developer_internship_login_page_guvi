// Main JavaScript file for Internship Project
// Common utilities and session management

// API Base URL - Update this according to your server configuration
const API_BASE_URL = 'php'; // Use relative path for XAMPP

// Session management using localStorage
class SessionManager {
    static setSession(userData) {
        localStorage.setItem('userSession', JSON.stringify(userData));
    }

    static getSession() {
        const session = localStorage.getItem('userSession');
        return session ? JSON.parse(session) : null;
    }

    static clearSession() {
        localStorage.removeItem('userSession');
    }

    static isLoggedIn() {
        return this.getSession() !== null;
    }

    static getUserId() {
        const session = this.getSession();
        return session ? session.user_id : null;
    }

    static getUsername() {
        const session = this.getSession();
        return session ? session.username : null;
    }
}

// Utility functions
class Utils {
    static showAlert(message, type = 'info') {
        const alertDiv = $(`
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);
        
        $('body').prepend(alertDiv);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            alertDiv.alert('close');
        }, 5000);
    }

    static showLoading(button) {
        const originalText = button.text();
        button.html('<span class="spinner-border spinner-border-sm me-2"></span>Loading...');
        button.prop('disabled', true);
        return originalText;
    }

    static hideLoading(button, originalText) {
        button.text(originalText);
        button.prop('disabled', false);
    }

    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }

    static formatDate(date) {
        return new Date(date).toISOString().split('T')[0];
    }

    static sanitizeInput(input) {
        return input.replace(/[<>]/g, '');
    }
}

// AJAX utility class
class AjaxHelper {
    static async request(url, method = 'GET', data = null) {
        try {
            const options = {
                url: `${API_BASE_URL}/${url}`,
                method: method,
                dataType: 'json',
                contentType: 'application/json',
                beforeSend: function(xhr) {
                    // Add session token if available
                    const session = SessionManager.getSession();
                    if (session && session.token) {
                        xhr.setRequestHeader('Authorization', `Bearer ${session.token}`);
                    }
                }
            };

            if (data) {
                options.data = JSON.stringify(data);
            }

            const response = await $.ajax(options);
            return response;
        } catch (error) {
            console.error('AJAX Error:', error);
            throw error;
        }
    }

    static async get(url) {
        return this.request(url, 'GET');
    }

    static async post(url, data) {
        return this.request(url, 'POST', data);
    }

    static async put(url, data) {
        return this.request(url, 'PUT', data);
    }

    static async delete(url) {
        return this.request(url, 'DELETE');
    }
}

// Form validation class
class FormValidator {
    static validateRequired(field, fieldName) {
        const value = field.val().trim();
        if (!value) {
            this.showFieldError(field, `${fieldName} is required`);
            return false;
        }
        this.clearFieldError(field);
        return true;
    }

    static validateEmail(field) {
        const email = field.val().trim();
        if (!Utils.validateEmail(email)) {
            this.showFieldError(field, 'Please enter a valid email address');
            return false;
        }
        this.clearFieldError(field);
        return true;
    }

    static validatePassword(field) {
        const password = field.val();
        if (!Utils.validatePassword(password)) {
            this.showFieldError(field, 'Password must be at least 8 characters with uppercase, lowercase, and number');
            return false;
        }
        this.clearFieldError(field);
        return true;
    }

    static validateConfirmPassword(passwordField, confirmField) {
        const password = passwordField.val();
        const confirmPassword = confirmField.val();
        
        if (password !== confirmPassword) {
            this.showFieldError(confirmField, 'Passwords do not match');
            return false;
        }
        this.clearFieldError(confirmField);
        return true;
    }

    static showFieldError(field, message) {
        field.addClass('is-invalid');
        let errorDiv = field.siblings('.invalid-feedback');
        if (errorDiv.length === 0) {
            errorDiv = $(`<div class="invalid-feedback">${message}</div>`);
            field.after(errorDiv);
        } else {
            errorDiv.text(message);
        }
    }

    static clearFieldError(field) {
        field.removeClass('is-invalid');
        field.siblings('.invalid-feedback').remove();
    }

    static clearAllErrors(form) {
        form.find('.is-invalid').removeClass('is-invalid');
        form.find('.invalid-feedback').remove();
    }
}

// Navigation helper
class NavigationHelper {
    static redirectTo(url) {
        window.location.href = url;
    }

    static checkAuth() {
        if (!SessionManager.isLoggedIn()) {
            this.redirectTo('login.html');
            return false;
        }
        return true;
    }

    static logout() {
        SessionManager.clearSession();
        this.redirectTo('index.html');
    }
}

// Initialize common functionality
$(document).ready(function() {
    // Add fade-in animation to cards
    $('.card').addClass('fade-in');

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Global logout handler
    $(document).on('click', '#logoutBtn', function(e) {
        e.preventDefault();
        NavigationHelper.logout();
    });

    // Global error handler for AJAX requests
    $(document).ajaxError(function(event, xhr, settings, error) {
        console.error('Global AJAX Error:', error);
        
        if (xhr.status === 401) {
            // Unauthorized - redirect to login
            Utils.showAlert('Session expired. Please login again.', 'warning');
            setTimeout(() => {
                NavigationHelper.logout();
            }, 2000);
        } else if (xhr.status === 500) {
            Utils.showAlert('Server error. Please try again later.', 'danger');
        } else {
            Utils.showAlert('An error occurred. Please try again.', 'danger');
        }
    });
});

// Export classes for use in other files
window.SessionManager = SessionManager;
window.Utils = Utils;
window.AjaxHelper = AjaxHelper;
window.FormValidator = FormValidator;
window.NavigationHelper = NavigationHelper; 
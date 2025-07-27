// Profile JavaScript file
// Handles user profile management with jQuery AJAX

$(document).ready(function() {
    const profileForm = $('#profileForm');
    
    // Check if user is logged in
    if (!NavigationHelper.checkAuth()) {
        return;
    }
    
    // Display user info in navbar
    const username = SessionManager.getUsername();
    if (username) {
        $('#userInfo').text(`Welcome, ${username}`);
    }
    
    // Load user profile data
    loadUserProfile();
    
    // Form submission handler
    profileForm.on('submit', async function(e) {
        e.preventDefault();
        
        // Clear previous errors
        FormValidator.clearAllErrors(profileForm);
        
        // Get form data
        const firstName = $('#firstName');
        const lastName = $('#lastName');
        const age = $('#age');
        const dob = $('#dob');
        const contact = $('#contact');
        const gender = $('#gender');
        const address = $('#address');
        const bio = $('#bio');
        
        // Validate form fields
        let isValid = true;
        
        // Validate required fields
        if (!FormValidator.validateRequired(firstName, 'First Name')) {
            isValid = false;
        }
        
        if (!FormValidator.validateRequired(lastName, 'Last Name')) {
            isValid = false;
        }
        
        if (!FormValidator.validateRequired(age, 'Age')) {
            isValid = false;
        } else {
            const ageValue = parseInt(age.val());
            if (ageValue < 1 || ageValue > 120) {
                FormValidator.showFieldError(age, 'Age must be between 1 and 120');
                isValid = false;
            }
        }
        
        if (!FormValidator.validateRequired(dob, 'Date of Birth')) {
            isValid = false;
        }
        
        if (!FormValidator.validateRequired(contact, 'Contact Number')) {
            isValid = false;
        } else {
            // Basic phone number validation
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(contact.val().replace(/[\s\-\(\)]/g, ''))) {
                FormValidator.showFieldError(contact, 'Please enter a valid phone number');
                isValid = false;
            }
        }
        
        if (!FormValidator.validateRequired(gender, 'Gender')) {
            isValid = false;
        }
        
        if (!FormValidator.validateRequired(address, 'Address')) {
            isValid = false;
        }
        
        if (!isValid) {
            Utils.showAlert('Please fix the errors in the form.', 'warning');
            return;
        }
        
        // Show loading state
        const submitBtn = profileForm.find('button[type="submit"]');
        const originalText = Utils.showLoading(submitBtn);
        
        try {
            // Prepare profile data
            const profileData = {
                user_id: SessionManager.getUserId(),
                firstName: Utils.sanitizeInput(firstName.val().trim()),
                lastName: Utils.sanitizeInput(lastName.val().trim()),
                age: parseInt(age.val()),
                dob: dob.val(),
                contact: Utils.sanitizeInput(contact.val().trim()),
                gender: gender.val(),
                address: Utils.sanitizeInput(address.val().trim()),
                bio: Utils.sanitizeInput(bio.val().trim())
            };
            
            // Send profile update request
            const response = await AjaxHelper.put('profile.php', profileData);
            
            if (response.success) {
                Utils.showAlert('Profile updated successfully!', 'success');
                
                // Update session data if needed
                if (response.user_data) {
                    const currentSession = SessionManager.getSession();
                    SessionManager.setSession({
                        ...currentSession,
                        ...response.user_data
                    });
                }
            } else {
                Utils.showAlert(response.message || 'Profile update failed. Please try again.', 'danger');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            
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
                    Utils.showAlert('Profile update failed. Please try again.', 'danger');
                }
            } else {
                Utils.showAlert('Network error. Please check your connection and try again.', 'danger');
            }
        } finally {
            // Hide loading state
            Utils.hideLoading(submitBtn, originalText);
        }
    });
    
    // Load user profile data
    async function loadUserProfile() {
        try {
            const userId = SessionManager.getUserId();
            const response = await AjaxHelper.get(`profile.php?user_id=${userId}`);
            
            if (response.success && response.profile) {
                populateProfileForm(response.profile);
            } else {
                Utils.showAlert('Failed to load profile data.', 'warning');
            }
        } catch (error) {
            console.error('Profile load error:', error);
            Utils.showAlert('Failed to load profile data. Please refresh the page.', 'danger');
        }
    }
    
    // Populate form with profile data
    function populateProfileForm(profile) {
        $('#firstName').val(profile.firstName || '');
        $('#lastName').val(profile.lastName || '');
        $('#age').val(profile.age || '');
        $('#dob').val(profile.dob || '');
        $('#contact').val(profile.contact || '');
        $('#gender').val(profile.gender || '');
        $('#address').val(profile.address || '');
        $('#bio').val(profile.bio || '');
        
        // Add fade-in effect
        profileForm.addClass('fade-in');
    }
    
    // Real-time validation
    $('#firstName').on('blur', function() {
        const field = $(this);
        if (field.val().trim()) {
            FormValidator.validateRequired(field, 'First Name');
        }
    });
    
    $('#lastName').on('blur', function() {
        const field = $(this);
        if (field.val().trim()) {
            FormValidator.validateRequired(field, 'Last Name');
        }
    });
    
    $('#age').on('blur', function() {
        const field = $(this);
        if (field.val()) {
            FormValidator.validateRequired(field, 'Age');
            const ageValue = parseInt(field.val());
            if (ageValue < 1 || ageValue > 120) {
                FormValidator.showFieldError(field, 'Age must be between 1 and 120');
            }
        }
    });
    
    $('#dob').on('blur', function() {
        const field = $(this);
        if (field.val()) {
            FormValidator.validateRequired(field, 'Date of Birth');
        }
    });
    
    $('#contact').on('blur', function() {
        const field = $(this);
        if (field.val().trim()) {
            FormValidator.validateRequired(field, 'Contact Number');
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(field.val().replace(/[\s\-\(\)]/g, ''))) {
                FormValidator.showFieldError(field, 'Please enter a valid phone number');
            }
        }
    });
    
    $('#gender').on('change', function() {
        const field = $(this);
        if (field.val()) {
            FormValidator.validateRequired(field, 'Gender');
        }
    });
    
    $('#address').on('blur', function() {
        const field = $(this);
        if (field.val().trim()) {
            FormValidator.validateRequired(field, 'Address');
        }
    });
    
    // Clear errors on input
    $('input, select, textarea').on('input change', function() {
        FormValidator.clearFieldError($(this));
    });
    
    // Age calculation from date of birth
    $('#dob').on('change', function() {
        const dob = $(this).val();
        const ageField = $('#age');
        
        if (dob) {
            const birthDate = new Date(dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            if (age >= 0 && age <= 120) {
                ageField.val(age);
            }
        }
    });
    
    // Contact number formatting
    $('#contact').on('input', function() {
        let value = $(this).val().replace(/\D/g, '');
        
        if (value.length > 0) {
            if (value.length <= 3) {
                value = `(${value}`;
            } else if (value.length <= 6) {
                value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
            } else {
                value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
            }
        }
        
        $(this).val(value);
    });
    
    // Form reset handler
    profileForm.on('reset', function() {
        FormValidator.clearAllErrors(profileForm);
        loadUserProfile(); // Reload original data
    });
    
    // Auto-save functionality (optional)
    let autoSaveTimeout;
    $('input, select, textarea').on('input change', function() {
        clearTimeout(autoSaveTimeout);
        
        autoSaveTimeout = setTimeout(() => {
            // Auto-save after 3 seconds of inactivity
            if (profileForm.find('.is-invalid').length === 0) {
                profileForm.submit();
            }
        }, 3000);
    });
    
    // Profile picture upload (if implemented)
    $('#profilePicture').on('change', function() {
        const file = this.files[0];
        if (file) {
            // Validate file type and size
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            const maxSize = 5 * 1024 * 1024; // 5MB
            
            if (!allowedTypes.includes(file.type)) {
                Utils.showAlert('Please select a valid image file (JPEG, PNG, GIF).', 'warning');
                return;
            }
            
            if (file.size > maxSize) {
                Utils.showAlert('File size must be less than 5MB.', 'warning');
                return;
            }
            
            // Upload profile picture
            uploadProfilePicture(file);
        }
    });
    
    // Upload profile picture function
    async function uploadProfilePicture(file) {
        const formData = new FormData();
        formData.append('profile_picture', file);
        formData.append('user_id', SessionManager.getUserId());
        
        try {
            const response = await $.ajax({
                url: `${API_BASE_URL}/upload_profile_picture.php`,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                beforeSend: function(xhr) {
                    const session = SessionManager.getSession();
                    if (session && session.token) {
                        xhr.setRequestHeader('Authorization', `Bearer ${session.token}`);
                    }
                }
            });
            
            if (response.success) {
                Utils.showAlert('Profile picture updated successfully!', 'success');
                // Update profile picture display if needed
            } else {
                Utils.showAlert(response.message || 'Failed to upload profile picture.', 'danger');
            }
        } catch (error) {
            console.error('Profile picture upload error:', error);
            Utils.showAlert('Failed to upload profile picture. Please try again.', 'danger');
        }
    }
    
    // Export profile data (optional feature)
    $('#exportProfile').on('click', function() {
        const profileData = {
            firstName: $('#firstName').val(),
            lastName: $('#lastName').val(),
            age: $('#age').val(),
            dob: $('#dob').val(),
            contact: $('#contact').val(),
            gender: $('#gender').val(),
            address: $('#address').val(),
            bio: $('#bio').val()
        };
        
        const dataStr = JSON.stringify(profileData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'profile_data.json';
        link.click();
        
        URL.revokeObjectURL(url);
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function() {
        if (!SessionManager.isLoggedIn()) {
            NavigationHelper.redirectTo('login.html');
        }
    });
    
    // Prevent form resubmission on page refresh
    if (window.history.replaceState) {
        window.history.replaceState(null, null, window.location.href);
    }
}); 
// ClinicalGoTo JavaScript Application

// API Configuration
const API_BASE_URL = '/api';

// Global variables
let searchResults = [];
let currentStep = 1;
let formData = {};

// DOM Elements
const searchBtn = document.getElementById('searchBtn');
const locationInput = document.getElementById('locationInput');
const conditionInput = document.getElementById('conditionInput');
const searchResultsSection = document.getElementById('searchResults');
const resultsContainer = document.getElementById('resultsContainer');
const showFormBtn = document.getElementById('showFormBtn');
const registrationForm = document.getElementById('registrationForm');
const userForm = document.getElementById('userForm');
const successMessage = document.getElementById('successMessage');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing application...');
    initializeEventListeners();
    initializeFormValidation();
    
    // Focus on location input for better UX
    if (locationInput) {
        locationInput.focus();
    }
    
    console.log('Application initialized successfully');
});

// Initialize event listeners
function initializeEventListeners() {
    // Search functionality
    searchBtn.addEventListener('click', handleSearch);
    locationInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    conditionInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Show form button
    showFormBtn.addEventListener('click', showRegistrationForm);
    
    // Form submission
    userForm.addEventListener('submit', handleFormSubmission);
    
    // Form input validation
    setupFormValidation();
}

// Search for clinical trials
async function handleSearch() {
    const location = locationInput.value.trim();
    const condition = conditionInput.value.trim();
    
    if (!location) {
        alert('Please enter a location to search for clinical trials.');
        locationInput.focus();
        return;
    }
    
    // Show loading state
    searchBtn.innerHTML = '<span class="loading-spinner"></span>Searching...';
    searchBtn.disabled = true;
    
    try {
        const trials = await searchClinicalTrials(location, condition);
        displaySearchResults(trials);
    } catch (error) {
        console.error('Error searching clinical trials:', error);
        alert('Sorry, there was an error searching for clinical trials. Please try again.');
    } finally {
        // Reset button state
        searchBtn.innerHTML = 'Search Clinical Trials';
        searchBtn.disabled = false;
    }
}

// Search clinical trials using the API
async function searchClinicalTrials(location, condition) {
    const params = new URLSearchParams({
        'location': location,
        'pageSize': '10'
    });
    
    if (condition) {
        params.append('condition', condition);
    }
    
    const response = await fetch(`${API_BASE_URL}/clinical-trials?${params}`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch clinical trials');
    }
    
    const data = await response.json();
    return data.studies || [];
}

// Display search results
function displaySearchResults(trials) {
    console.log('Displaying search results:', trials.length, 'trials found');
    console.log('First trial sample:', trials[0]);
    
    if (trials.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <p>No clinical trials found in your area. Try expanding your search radius or check back later for new opportunities.</p>
            </div>
        `;
    } else {
        const cardsHtml = trials.map(trial => createTrialCard(trial)).join('');
        console.log('Generated HTML length:', cardsHtml.length);
        resultsContainer.innerHTML = cardsHtml;
    }
    
    // Show results section
    searchResultsSection.style.display = 'block';
    
    // Smooth scroll to results
    searchResultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Store results for potential future use
    window.searchResults = trials;
}

// Create trial card HTML - UPDATED VERSION 2025
function createTrialCard(trial) {
    const title = trial.title || 'Clinical Trial';
    const description = trial.description || 'No description available.';
    const location = trial.location || 'Location not specified';
    const nctId = trial.id || '';
    
    console.log('=== DEBUG: Creating trial card ===');
    console.log('Trial ID:', nctId);
    console.log('Title:', title);
    
    // FORCE create the link if we have an nctId
    let linkSection = '';
    if (nctId && nctId.trim() !== '') {
        const clinicalTrialsUrl = `https://clinicaltrials.gov/study/${nctId}`;
        console.log('Creating link to:', clinicalTrialsUrl);
        linkSection = `
            <div class="trial-link">
                <a href="${clinicalTrialsUrl}" target="_blank" rel="noopener noreferrer" class="clinical-trials-link">
                    View Full Details on ClinicalTrials.gov ↗
                </a>
            </div>`;
    } else {
        console.log('NO LINK: Missing nctId');
    }
    
    const cardHtml = `
        <div class="trial-card">
            <div class="trial-title">${title}</div>
            <div class="trial-description">${description.substring(0, 200)}${description.length > 200 ? '...' : ''}</div>
            <div class="trial-location">📍 ${location}</div>
            ${nctId ? `<div class="trial-id">Study ID: ${nctId}</div>` : ''}
            ${linkSection}
        </div>`;
    
    console.log('Generated card HTML length:', cardHtml.length);
    return cardHtml;
}

// Show registration form
function showRegistrationForm() {
    registrationForm.style.display = 'block';
    registrationForm.scrollIntoView({ behavior: 'smooth' });
    
    // Initialize first step with required attribute
    const firstInput = document.getElementById('fullName');
    firstInput.setAttribute('required', 'required');
    firstInput.focus();
}

// Form step navigation
function nextStepHandler(step) {
    const currentStepElement = document.getElementById(`step${currentStep}`);
    const nextStepElement = document.getElementById(`step${step}`);
    
    // Validate current step
    if (!validateCurrentStep()) {
        return;
    }
    
    // Save current step data
    saveCurrentStepData();
    
    // Remove required attribute from current step
    const currentInput = currentStepElement.querySelector('input, textarea');
    if (currentInput) {
        currentInput.removeAttribute('required');
    }
    
    // Hide current step
    currentStepElement.classList.remove('active');
    
    // Show next step
    nextStepElement.classList.add('active');
    currentStep = step;
    
    // Add required attribute to next step
    const nextInput = nextStepElement.querySelector('input, textarea');
    if (nextInput) {
        nextInput.setAttribute('required', 'required');
        nextInput.focus();
    }
}

function prevStepHandler(step) {
    const currentStepElement = document.getElementById(`step${currentStep}`);
    const prevStepElement = document.getElementById(`step${step}`);
    
    // Remove required attribute from current step
    const currentInput = currentStepElement.querySelector('input, textarea');
    if (currentInput) {
        currentInput.removeAttribute('required');
    }
    
    // Hide current step
    currentStepElement.classList.remove('active');
    
    // Show previous step
    prevStepElement.classList.add('active');
    currentStep = step;
    
    // Add required attribute to previous step
    const prevInput = prevStepElement.querySelector('input, textarea');
    if (prevInput) {
        prevInput.setAttribute('required', 'required');
        prevInput.focus();
    }
}

// Legacy functions for backward compatibility
function nextStep(step) {
    nextStepHandler(step);
}

function prevStep(step) {
    prevStepHandler(step);
}

// Validate current step
function validateCurrentStep() {
    const currentStepElement = document.getElementById(`step${currentStep}`);
    const input = currentStepElement.querySelector('input, textarea');
    
    if (input && input.hasAttribute('required')) {
        if (!input.value.trim()) {
            input.focus();
            alert('Please fill out this field before continuing.');
            return false;
        }
        
        // Email validation
        if (input.type === 'email' && !isValidEmail(input.value)) {
            input.focus();
            alert('Please enter a valid email address.');
            return false;
        }
        
        // Phone validation
        if (input.type === 'tel' && !isValidPhone(input.value)) {
            input.focus();
            alert('Please enter a valid phone number.');
            return false;
        }
    }
    
    return true;
}

// Save current step data
function saveCurrentStepData() {
    const currentStepElement = document.getElementById(`step${currentStep}`);
    const input = currentStepElement.querySelector('input, textarea');
    
    if (input) {
        formData[input.name] = input.value;
    }
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return cleanPhone.length >= 10 && phoneRegex.test(cleanPhone);
}

// Setup form validation
function setupFormValidation() {
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateInput(this);
        });
        
        input.addEventListener('input', function() {
            clearInputError(this);
        });
    });
}

// Validate individual input
function validateInput(input) {
    const isValid = input.checkValidity();
    
    if (!isValid) {
        input.classList.add('error');
    } else {
        input.classList.remove('error');
    }
    
    return isValid;
}

// Clear input error
function clearInputError(input) {
    input.classList.remove('error');
}

// Handle form submission
async function handleFormSubmission(e) {
    e.preventDefault();
    
    // Validate final step
    if (!validateCurrentStep()) {
        return;
    }
    
    // Save final step data
    saveCurrentStepData();
    
    // Check consent
    const consent = document.getElementById('consent');
    if (!consent.checked) {
        alert('Please agree to be contacted regarding clinical trials.');
        consent.focus();
        return;
    }
    
    // Add consent to form data
    formData.consent = consent.checked;
    
    // Show loading state
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading-spinner"></span>Submitting...';
    submitBtn.disabled = true;
    
    try {
        // Submit form data
        await submitUserData({
            ...formData,
            consent: consent.checked
        });
        
        // Show success message
        registrationForm.style.display = 'none';
        successMessage.style.display = 'block';
        successMessage.scrollIntoView({ behavior: 'smooth' });
        
        // Welcome email is automatically sent by the backend
        
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Sorry, there was an error submitting your information. Please try again.');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Submit user data to the backend
async function submitUserData(userData) {
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit user data');
    }
    
    return await response.json();
}

// Send welcome email (This would connect to your backend)
async function sendWelcomeEmail(email, name) {
    // This is a placeholder for your email service
    // In a real application, you would send this request to your server
    console.log('Sending welcome email to:', email, 'for:', name);
    
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true });
        }, 500);
    });
}

// Utility functions
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    
    return phone;
}

// Analytics tracking (placeholder)
function trackEvent(eventName, eventData) {
    console.log('Analytics event:', eventName, eventData);
    // In a real application, you would send this to your analytics service
}

// Track form steps
function trackFormStep(step) {
    trackEvent('form_step_completed', { step: step });
}

// Track search
function trackSearch(location, condition) {
    trackEvent('clinical_trial_search', { location, condition });
}

// Add some smooth scrolling behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Initialize form validation and navigation
function initializeFormValidation() {
    // Remove required attributes from all hidden fields initially
    const allFormInputs = document.querySelectorAll('#userForm input, #userForm textarea');
    allFormInputs.forEach(input => {
        input.removeAttribute('required');
    });
    
    // Only set required on the first step's input
    const firstStepInput = document.querySelector('#step1 input');
    if (firstStepInput) {
        firstStepInput.setAttribute('required', 'required');
    }
    
    // Handle next buttons
    const nextButtons = document.querySelectorAll('.next-btn');
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const nextStep = parseInt(this.getAttribute('data-next-step'));
            if (nextStep) {
                nextStepHandler(nextStep);
                trackFormStep(nextStep - 1);
            }
        });
    });
    
    // Handle previous buttons
    const prevButtons = document.querySelectorAll('.prev-btn');
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const prevStep = parseInt(this.getAttribute('data-prev-step'));
            if (prevStep) {
                prevStepHandler(prevStep);
            }
        });
    });
}

// Expose functions globally for HTML onclick handlers
window.nextStep = nextStep;
window.prevStep = prevStep;

// ServiceWorker completely removed to prevent errors

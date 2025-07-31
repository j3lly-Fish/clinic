// ClinicalGoTo JavaScript Application - New User-First Flow

// API Configuration
const API_BASE_URL = '/api';

// Global variables
let searchResults = [];
let currentStep = 1;
let userData = {};

// Common medical conditions for suggestions
// Comprehensive medical conditions list compiled from ClinicalTrials.gov API and medical databases
const comprehensiveConditions = [
    // Cancers
    'Adenocarcinoma',
    'Bladder Cancer',
    'Brain Cancer',
    'Brain Tumor',
    'Breast Cancer',
    'Cervical Cancer',
    'Colon Cancer',
    'Colorectal Cancer',
    'Endometrial Cancer',
    'Esophageal Cancer',
    'Gastric Cancer',
    'Head and Neck Cancer',
    'Kidney Cancer',
    'Leukemia',
    'Liver Cancer',
    'Lung Cancer',
    'Lymphoma',
    'Melanoma',
    'Multiple Myeloma',
    'Non-Small Cell Lung Cancer',
    'Ovarian Cancer',
    'Pancreatic Cancer',
    'Prostate Cancer',
    'Rectal Cancer',
    'Renal Cell Carcinoma',
    'Sarcoma',
    'Skin Cancer',
    'Small Cell Lung Cancer',
    'Stomach Cancer',
    'Testicular Cancer',
    'Thyroid Cancer',
    'Uterine Cancer',
    
    // Cardiovascular Conditions
    'Atrial Fibrillation',
    'Cardiac Arrhythmia',
    'Cardiomyopathy',
    'Cardiovascular Disease',
    'Congenital Heart Disease',
    'Coronary Artery Disease',
    'Heart Disease',
    'Heart Failure',
    'Hypertension',
    'Hypotension',
    'Myocardial Infarction',
    'Pericarditis',
    'Pulmonary Embolism',
    'Stroke',
    
    // Neurological Conditions
    "Alzheimer's Disease",
    'Amyotrophic Lateral Sclerosis',
    'Autism Spectrum Disorder',
    'Brain Injury',
    'Cerebral Palsy',
    'Dementia',
    'Epilepsy',
    'Headache',
    "Huntington's Disease",
    'Migraine',
    'Multiple Sclerosis',
    'Neuropathy',
    "Parkinson's Disease",
    'Seizure Disorder',
    'Spinal Cord Injury',
    'Traumatic Brain Injury',
    
    // Mental Health Conditions
    'Alcohol Abuse',
    'Anxiety',
    'Attention Deficit Hyperactivity Disorder',
    'Bipolar Disorder',
    'Depression',
    'Drug Abuse',
    'Eating Disorder',
    'Obsessive Compulsive Disorder',
    'Post Traumatic Stress Disorder',
    'Schizophrenia',
    'Self Harm',
    'Substance Abuse',
    'Suicidal Ideation',
    
    // Endocrine and Metabolic Conditions
    'Adrenal Insufficiency',
    'Diabetes',
    'Diabetes Mellitus Type 1',
    'Diabetes Mellitus Type 2',
    'Diabetic Nephropathy',
    'Diabetic Neuropathy',
    'Diabetic Retinopathy',
    'Gestational Diabetes',
    'Hyperthyroidism',
    'Hypothyroidism',
    'Metabolic Syndrome',
    'Obesity',
    'Osteoporosis',
    'Thyroid Disease',
    
    // Respiratory Conditions
    'Asthma',
    'Chronic Obstructive Pulmonary Disease',
    'Cystic Fibrosis',
    'Emphysema',
    'Idiopathic Pulmonary Fibrosis',
    'Lung Disease',
    'Obstructive Sleep Apnea',
    'Pneumonia',
    'Pulmonary Fibrosis',
    'Pulmonary Hypertension',
    'Respiratory Failure',
    'Sleep Apnea',
    'Tuberculosis',
    
    // Gastrointestinal Conditions
    'Celiac Disease',
    "Crohn's Disease",
    'Gastroesophageal Reflux Disease',
    'Hepatitis',
    'Inflammatory Bowel Disease',
    'Irritable Bowel Syndrome',
    'Liver Disease',
    'Non-alcoholic Fatty Liver Disease',
    'Peptic Ulcer Disease',
    'Ulcerative Colitis',
    
    // Musculoskeletal Conditions
    'Arthritis',
    'Back Pain',
    'Fibromyalgia',
    'Gout',
    'Lupus',
    'Muscular Dystrophy',
    'Myasthenia Gravis',
    'Osteoarthritis',
    'Rheumatoid Arthritis',
    'Scoliosis',
    'Spinal Stenosis',
    
    // Infectious Diseases
    'COVID-19',
    'Hepatitis B',
    'Hepatitis C',
    'AIDS',
    'HIV',
    'Influenza',
    'Malaria',
    'Sepsis',
    'Urinary Tract Infection',
    
    // Kidney and Urological Conditions
    'Benign Prostatic Hyperplasia',
    'Chronic Kidney Disease',
    'Erectile Dysfunction',
    'Kidney Disease',
    'Kidney Failure',
    'Urinary Incontinence',
    
    // Eye Conditions
    'Age-Related Macular Degeneration',
    'Cataracts',
    'Dry Eye Disease',
    'Glaucoma',
    'Macular Degeneration',
    'Retinal Disease',
    
    // Other Conditions
    'Acne',
    'Allergy',
    'Chronic Fatigue Syndrome',
    'Chronic Pain',
    'Dermatitis',
    'Eczema',
    'Endometriosis',
    'Insomnia',
    'Menopause',
    'Migraine',
    'COPD',
    'Pain',
    'Psoriasis',
    'Smoking'
];

// DOM Elements
const userInfoForm = document.getElementById('userInfoForm');
const searchResultsSection = document.getElementById('searchResults');
const resultsContainer = document.getElementById('resultsContainer');
const successMessage = document.getElementById('successMessage');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing new user-first flow...');
    initializeEventListeners();
    initializeFormValidation();
    initializeConditionSuggestions();
    
    // Focus on first input for better UX
    const firstInput = document.getElementById('fullName');
    if (firstInput) {
        firstInput.focus();
    }
    
    console.log('New flow application initialized successfully');
});

// Initialize event listeners
function initializeEventListeners() {
    // Form submission
    if (userInfoForm) {
        userInfoForm.addEventListener('submit', handleUserInfoSubmission);
    }
    
    // Form input validation
    setupFormValidation();
}

// Initialize condition suggestions
function initializeConditionSuggestions() {
    const conditionInput = document.getElementById('condition');
    const suggestionsDiv = document.getElementById('conditionSuggestions');
    
    if (!conditionInput || !suggestionsDiv) return;
    
    conditionInput.addEventListener('input', function() {
        const value = this.value.toLowerCase().trim();
        
        if (value.length < 2) {
            suggestionsDiv.style.display = 'none';
            return;
        }
        
        const matches = comprehensiveConditions.filter(condition => 
            condition.toLowerCase().includes(value)
        );
        
        if (matches.length > 0) {
            suggestionsDiv.innerHTML = matches
                .slice(0, 5) // Show max 5 suggestions
                .map(condition => `<div class="suggestion-item" data-condition="${condition}">${condition}</div>`)
                .join('');
            suggestionsDiv.style.display = 'block';
            
            // Add click handlers to suggestions
            suggestionsDiv.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', function() {
                    conditionInput.value = this.dataset.condition;
                    suggestionsDiv.style.display = 'none';
                });
            });
        } else {
            suggestionsDiv.style.display = 'none';
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!conditionInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
            suggestionsDiv.style.display = 'none';
        }
    });
}

// Handle user information form submission
async function handleUserInfoSubmission(e) {
    e.preventDefault();
    
    // Validate final step
    if (!validateCurrentStep()) {
        return;
    }
    
    // Collect all form data
    const formData = new FormData(userInfoForm);
    userData = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        condition: formData.get('condition'),
        location: formData.get('location'),
        consent: formData.get('consent') === 'on'
    };
    
    // Validate required fields
    const requiredFields = ['fullName', 'email', 'phone', 'condition', 'location'];
    for (const field of requiredFields) {
        if (!userData[field] || userData[field].trim() === '') {
            alert(`Please fill in your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
            return;
        }
    }
    
    if (!userData.consent) {
        alert('Please agree to be contacted regarding clinical trials.');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading-spinner"></span>Registering & Finding Trials...';
    submitBtn.disabled = true;
    
    try {
        // Submit user data and get clinical trials
        const response = await registerAndSearchTrials(userData);
        
        // Display results
        displayPersonalizedResults(response.trials, userData);
        
        // Show success message after a brief delay
        setTimeout(() => {
            showSuccessMessage(response.trials.length);
        }, 600000);
        
    } catch (error) {
        console.error('Error during registration and search:', error);
        alert('Sorry, there was an error processing your request. Please try again.');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Register user and search for clinical trials
async function registerAndSearchTrials(userData) {
    const response = await fetch(`${API_BASE_URL}/register-and-search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process your request');
    }
    
    return await response.json();
}

// Display personalized search results
function displayPersonalizedResults(trials, userData) {
    console.log('Displaying personalized results:', trials.length, 'trials found for', userData.condition);
    
    // Update the condition in the header
    const userConditionSpan = document.getElementById('userCondition');
    if (userConditionSpan) {
        userConditionSpan.textContent = userData.condition;
    }
    
    if (trials.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <h4>No Active Clinical Trials Found</h4>
                <p>We didn't find any currently recruiting clinical trials for <strong>${userData.condition}</strong> in your area right now.</p>
                <p>Don't worry! We've saved your information and will notify you immediately when new trials become available that match your condition and location.</p>
                <div class="no-results-actions">
                    <p><strong>What we'll do:</strong></p>
                    <ul>
                        <li>Monitor for new clinical trials daily</li>
                        <li>Send you email alerts when relevant trials open</li>
                        <li>Connect you with research coordinators</li>
                        <li>Keep your information secure and private</li>
                    </ul>
                </div>
            </div>
        `;
    } else {
        const cardsHtml = trials.map(trial => createPersonalizedTrialCard(trial, userData)).join('');
        resultsContainer.innerHTML = cardsHtml;
    }
    
    // Hide the form and show results
    document.querySelector('.hero').style.display = 'none';
    searchResultsSection.style.display = 'block';
    
    // Smooth scroll to results
    // Scroll removed to prevent blank screen issues
    console.log('Results displayed, not scrolling');
    
    // Store results for potential future use
    window.searchResults = trials;
}

// Create personalized trial card HTML
function createPersonalizedTrialCard(trial, userData) {
    const title = trial.title || 'Clinical Trial';
    const description = trial.description || 'No description available.';
    const location = trial.location || 'Location not specified';
    const nctId = trial.id || '';
    
    // Highlight condition matches in the description
    const highlightedDescription = description.replace(
        new RegExp(userData.condition, 'gi'),
        `<mark>$&</mark>`
    );
    
    let linkSection = '';
    if (nctId && nctId.trim() !== '') {
        const clinicalTrialsUrl = `https://clinicaltrials.gov/study/${nctId}`;
        linkSection = `
            <div class="trial-link">
                <a href="${clinicalTrialsUrl}" target="_blank" rel="noopener noreferrer" class="clinical-trials-link">
                    View Full Details on ClinicalTrials.gov ↗
                </a>
            </div>`;
    }
    
    return `
        <div class="trial-card personalized">
            <div class="trial-badge">Matched for You</div>
            <div class="trial-title">${title}</div>
            <div class="trial-description">${highlightedDescription.substring(0, 300)}${highlightedDescription.length > 300 ? '...' : ''}</div>
            <div class="trial-location">📍 ${location}</div>
            ${nctId ? `<div class="trial-id">Study ID: ${nctId}</div>` : ''}
            <div class="match-info">
                <span class="match-condition">Condition: ${userData.condition}</span>
                <span class="match-location">Your Area: ${userData.location}</span>
            </div>
            ${linkSection}
        </div>`;
}

// Show success message
function showSuccessMessage(trialsCount) {
    console.log('Showing success message after 10 minutes');
    
    const welcomeNameSpan = document.getElementById('welcomeName');
    const trialsFoundSpan = document.getElementById('trialsFound');
    
    if (welcomeNameSpan && userData && userData.fullName) {
        welcomeNameSpan.textContent = userData.fullName.split(' ')[0];
    }
    
    if (trialsFoundSpan) {
        trialsFoundSpan.textContent = trialsCount;
    }
    
    // Simply show the success message - no scrolling, no hiding other elements
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.style.display = 'block';
        console.log('Success message displayed below results');
    }
}

// Form step navigation
function nextStepHandler(step) {
    const currentStepElement = document.getElementById(`step${currentStep}`);
    const nextStepElement = document.getElementById(`step${step}`);
    
    // Validate current step
    if (!validateCurrentStep()) {
        return;
    }
    
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
    const nextInput = nextStepElement.querySelector('input, textarea, input[type="checkbox"]');
    if (nextInput && nextInput.type !== 'checkbox') {
        nextInput.setAttribute('required', 'required');
        nextInput.focus();
    }
    
    // Track form progress
    trackFormStep(step);
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

// Validate current step
function validateCurrentStep() {
    console.log('Validating step:', currentStep);
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
    
    // Special validation for consent checkbox
    if (currentStep === 6) {
        const consent = document.getElementById('consent');
        if (!consent.checked) {
            alert('Please agree to be contacted regarding clinical trials.');
            consent.focus();
            return false;
        }
    }
    
    return true;
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

// Initialize form validation and navigation
function initializeFormValidation() {
    // Remove required attributes from all hidden fields initially
    const allFormInputs = document.querySelectorAll('#userInfoForm input, #userInfoForm textarea');
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
    nextButtons.forEach((button, index) => {
        console.log(`Adding click handler to next button ${index + 1}`);
        button.addEventListener('click', function(e) {
            console.log('Next button clicked!', this.getAttribute('data-next-step'));
            const nextStep = parseInt(this.getAttribute('data-next-step'));
            if (nextStep) {
                console.log('Calling nextStepHandler with step:', nextStep);
                nextStepHandler(nextStep);
            } else {
                console.error('No next step found!');
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

// Analytics tracking (placeholder)
function trackEvent(eventName, eventData) {
    console.log('Analytics event:', eventName, eventData);
    // In a real application, you would send this to your analytics service
}

// Track form steps
function trackFormStep(step) {
    trackEvent('user_info_step_completed', { step: step });
}

// Track successful registration
function trackRegistration(userData) {
    trackEvent('user_registered', { 
        condition: userData.condition,
        location: userData.location 
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

// Expose functions globally for HTML onclick handlers (backward compatibility)
window.nextStep = nextStepHandler;
window.prevStep = prevStepHandler;

console.log('New user-first flow JavaScript loaded successfully');

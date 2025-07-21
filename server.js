const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware - CSP configured for form functionality
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https:"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Explicitly serve JavaScript file with no-cache headers BEFORE static middleware
app.get('/js/app.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    console.log('Serving updated JavaScript file directly');
    res.sendFile(path.join(__dirname, 'js', 'app.js'));
});

// Serve static files with no-cache headers for development
app.use(express.static('.', {
    setHeaders: (res, path) => {
        // Disable caching for development
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
}));


// Email transporter configuration
let transporter = null;

// Only configure email if credentials are provided
if (process.env.EMAIL_USER && process.env.EMAIL_PASS && 
    process.env.EMAIL_USER !== 'your-email@gmail.com' && 
    process.env.EMAIL_PASS !== 'your-app-password') {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    console.log('Email service configured');
} else {
    console.log('Email service not configured - emails will be skipped');
}

// In-memory storage for demo purposes
// In production, use a proper database
const subscribers = [];

// Routes

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve JavaScript file via API route to bypass static file caching
app.get('/api/app-script', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    console.log('Serving JavaScript file via API route');
    res.sendFile(path.join(__dirname, 'js', 'app.js'));
});

// Submit user registration
app.post('/api/register', async (req, res) => {
    try {
        const { fullName, email, phone, address, consent } = req.body;
        
        // Validation
        if (!fullName || !email || !phone || !address || !consent) {
            return res.status(400).json({ 
                error: 'All fields are required' 
            });
        }
        
        // Email validation
        if (!validator.isEmail(email)) {
            return res.status(400).json({ 
                error: 'Invalid email address' 
            });
        }
        
        // Phone validation
        if (!validator.isMobilePhone(phone)) {
            return res.status(400).json({ 
                error: 'Invalid phone number' 
            });
        }
        
        // Check if email already exists
        const existingSubscriber = subscribers.find(sub => sub.email === email);
        if (existingSubscriber) {
            return res.status(409).json({ 
                error: 'Email already registered' 
            });
        }
        
        // Create subscriber record
        const subscriber = {
            id: Date.now().toString(),
            fullName: validator.escape(fullName),
            email: validator.normalizeEmail(email),
            phone: validator.escape(phone),
            address: validator.escape(address),
            consent: consent === true,
            registeredAt: new Date().toISOString(),
            isActive: true
        };
        
        // Save to storage (in production, save to database)
        subscribers.push(subscriber);
        
        // Try to send welcome email (don't fail if email service is not configured)
        try {
            await sendWelcomeEmail(subscriber);
            console.log(`Welcome email sent to ${subscriber.email}`);
        } catch (emailError) {
            console.log(`Welcome email failed for ${subscriber.email}:`, emailError.message);
            // Continue with registration even if email fails
        }
        
        res.status(201).json({ 
            message: 'Registration successful',
            subscriberId: subscriber.id
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
});

// Get subscriber by ID
app.get('/api/subscriber/:id', (req, res) => {
    const subscriber = subscribers.find(sub => sub.id === req.params.id);
    
    if (!subscriber) {
        return res.status(404).json({ error: 'Subscriber not found' });
    }
    
    // Remove sensitive information before sending
    const { email, phone, address, ...publicData } = subscriber;
    res.json(publicData);
});

// Unsubscribe endpoint
app.post('/api/unsubscribe', (req, res) => {
    const { email, token } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    
    const subscriber = subscribers.find(sub => sub.email === email);
    
    if (!subscriber) {
        return res.status(404).json({ error: 'Subscriber not found' });
    }
    
    // In production, verify the unsubscribe token
    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date().toISOString();
    
    res.json({ message: 'Successfully unsubscribed' });
});

// Update subscriber preferences
app.put('/api/subscriber/:id/preferences', (req, res) => {
    const subscriber = subscribers.find(sub => sub.id === req.params.id);
    
    if (!subscriber) {
        return res.status(404).json({ error: 'Subscriber not found' });
    }
    
    // Update preferences
    const { emailFrequency, notifications } = req.body;
    
    subscriber.preferences = {
        emailFrequency: emailFrequency || 'weekly',
        notifications: notifications || ['clinical-trials', 'newsletter']
    };
    
    res.json({ message: 'Preferences updated successfully' });
});

// Send welcome email function
async function sendWelcomeEmail(subscriber) {
    if (!transporter) {
        throw new Error('Email service not configured');
    }
    
    try {
        // Read email template
        const templatePath = path.join(__dirname, 'templates', 'welcome-email.html');
        let emailTemplate = fs.readFileSync(templatePath, 'utf8');
        
        // Replace dynamic variables
        emailTemplate = emailTemplate.replace(/{{USER_NAME}}/g, subscriber.fullName);
        emailTemplate = emailTemplate.replace(/{{USER_EMAIL}}/g, subscriber.email);
        emailTemplate = emailTemplate.replace(/{{PORTAL_URL}}/g, `${process.env.WEBSITE_URL || 'https://clinicalgoto.com'}/portal`);
        emailTemplate = emailTemplate.replace(/{{WEBSITE_URL}}/g, process.env.WEBSITE_URL || 'https://clinicalgoto.com');
        emailTemplate = emailTemplate.replace(/{{UNSUBSCRIBE_URL}}/g, `${process.env.WEBSITE_URL || 'https://clinicalgoto.com'}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`);
        emailTemplate = emailTemplate.replace(/{{PREFERENCES_URL}}/g, `${process.env.WEBSITE_URL || 'https://clinicalgoto.com'}/preferences/${subscriber.id}`);
        emailTemplate = emailTemplate.replace(/{{PRIVACY_URL}}/g, `${process.env.WEBSITE_URL || 'https://clinicalgoto.com'}/privacy`);
        emailTemplate = emailTemplate.replace(/{{FACEBOOK_URL}}/g, 'https://facebook.com/clinicalgoto');
        emailTemplate = emailTemplate.replace(/{{TWITTER_URL}}/g, 'https://twitter.com/clinicalgoto');
        emailTemplate = emailTemplate.replace(/{{LINKEDIN_URL}}/g, 'https://linkedin.com/company/clinicalgoto');
        
        // Email configuration
        const mailOptions = {
            from: {
                name: 'ClinicalGoTo',
                address: process.env.EMAIL_FROM || 'noreply@clinicalgoto.com'
            },
            to: subscriber.email,
            subject: `Welcome to ClinicalGoTo, ${subscriber.fullName}!`,
            html: emailTemplate,
            text: `Welcome to ClinicalGoTo, ${subscriber.fullName}! Thank you for joining our clinical trials network. We'll be in touch when we find clinical trials that match your profile.`
        };
        
        // Send email
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${subscriber.email}`);
        
    } catch (error) {
        console.error('Error sending welcome email:', error);
        throw error;
    }
}

// Clinical trials search proxy (to avoid CORS issues)
app.get('/api/clinical-trials', async (req, res) => {
    try {
        const { location, condition, pageSize = 10 } = req.query;
        
        if (!location) {
            return res.status(400).json({ error: 'Location is required' });
        }
        
        // Build search parameters
        const params = new URLSearchParams({
            'query.locn': location,
            'filter.overallStatus': 'RECRUITING',
            'pageSize': pageSize.toString(),
            'countTotal': 'true'
        });
        
        if (condition) {
            params.append('query.cond', condition);
        }
        
        // Make request to ClinicalTrials.gov API
        const apiUrl = `https://clinicaltrials.gov/api/v2/studies?${params}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform data for frontend
        const transformedData = {
            totalCount: data.totalCount || 0,
            studies: (data.studies || []).map(study => {
                const nctId = study.protocolSection?.identificationModule?.nctId;
                const locationData = study.protocolSection?.contactsLocationsModule?.locations?.[0];
                return {
                    id: nctId,
                    title: study.protocolSection?.identificationModule?.briefTitle || 'Untitled Study',
                    description: study.protocolSection?.descriptionModule?.briefSummary || 'No description available.',
                    location: locationData?.facility?.name || locationData?.city || 'Location not specified',
                    status: study.protocolSection?.statusModule?.overallStatus,
                    phase: study.protocolSection?.designModule?.phases?.[0],
                    condition: study.protocolSection?.conditionsModule?.conditions?.[0]
                };
            })
        };
        
        res.json(transformedData);
        
    } catch (error) {
        console.error('Clinical trials search error:', error);
        res.status(500).json({ error: 'Failed to search clinical trials' });
    }
});

// Admin endpoints (protected in production)
app.get('/api/admin/subscribers', (req, res) => {
    // In production, add authentication middleware
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedSubscribers = subscribers
        .slice(startIndex, endIndex)
        .map(({ email, phone, address, ...publicData }) => publicData);
    
    res.json({
        subscribers: paginatedSubscribers,
        totalCount: subscribers.length,
        page,
        totalPages: Math.ceil(subscribers.length / limit)
    });
});


// Explicitly serve service worker
app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'sw.js'));
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`ClinicalGoTo server running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
});

module.exports = app;

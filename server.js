const database = require("./database");
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { logVisitor } = require('./utils/logger');

// Load environment variables
require('dotenv').config();

const app = express();

// Trust proxy for rate limiting and proper session handling
app.set('trust proxy', 1);
// Use port 3001 by default to avoid conflicts with Docker
const PORT = process.env.PORT || 3001;

// Session configuration - using memory store and session-friendly settings
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to false for development
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax'
    }
}));

// Admin credentials
const ADMIN_CREDENTIALS = {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123'
};

// Hash admin password
let hashedAdminPassword;
(async () => {
    hashedAdminPassword = await bcrypt.hash(ADMIN_CREDENTIALS.password, 10);
    console.log('Admin credentials initialized');
})();

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session && req.session.isAuthenticated) {
        return next();
    } else {
        if (req.accepts('html')) {
            return res.redirect('/admin-login');
        }
        return res.status(401).json({ 
            success: false, 
            error: 'Authentication required'
        });
    }
};

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://clinicaltrials.gov"]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    credentials: true
}));

// Body parsing middleware
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

// Serve static files with session-friendly caching
app.use(express.static('.'  , {
    setHeaders: (res, filePath) => {
        // Only disable caching for JS/CSS files, allow caching for HTML
        if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
            res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        } else {
            // Allow reasonable caching for HTML files to maintain sessions
            res.setHeader('Cache-Control', 'private, max-age=300');
        }
    }
}));

// Email configuration
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
    console.log('Email service configured');
} else {
    console.log('Email service not configured - emails will be skipped');
}

// SQLite database storage

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

// Email sending function
async function sendWelcomeEmail(subscriber) {
    if (!transporter) {
        throw new Error('Email service not configured');
    }

    const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@clinicalgoto.com',
        to: subscriber.email,
        subject: 'Welcome to ClinicalGoTo - Your Clinical Trial Journey Begins',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 2rem;">🏥 Welcome to ClinicalGoTo</h1>
                    <p style="color: white; margin: 10px 0 0 0; font-size: 1.1rem; opacity: 0.9;">Your Gateway to Clinical Research</p>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                    <h2 style="color: #2c3e50; margin-top: 0;">Hello ${subscriber.fullName}! 👋</h2>
                    
                    <p style="color: #555; line-height: 1.6; font-size: 1rem;">
                        Thank you for registering with ClinicalGoTo! We're excited to help you discover clinical trial opportunities that match your needs.
                    </p>
                    
                    <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3498db;">
                        <h3 style="color: #2c3e50; margin-top: 0;">📋 Your Registration Details:</h3>
                        <ul style="color: #555; line-height: 1.8;">
                            <li><strong>Name:</strong> ${subscriber.fullName}</li>
                            <li><strong>Email:</strong> ${subscriber.email}</li>
                            <li><strong>Phone:</strong> ${subscriber.phone}</li>
                            ${subscriber.address ? `<li><strong>Address:</strong> ${subscriber.address}</li>` : ''}
                            ${subscriber.condition ? `<li><strong>Condition:</strong> ${subscriber.condition}</li>` : ''}
                            ${subscriber.location ? `<li><strong>Location:</strong> ${subscriber.location}</li>` : ''}
                        </ul>
                    </div>
                    
                    <h3 style="color: #2c3e50;">🔍 What Happens Next?</h3>
                    <ol style="color: #555; line-height: 1.8;">
                        <li><strong>Personalized Matching:</strong> Our system will continuously search for clinical trials that match your criteria</li>
                        <li><strong>Regular Updates:</strong> You'll receive notifications when new relevant trials become available</li>
                        <li><strong>Expert Support:</strong> Our team is here to help you understand your options and navigate the process</li>
                    </ol>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <h3 style="color: #2c3e50; margin-top: 0;">🌟 Important Reminder</h3>
                        <p style="color: #666; margin-bottom: 0; font-style: italic;">
                            Always consult with your healthcare provider before considering participation in any clinical trial. 
                            They can help you understand if a particular study is right for your specific situation.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://clinicalgoto.com" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                            🏠 Visit Our Portal
                        </a>
                    </div>
                    
                    <hr style="border: none; height: 1px; background: #eee; margin: 30px 0;">
                    
                    <p style="color: #888; font-size: 0.9rem; text-align: center; margin: 0;">
                        Questions? Contact our support team at <a href="mailto:support@clinicalgoto.com" style="color: #3498db;">support@clinicalgoto.com</a>
                        <br><br>
                        <em>ClinicalGoTo - Connecting Patients with Clinical Research Opportunities</em>
                    </p>
                </div>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
}

// Registration endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { fullName, email, phone, address, consent, condition, location } = req.body;

        // Input validation
        if (!fullName || !email || !phone) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: fullName, email, and phone are required'
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }

        // Check if user already exists
        const existingUser = await database.getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        // Create subscriber object with all required fields
        const subscriber = {
            fullName: validator.escape(fullName),
            email: validator.normalizeEmail(email),
            phone: validator.escape(phone),
            condition: condition ? validator.escape(condition) : 'Not specified',
            location: location ? validator.escape(location) : (address ? validator.escape(address) : 'Not specified'),
            consent: consent === true,
            registeredAt: new Date().toISOString(),
            isActive: true
        };
        
        // Save to SQLite database
        const savedUser = await database.addUser(subscriber);
        
        // Log visitor information with all available data
        logVisitor(req, {
            fullName: subscriber.fullName,
            email: subscriber.email,
            phone: subscriber.phone,
            condition: subscriber.condition || '',
            location: subscriber.location || subscriber.address || '',
            consent: subscriber.consent || false
        });
        
        // Try to send welcome email (don't fail if email service is not configured)
        try {
            await sendWelcomeEmail(subscriber);
            console.log(`Welcome email sent to ${subscriber.email}`);
        } catch (emailError) {
            console.log(`Welcome email failed for ${subscriber.email}:`, emailError.message);
            // Continue with registration even if email fails
        }
        
        console.log(`New registration: ${subscriber.email}`);
        
        res.json({
            success: true,
            message: 'Registration successful! Welcome email sent if email service is configured.',
            subscriber: {
                fullName: subscriber.fullName,
                email: subscriber.email,
                registeredAt: subscriber.registeredAt
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed. Please try again.'
        });
    }
});

// Combined registration and search endpoint
app.post('/api/register-and-search', async (req, res) => {
    try {
        const { fullName, email, phone, condition, location, consent } = req.body;

        // Input validation
        const requiredFields = ['fullName', 'email', 'phone', 'condition', 'location'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }

        // Create subscriber object
        const subscriber = {
            fullName: validator.escape(fullName),
            email: validator.normalizeEmail(email),
            phone: validator.escape(phone),
            location: validator.escape(location),
            condition: validator.escape(condition),
            consent: consent === true,
            registeredAt: new Date().toISOString(),
            isActive: true
        };
        
        // Save to SQLite database
        const savedUser = await database.addUser(subscriber);
        
        // Log visitor information with all available data
        logVisitor(req, {
            fullName: subscriber.fullName,
            email: subscriber.email,
            phone: subscriber.phone,
            condition: subscriber.condition || '',
            location: subscriber.location || subscriber.address || '',
            consent: subscriber.consent || false
        });
        
        // Try to send welcome email (don't fail if email service is not configured)
        try {
            await sendWelcomeEmail(subscriber);
            console.log(`Welcome email sent to ${subscriber.email}`);
        } catch (emailError) {
            console.log(`Welcome email failed for ${subscriber.email}:`, emailError.message);
            // Continue with registration even if email fails
        }

        // Simulate clinical trial search (replace with actual API call)
        const mockTrials = [
            {
                id: "NCT12345678",
                title: `Clinical Trial for ${condition}`,
                status: "Recruiting",
                location: location,
                description: `A study investigating new treatments for ${condition} in ${location}.`,
                eligibility: "Adults 18-65 years old",
                contact: "research@example.com"
            },
            {
                id: "NCT87654321", 
                title: `Advanced Treatment Study - ${condition}`,
                status: "Recruiting",
                location: location,
                description: `Phase II clinical trial examining innovative approaches to ${condition} treatment.`,
                eligibility: "Adults with confirmed diagnosis",
                contact: "trials@example.com"
            }
        ];

        console.log(`Registration and search completed for: ${subscriber.email}`);
        
        res.json({
            success: true,
            message: 'Registration successful! Clinical trials found.',
            subscriber: {
                fullName: subscriber.fullName,
                email: subscriber.email,
                condition: subscriber.condition,
                location: subscriber.location,
                registeredAt: subscriber.registeredAt  
            },
            trials: mockTrials
        });
        
    } catch (error) {
        console.error('Registration and search error:', error);
        
        // If it's a database constraint error (duplicate email)
        if (error.message && error.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({
                success: false,
                error: 'An account with this email already exists.'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Registration failed. Please try again.'
        });
    }
});

// Explicitly serve service worker
app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'sw.js'));
});

// Authentication routes
app.get('/admin-login', (req, res) => {
    if (req.session && req.session.isAuthenticated) {
        return res.redirect('/admin');
    }
    res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }
        
        if (username === ADMIN_CREDENTIALS.username) {
            const passwordMatch = await bcrypt.compare(password, hashedAdminPassword);
            
            if (passwordMatch) {
                req.session.isAuthenticated = true;
                req.session.username = username;
                
                console.log(`Admin login successful for user: ${username}`);
                
                return res.json({
                    success: true,
                    message: 'Login successful',
                    sessionVerified: true
                });
            }
        }
        
        console.log(`Failed login attempt for username: ${username}`);
        return res.status(401).json({
            success: false,
            error: 'Invalid username or password'
        });
        
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

app.post('/api/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({
                success: false,
                error: 'Logout failed'
            });
        }
        
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    });
});

// Admin endpoints
app.get("/admin", requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "admin.html"));
});

// Get all users for admin
app.get("/api/admin/users", requireAuth, async (req, res) => {
    try {
        const users = await database.getAllUsers();
        console.log(`Admin: Fetching ${users.length} user records`);
        res.json({
            success: true,
            users: users,
            total: users.length
        });
    } catch (error) {
        console.error("Error fetching admin users:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch users",
            users: [],
            total: 0
        });
    }
});

// Delete user record
app.post("/api/admin/users/delete", requireAuth, async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                error: "Email is required"
            });
        }

        await database.deleteUser(email);
        const remainingUsers = await database.getAllUsers();
        
        console.log(`Admin: Deleted user with email ${email}. Users remaining: ${remainingUsers.length}`);
        
        res.json({
            success: true,
            message: "User deleted successfully",
            remainingUsers: remainingUsers.length
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        if (error.message === "User not found") {
            res.status(404).json({
                success: false,
                error: "User not found"
            });
        } else {
            res.status(500).json({
                success: false,
                error: "Failed to delete user"
            });
        }
    }
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

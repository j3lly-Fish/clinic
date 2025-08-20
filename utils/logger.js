const fs = require('fs');
const path = require('path');

// Store logs in the application's root directory
const LOGS_DIR = __dirname + '/../logs';
const VISITOR_LOG_FILE = __dirname + '/../visitors.csv';

// For debugging
console.log('Log file will be created at:', VISITOR_LOG_FILE);

// Ensure logs directory exists with proper permissions
const ensureLogsDir = () => {
    try {
        if (!fs.existsSync(LOGS_DIR)) {
            fs.mkdirSync(LOGS_DIR, { 
                recursive: true,
                mode: 0o755 // rwxr-xr-x
            });
            console.log(`Created logs directory at: ${LOGS_DIR}`);
        }
    } catch (error) {
        console.error('Error creating logs directory:', error);
        throw error;
    }
};

// Initialize logs directory
ensureLogsDir();

// Initialize CSV file with headers if it doesn't exist
const initVisitorLog = () => {
    try {
        if (!fs.existsSync(VISITOR_LOG_FILE)) {
            const headers = [
                'timestamp',
                'ip',
                'userAgent',
                'fullName',
                'email',
                'phone',
                'condition',
                'location',
                'consent'
            ].join(',');
            
            fs.writeFileSync(VISITOR_LOG_FILE, headers + '\n', { mode: 0o644 });
            console.log(`Created new log file at: ${VISITOR_LOG_FILE}`);
        }
    } catch (error) {
        console.error('Error initializing log file:', error);
        throw error;
    }
};

// Log visitor data to CSV
const logVisitor = (req, userData = {}) => {
    try {
        // Ensure logs directory exists
        ensureLogsDir();
        
        // Initialize log file if it doesn't exist
        if (!fs.existsSync(VISITOR_LOG_FILE)) {
            initVisitorLog();
        }

        const timestamp = new Date().toISOString();
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        
        const logEntry = [
            `"${timestamp}"`,
            `"${ip}"`,
            `"${userAgent}"`,
            `"${userData.fullName || ''}"`,
            `"${userData.email || ''}"`,
            `"${userData.phone || ''}"`,
            `"${userData.condition || ''}"`,
            `"${userData.location || ''}"`,
            `"${userData.consent || false}"`
        ].join(',');

        // Append to the CSV file with proper error handling
        try {
            fs.appendFileSync(VISITOR_LOG_FILE, logEntry + '\n', { mode: 0o644 });
            console.log(`Logged visitor: ${userData.email || 'unknown'}`);
            return true;
        } catch (writeError) {
            console.error('Error writing to log file:', writeError);
            return false;
        }
    } catch (error) {
        console.error('Error logging visitor:', error);
        return false;
    }
};

module.exports = {
    logVisitor,
    VISITOR_LOG_FILE
};

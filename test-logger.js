const { logVisitor } = require('./utils/logger');
const express = require('express');
const app = express();

// Test visitor data
const testVisitor = {
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '123-456-7890',
    condition: 'Test Condition',
    location: 'Test Location',
    consent: true
};

// Mock request object
const mockRequest = {
    ip: '127.0.0.1',
    headers: {
        'user-agent': 'Test User Agent'
    },
    connection: {
        remoteAddress: '127.0.0.1'
    }
};

// Test the logger
console.log('Testing visitor logging...');
const result = logVisitor(mockRequest, testVisitor);

if (result) {
    console.log('✅ Visitor logged successfully!');    
    console.log(`Check the logs directory for visitor data.`);
} else {
    console.error('❌ Failed to log visitor');
}

// Exit the process
process.exit(0);

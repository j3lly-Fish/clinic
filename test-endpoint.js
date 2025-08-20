const http = require('http');

// Test registration data
const postData = JSON.stringify({
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '123-456-7890',
    condition: 'Test Condition',
    location: 'Test Location',
    consent: true
});

// Options for the HTTP request
const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

// Make the request
const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('Response:', data);
        
        // Check if the log file was created
        const fs = require('fs');
        const logFile = __dirname + '/visitors.csv';
        
        if (fs.existsSync(logFile)) {
            const logContent = fs.readFileSync(logFile, 'utf8');
            console.log('\nVisitor log content:');
            console.log(logContent);
            
            if (logContent.includes('test@example.com')) {
                console.log('✅ Test user found in visitor log');
            } else {
                console.log('❌ Test user not found in visitor log');
            }
        } else {
            console.log('❌ Visitor log file not found');
        }
    });
});

req.on('error', (error) => {
    console.error('Request error:', error);
});

// Send the request
req.write(postData);
req.end();

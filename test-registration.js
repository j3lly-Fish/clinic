const request = require('supertest');
const app = require('./server');

// Test registration data
const testUser = {
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '123-456-7890',
    condition: 'Test Condition',
    location: 'Test Location',
    consent: true
};

// Test the registration endpoint
describe('Registration Endpoint', () => {
    it('should register a new user and log visitor data', async () => {
        const response = await request(app)
            .post('/api/register')
            .send(testUser)
            .expect('Content-Type', /json/)
            .expect(200);

        console.log('Registration response:', response.body);
        
        // Check if the visitor log was created
        const fs = require('fs');
        const logFile = __dirname + '/visitors.csv';
        
        if (fs.existsSync(logFile)) {
            const logContent = fs.readFileSync(logFile, 'utf8');
            console.log('Visitor log content:');
            console.log(logContent);
            
            // Check if the test user is in the log
            if (logContent.includes(testUser.email)) {
                console.log('✅ Visitor log contains test user');
            } else {
                console.log('❌ Visitor log does not contain test user');
            }
        } else {
            console.log('❌ Visitor log file not found');
        }
    });

    // Clean up
    afterAll(() => {
        // Close any open connections
        if (app && app.close) {
            app.close();
        }
    });
});

// Exit the process when done
process.on('exit', () => process.exit(0));

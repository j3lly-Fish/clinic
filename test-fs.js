const fs = require('fs');
const path = require('path');

const testFilePath = path.join(__dirname, 'test-write.txt');

// Test 1: Basic file write
try {
    console.log('Testing basic file write...');
    fs.writeFileSync(testFilePath, 'Test content', 'utf8');
    console.log('✅ Successfully wrote to file');
    
    // Test 2: Read the file
    console.log('\nTesting file read...');
    const content = fs.readFileSync(testFilePath, 'utf8');
    console.log('✅ Successfully read file. Content:', content);
    
    // Test 3: Delete the file
    console.log('\nTesting file deletion...');
    fs.unlinkSync(testFilePath);
    console.log('✅ Successfully deleted file');
    
    // Test 4: Create logs directory and file
    console.log('\nTesting logs directory...');
    const logsDir = path.join(__dirname, 'test-logs');
    const logFile = path.join(logsDir, 'test.log');
    
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true, mode: 0o755 });
        console.log('✅ Created logs directory');
    }
    
    fs.writeFileSync(logFile, 'Test log entry\n', { mode: 0o644, flag: 'a' });
    console.log('✅ Successfully wrote to log file');
    
    // Clean up
    fs.unlinkSync(logFile);
    fs.rmdirSync(logsDir);
    console.log('✅ Cleaned up test files');
    
} catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Error details:', error);
}

// Exit the process
process.exit(0);

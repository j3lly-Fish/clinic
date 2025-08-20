const fs = require('fs');
const path = require('path');

console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('\nChecking directory structure:');

const checkDir = (dirPath) => {
    try {
        const stats = fs.statSync(dirPath);
        console.log(`✅ ${dirPath} exists (${stats.isDirectory() ? 'directory' : 'file'})`);
        console.log(`   Permissions: ${stats.mode.toString(8).slice(-3)}`);
        console.log(`   Owner: ${stats.uid}`);
        console.log(`   Group: ${stats.gid}`);
        return true;
    } catch (error) {
        console.error(`❌ ${dirPath}: ${error.message}`);
        return false;
    }
};

// Check important directories
const dirsToCheck = [
    '/home',
    '/home/clinic',
    '/home/clinic/logs',
    '/home/clinic/utils'
];

dirsToCheck.forEach(dir => checkDir(dir));

// Try to create and write to a test file
console.log('\nTesting file operations:');
const testFile = '/home/clinic/logs/test-write.txt';

try {
    fs.writeFileSync(testFile, 'test', 'utf8');
    console.log(`✅ Successfully wrote to ${testFile}`);
    
    const content = fs.readFileSync(testFile, 'utf8');
    console.log(`✅ Successfully read from ${testFile}: ${content}`);
    
    fs.unlinkSync(testFile);
    console.log(`✅ Successfully deleted ${testFile}`);
} catch (error) {
    console.error(`❌ File operation failed: ${error.message}`);
}

process.exit(0);

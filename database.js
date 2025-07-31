const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path - will be created if it doesn't exist
const DB_PATH = path.join(__dirname, 'data', 'clinic.db');

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

class Database {
    constructor() {
        this.db = null;
        this.init();
    }

    init() {
        this.db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
            } else {
                console.log('Connected to SQLite database at:', DB_PATH);
                this.createTables();
            }
        });
    }

    createTables() {
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fullName TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phone TEXT NOT NULL,
                condition TEXT NOT NULL,
                location TEXT NOT NULL,
                consent BOOLEAN NOT NULL DEFAULT 0,
                registeredAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                isActive BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        this.db.run(createUsersTable, (err) => {
            if (err) {
                console.error('Error creating users table:', err.message);
            } else {
                console.log('Users table ready');
            }
        });
    }

    // Add a new user
    addUser(userData) {
        return new Promise((resolve, reject) => {
            const {
                fullName,
                email,
                phone,
                condition,
                location,
                consent
            } = userData;

            const query = `
                INSERT INTO users (fullName, email, phone, condition, location, consent, registeredAt)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                fullName,
                email,
                phone,
                condition,
                location,
                consent ? 1 : 0,
                new Date().toISOString()
            ];

            this.db.run(query, values, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        ...userData,
                        registeredAt: values[6],
                        isActive: true
                    });
                }
            });
        });
    }

    // Get all users
    getAllUsers() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM users 
                WHERE isActive = 1 
                ORDER BY registeredAt DESC
            `;

            this.db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    // Convert boolean fields back from integers
                    const users = rows.map(row => ({
                        ...row,
                        consent: row.consent === 1,
                        isActive: row.isActive === 1
                    }));
                    resolve(users);
                }
            });
        });
    }

    // Delete a user by email
    deleteUser(email) {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE users 
                SET isActive = 0, updated_at = CURRENT_TIMESTAMP 
                WHERE email = ? AND isActive = 1
            `;

            this.db.run(query, [email], function(err) {
                if (err) {
                    reject(err);
                } else if (this.changes === 0) {
                    reject(new Error('User not found'));
                } else {
                    resolve({ deleted: true, email });
                }
            });
        });
    }

    // Get user by email
    getUserByEmail(email) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM users 
                WHERE email = ? AND isActive = 1
            `;

            this.db.get(query, [email], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    resolve({
                        ...row,
                        consent: row.consent === 1,
                        isActive: row.isActive === 1
                    });
                } else {
                    resolve(null);
                }
            });
        });
    }

    // Get user statistics
    getStats() {
        return new Promise((resolve, reject) => {
            const queries = {
                total: "SELECT COUNT(*) as count FROM users WHERE isActive = 1",
                recent: `SELECT COUNT(*) as count FROM users 
                        WHERE isActive = 1 AND registeredAt >= datetime('now', '-7 days')`,
                consented: "SELECT COUNT(*) as count FROM users WHERE isActive = 1 AND consent = 1"
            };

            Promise.all([
                new Promise((res, rej) => {
                    this.db.get(queries.total, [], (err, row) => {
                        if (err) rej(err);
                        else res(row.count);
                    });
                }),
                new Promise((res, rej) => {
                    this.db.get(queries.recent, [], (err, row) => {
                        if (err) rej(err);
                        else res(row.count);
                    });
                }),
                new Promise((res, rej) => {
                    this.db.get(queries.consented, [], (err, row) => {
                        if (err) rej(err);
                        else res(row.count);
                    });
                })
            ]).then(([total, recent, consented]) => {
                resolve({ total, recent, consented });
            }).catch(reject);
        });
    }

    // Close database connection
    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                } else {
                    console.log('Database connection closed');
                }
            });
        }
    }
}

// Create and export database instance
const database = new Database();

// Graceful shutdown
process.on('SIGINT', () => {
    database.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    database.close();
    process.exit(0);
});

module.exports = database;

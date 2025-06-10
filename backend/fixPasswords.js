// fixPasswords.js

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Database configuration from your .env file
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

async function fixUserPasswords() {
    let connection;
    try {
        console.log('Connecting to the database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connection successful!');

        // 1. Get all users
        const [users] = await connection.query('SELECT id, password FROM users');
        console.log(`Found ${users.length} users. Checking passwords...`);

        // 2. Loop through each user to check their password
        for (const user of users) {
            // A bcrypt hash always starts with '$2a$', '$2b$', or '$2y$'.
            // If the password does NOT start with this, it's plain text.
            if (user.password && !user.password.startsWith('$2')) {
                console.log(`\nFound plain-text password for user ID: ${user.id}.`);
                console.log(`Original password: ${user.password}`);

                // 3. Hash the plain-text password
                const hashedPassword = await bcrypt.hash(user.password, 10);
                console.log(`Hashed password: ${hashedPassword}`);

                // 4. Update the user in the database with the new hashed password
                await connection.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
                console.log(`✅ User ID ${user.id} has been updated securely.`);
            }
        }

        console.log('\nPassword check complete. All passwords should now be secure.');

    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed.');
        }
    }
}

// Run the function
fixUserPasswords();
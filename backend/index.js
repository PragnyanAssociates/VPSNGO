// This is the main server file for your backend.

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// --- API ROUTES ---

// Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Error: Invalid username or password.' });
        }
        const { password: _, ...userData } = user;
        res.status(200).json({ message: 'Login successful!', user: userData });
    } catch (error) {
        res.status(500).json({ message: 'Error: Database connection failed.' });
    }
});

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, username, full_name, role, class_group FROM users');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error: Could not get users.' });
    }
});

// Create a new user
app.post('/api/users', async (req, res) => {
    const { username, password, full_name, role, class_group } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (username, password, full_name, role, class_group) VALUES (?, ?, ?, ?, ?)', [username, hashedPassword, full_name, role, class_group]);
        res.status(201).json({ message: 'User created successfully!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Error: This username already exists.' });
        }
        res.status(500).json({ message: 'Error: Could not create user.' });
    }
});

// Delete a user
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error: Could not delete user.' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Backend server is running on http://localhost:${PORT}`);
});
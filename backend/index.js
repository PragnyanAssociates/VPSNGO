// 📂 File: index.js (Backend - FINAL CORRECTED VERSION)

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer configuration (Unchanged)
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => {
        cb(null, `profile-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage });

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// ==========================================================
// --- USER API ROUTES (Unchanged) ---
// ==========================================================
app.post('/api/login', async (req, res) => { const { username, password } = req.body; try { const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]); const user = rows[0]; if (!user || !(await bcrypt.compare(password, user.password))) { return res.status(401).json({ message: 'Error: Invalid username or password.' }); } const { password: _, ...userData } = user; res.status(200).json({ message: 'Login successful!', user: userData }); } catch (error) { res.status(500).json({ message: 'Error: Database connection failed.' }); }});
app.get('/api/users', async (req, res) => { try { const [rows] = await db.query('SELECT id, username, full_name, role, class_group FROM users'); res.status(200).json(rows); } catch (error) { res.status(500).json({ message: 'Error: Could not get users.' }); }});
app.post('/api/users', async (req, res) => { const { username, password, full_name, role, class_group } = req.body; try { const hashedPassword = await bcrypt.hash(password, 10); await db.query('INSERT INTO users (username, password, full_name, role, class_group) VALUES (?, ?, ?, ?, ?)', [username, hashedPassword, full_name, role, class_group]); res.status(201).json({ message: 'User created successfully!' }); } catch (error) { if (error.code === 'ER_DUP_ENTRY') { return res.status(409).json({ message: 'Error: This username already exists.' }); } res.status(500).json({ message: 'Error: Could not create user.' }); }});
app.put('/api/users/:id', async (req, res) => { const { id } = req.params; const { username, password, full_name, role, class_group } = req.body; try { let query; let queryParams; if (password && password.trim() !== '') { const hashedPassword = await bcrypt.hash(password, 10); query = 'UPDATE users SET username = ?, password = ?, full_name = ?, role = ?, class_group = ? WHERE id = ?'; queryParams = [username, hashedPassword, full_name, role, class_group, id]; } else { query = 'UPDATE users SET username = ?, full_name = ?, role = ?, class_group = ? WHERE id = ?'; queryParams = [username, full_name, role, class_group, id]; } const [result] = await db.query(query, queryParams); if (result.affectedRows === 0) { return res.status(404).json({ message: 'Error: User not found.' }); } res.status(200).json({ message: 'User updated successfully!' }); } catch (error) { if (error.code === 'ER_DUP_ENTRY') { return res.status(409).json({ message: 'Error: This username is already taken.' }); } res.status(500).json({ message: 'Error: Could not update user.' }); }});
app.patch('/api/users/:id/reset-password', async (req, res) => { const { id } = req.params; const { newPassword } = req.body; if (!newPassword || newPassword.trim() === '') { return res.status(400).json({ message: 'Error: New password cannot be empty.' }); } try { const hashedPassword = await bcrypt.hash(newPassword, 10); const [result] = await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]); if (result.affectedRows === 0) { return res.status(404).json({ message: 'Error: User not found.' }); } res.status(200).json({ message: 'Password has been reset successfully!' }); } catch (error) { console.error('Error resetting password:', error); res.status(500).json({ message: 'Error: Could not reset password.' }); }});
app.delete('/api/users/:id', async (req, res) => { const { id } = req.params; try { await db.query('DELETE FROM users WHERE id = ?', [id]); res.status(200).json({ message: 'User deleted successfully.' }); } catch (error) { res.status(500).json({ message: 'Error: Could not delete user.' }); }});


// ==========================================================
// --- CALENDAR API ROUTES (Unchanged) ---
// ==========================================================
app.get('/api/calendar', async (req, res) => { try { const [rows] = await db.query('SELECT *, DATE_FORMAT(event_date, "%Y-%m-%d") AS event_date FROM calendar_events ORDER BY event_date ASC, time ASC'); const groupedEvents = rows.reduce((acc, event) => { const dateKey = event.event_date; if (!acc[dateKey]) { acc[dateKey] = []; } acc[dateKey].push(event); return acc; }, {}); res.status(200).json(groupedEvents); } catch (error) { console.error(error); res.status(500).json({ message: 'Error: Could not get calendar events.' }); }});
app.post('/api/calendar', async (req, res) => { const { event_date, name, type, time, description } = req.body; try { await db.query('INSERT INTO calendar_events (event_date, name, type, time, description) VALUES (?, ?, ?, ?, ?)', [event_date, name, type, time, description]); res.status(201).json({ message: 'Event created successfully!' }); } catch (error) { console.error(error); res.status(500).json({ message: 'Error: Could not create event.' }); }});
app.put('/api/calendar/:id', async (req, res) => { const { id } = req.params; const { event_date, name, type, time, description } = req.body; try { const [result] = await db.query('UPDATE calendar_events SET event_date = ?, name = ?, type = ?, time = ?, description = ? WHERE id = ?', [event_date, name, type, time, description, id]); if (result.affectedRows === 0) { return res.status(404).json({ message: 'Event not found.' }); } res.status(200).json({ message: 'Event updated successfully!' }); } catch (error) { console.error(error); res.status(500).json({ message: 'Error: Could not update event.' }); }});
app.delete('/api/calendar/:id', async (req, res) => { const { id } = req.params; try { const [result] = await db.query('DELETE FROM calendar_events WHERE id = ?', [id]); if (result.affectedRows === 0) { return res.status(404).json({ message: 'Event not found.' }); } res.status(200).json({ message: 'Event deleted successfully.' }); } catch (error) { console.error(error); res.status(500).json({ message: 'Error: Could not delete event.' }); }});


// ==========================================================
// ✅ START: USER PROFILE API (UPDATED FOR NEW EMAIL COLUMN)
// ==========================================================

// GET a user's full profile by JOINING the two tables
app.get('/api/profiles/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        // This query now fetches `email` from `user_profiles` (p)
        const sql = `
            SELECT 
                u.id, u.username, u.full_name, u.role, u.class_group,
                p.email, p.dob, p.gender, p.phone, p.address, p.profile_image_url, p.admission_date, p.roll_no
            FROM 
                users u 
            LEFT JOIN 
                user_profiles p ON u.id = p.user_id 
            WHERE 
                u.id = ?
        `;
        const [rows] = await db.query(sql, [userId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error("GET Profile Error:", error);
        res.status(500).json({ message: 'Database error fetching profile' });
    }
});

// PUT (Update) a user's profile, correctly updating both tables
app.put('/api/profiles/:userId', upload.single('profileImage'), async (req, res) => {
    try {
        const { userId } = req.params;
        // Data for the 'users' table (no email here)
        const { full_name, class_group } = req.body;
        // Data for the 'user_profiles' table (email is now here)
        const { email, dob, gender, phone, address, admission_date, roll_no } = req.body;
        
        // 1. Get existing profile image URL
        const [profile] = await db.query('SELECT profile_image_url FROM user_profiles WHERE user_id = ?', [userId]);
        let profile_image_url = profile.length > 0 ? profile[0].profile_image_url : null;
        
        if (req.file) {
            profile_image_url = `/uploads/${req.file.filename}`;
        }

        // 2. Update the 'users' table with the fields that belong to it
        await db.query(
            'UPDATE users SET full_name = ?, class_group = ? WHERE id = ?',
            [full_name, class_group, userId]
        );
        
        // 3. Use INSERT...ON DUPLICATE KEY UPDATE for the `user_profiles` table
        // This query now correctly includes `email`.
        const profileSql = `
            INSERT INTO user_profiles (user_id, email, dob, gender, phone, address, profile_image_url, admission_date, roll_no) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
             email=VALUES(email), dob=VALUES(dob), gender=VALUES(gender), phone=VALUES(phone), address=VALUES(address), 
             profile_image_url=VALUES(profile_image_url), admission_date=VALUES(admission_date), roll_no=VALUES(roll_no)
        `;
        const profileParams = [userId, email, dob || null, gender, phone, address, profile_image_url, admission_date || null, roll_no];
        
        await db.query(profileSql, profileParams);
        
        res.json({ message: 'Profile updated successfully!', profile_image_url: profile_image_url });

    } catch (error) {
        console.error("PUT Profile Error:", error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});
// ==========================================================
// ✅ END: USER PROFILE API
// ==========================================================


// Start the server
app.listen(PORT, () => {
    console.log(`✅ Backend server is running on http://localhost:${PORT}`);
});
// 📂 File: server.js (CORRECTED & FINAL)

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken'); // 👈 ADD THIS LINE
const path = require('path');
// ... after const path = require('path');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('./mailer');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    database: process.env.DB_NAME || 'school_db',
    
});

// 📂 File: backend/server.js (Replace all user, profile, and password reset routes with this block)

// ==========================================================
// --- USER, PROFILE & PASSWORD API ROUTES ---
// ==========================================================

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Error: Invalid username or password.' });
        }
        if (user.subjects_taught && typeof user.subjects_taught === 'string') {
            try { user.subjects_taught = JSON.parse(user.subjects_taught); } 
            catch (e) { user.subjects_taught = []; }
        }
        const { password: _, ...userData } = user;
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'YOUR_SUPER_SECRET_KEY', { expiresIn: '24h' });
        res.status(200).json({ message: 'Login successful!', user: userData, token: token });
    } catch (error) { res.status(500).json({ message: 'Error: Database connection failed.' }); }
});

app.get('/api/users', async (req, res) => {
    try {
        const query = `
            SELECT u.id, u.username, u.full_name, u.role, u.class_group, u.subjects_taught, p.email, p.phone, p.address 
            FROM users u LEFT JOIN user_profiles p ON u.id = p.user_id`;
        const [rows] = await db.query(query);
        const usersWithParsedSubjects = rows.map(user => {
            if (user.subjects_taught && typeof user.subjects_taught === 'string') {
                try { user.subjects_taught = JSON.parse(user.subjects_taught); } catch (e) { user.subjects_taught = []; }
            }
            return user;
        });
        res.status(200).json(usersWithParsedSubjects);
    } catch (error) { res.status(500).json({ message: 'Error: Could not get users.' }); }
});

app.post('/api/users', async (req, res) => {
    const { username, password, full_name, email, role, class_group, subjects_taught } = req.body;
    const subjectsJson = (role === 'teacher' && Array.isArray(subjects_taught)) ? JSON.stringify(subjects_taught) : null;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const hashedPassword = await bcrypt.hash(password, 10);
        const [userResult] = await connection.query(
            'INSERT INTO users (username, password, full_name, role, class_group, subjects_taught) VALUES (?, ?, ?, ?, ?, ?)',
            [username, hashedPassword, full_name, role, class_group, subjectsJson]
        );
        const newUserId = userResult.insertId;
        await connection.query('INSERT INTO user_profiles (user_id, email) VALUES (?, ?)', [newUserId, email || null]);
        await connection.commit();
        res.status(201).json({ message: 'User and profile created successfully!' });
    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Error: This username already exists.' });
        res.status(500).json({ message: 'Error: Could not create user.' });
    } finally { connection.release(); }
});

app.get('/api/profiles/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const sql = `SELECT u.*, p.email, p.dob, p.gender, p.phone, p.address, p.profile_image_url, p.admission_date, p.roll_no FROM users u LEFT JOIN user_profiles p ON u.id = p.user_id WHERE u.id = ?`;
        const [rows] = await db.query(sql, [userId]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(rows[0]);
    } catch (error) { res.status(500).json({ message: 'Database error fetching profile' }); }
});

app.put('/api/profiles/:userId', upload.single('profileImage'), async (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    const { full_name, class_group, email, dob, gender, phone, address, roll_no, admission_date } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        if (full_name !== undefined || class_group !== undefined) {
            await connection.query('UPDATE users SET full_name = ?, class_group = ? WHERE id = ?', [full_name, class_group, userId]);
        }
        let profile_image_url = req.body.profile_image_url === 'null' ? null : req.body.profile_image_url;
        if (req.file) profile_image_url = `/uploads/${req.file.filename}`;
        const profileSql = `INSERT INTO user_profiles (user_id, email, dob, gender, phone, address, profile_image_url, admission_date, roll_no) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE email = VALUES(email), dob = VALUES(dob), gender = VALUES(gender), phone = VALUES(phone), address = VALUES(address), profile_image_url = VALUES(profile_image_url), admission_date = VALUES(admission_date), roll_no = VALUES(roll_no)`;
        await connection.query(profileSql, [userId, email, dob, gender, phone, address, profile_image_url, admission_date, roll_no]);
        await connection.commit();
        res.status(200).json({ message: 'Profile updated successfully!', profile_image_url: profile_image_url });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'An error occurred while updating the profile.' });
    } finally { connection.release(); }
});

app.patch('/api/users/:id/reset-password', async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ message: 'New password cannot be empty.' });
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const [result] = await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found.' });
        res.status(200).json({ message: 'Password has been reset successfully!' });
    } catch (error) { res.status(500).json({ message: 'Could not reset password.' }); }
});

app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found.' });
        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error) { res.status(500).json({ message: 'Error: Could not delete user.' }); }
});

// --- SELF-SERVICE PASSWORD RESET API ROUTES (DONOR-ONLY) ---
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        if (!email) return res.status(400).json({ message: 'Email address is required.' });
        const [profileRows] = await db.query('SELECT user_id FROM user_profiles WHERE email = ?', [email]);
        if (profileRows.length === 0) return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        const user_id = profileRows[0].user_id;
        const [userRows] = await db.query('SELECT role FROM users WHERE id = ?', [user_id]);
        if (userRows.length === 0 || userRows[0].role !== 'donor') return res.status(200).json({ message: 'If a Donor account with that email exists, a password reset link has been sent.' });
        const resetToken = crypto.randomBytes(20).toString('hex');
        const tokenExpiry = new Date(Date.now() + 3600000);
        await db.query('UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?', [resetToken, tokenExpiry, user_id]);
        await sendPasswordResetEmail(email, resetToken);
        res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    } catch (error) { res.status(500).json({ message: 'An unexpected error occurred.' }); }
});

app.post('/api/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        if (!token || !newPassword) return res.status(400).json({ message: 'Token and new password are required.' });
        const [rows] = await db.query('SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()', [token]);
        const user = rows[0];
        if (!user) return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?', [hashedPassword, user.id]);
        res.status(200).json({ message: 'Password has been successfully reset. You can now log in.' });
    } catch (error) { res.status(500).json({ message: 'An error occurred.' }); }
});



// --- CALENDAR API ROUTES ---
app.get('/api/calendar', async (req, res) => { try { const [rows] = await db.query('SELECT *, DATE_FORMAT(event_date, "%Y-%m-%d") AS event_date FROM calendar_events ORDER BY event_date ASC, time ASC'); const groupedEvents = rows.reduce((acc, event) => { const dateKey = event.event_date; if (!acc[dateKey]) { acc[dateKey] = []; } acc[dateKey].push(event); return acc; }, {}); res.status(200).json(groupedEvents); } catch (error) { console.error(error); res.status(500).json({ message: 'Error: Could not get calendar events.' }); }});
app.post('/api/calendar', async (req, res) => { const { event_date, name, type, time, description } = req.body; try { await db.query('INSERT INTO calendar_events (event_date, name, type, time, description) VALUES (?, ?, ?, ?, ?)', [event_date, name, type, time, description]); res.status(201).json({ message: 'Event created successfully!' }); } catch (error) { console.error(error); res.status(500).json({ message: 'Error: Could not create event.' }); }});
app.put('/api/calendar/:id', async (req, res) => { const { id } = req.params; const { event_date, name, type, time, description } = req.body; try { const [result] = await db.query('UPDATE calendar_events SET event_date = ?, name = ?, type = ?, time = ?, description = ? WHERE id = ?', [event_date, name, type, time, description, id]); if (result.affectedRows === 0) { return res.status(404).json({ message: 'Event not found.' }); } res.status(200).json({ message: 'Event updated successfully!' }); } catch (error) { console.error(error); res.status(500).json({ message: 'Error: Could not update event.' }); }});
app.delete('/api/calendar/:id', async (req, res) => { const { id } = req.params; try { const [result] = await db.query('DELETE FROM calendar_events WHERE id = ?', [id]); if (result.affectedRows === 0) { return res.status(404).json({ message: 'Event not found.' }); } res.status(200).json({ message: 'Event deleted successfully.' }); } catch (error) { console.error(error); res.status(500).json({ message: 'Error: Could not delete event.' }); }});

// --- PROFILE API ROUTES ---
app.get('/api/profiles/:userId', async (req, res) => { try { const { userId } = req.params; const sql = ` SELECT u.id, u.username, u.full_name, u.role, u.class_group, p.email, p.dob, p.gender, p.phone, p.address, p.profile_image_url, p.admission_date, p.roll_no FROM users u LEFT JOIN user_profiles p ON u.id = p.user_id WHERE u.id = ? `; const [rows] = await db.query(sql, [userId]); if (rows.length === 0) { return res.status(404).json({ message: 'User not found' }); } res.json(rows[0]); } catch (error) { console.error("GET Profile Error:", error); res.status(500).json({ message: 'Database error fetching profile' }); }});
app.put('/api/profiles/:userId', upload.single('profileImage'), async (req, res) => { try { const userId = parseInt(req.params.userId, 10); if (isNaN(userId) || userId <= 0) { return res.status(400).json({ message: 'Invalid User ID provided.' }); } const { full_name, class_group, email, dob, gender, phone, address, admission_date, roll_no } = req.body; const [userCheck] = await db.query('SELECT id FROM users WHERE id = ?', [userId]); if (userCheck.length === 0) { return res.status(404).json({ message: `User with ID ${userId} not found.` }); } let new_profile_image_url = null; if (req.file) { new_profile_image_url = `/uploads/${req.file.filename}`; } else { const [existingProfile] = await db.query('SELECT profile_image_url FROM user_profiles WHERE user_id = ?', [userId]); if (existingProfile.length > 0) { new_profile_image_url = existingProfile[0].profile_image_url; } } if (full_name !== undefined || class_group !== undefined) { await db.query('UPDATE users SET full_name = ?, class_group = ? WHERE id = ?', [full_name, class_group, userId]); } const profileSql = ` INSERT INTO user_profiles ( user_id, email, dob, gender, phone, address, profile_image_url, admission_date, roll_no ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE email = VALUES(email), dob = VALUES(dob), gender = VALUES(gender), phone = VALUES(phone), address = VALUES(address), profile_image_url = VALUES(profile_image_url), admission_date = VALUES(admission_date), roll_no = VALUES(roll_no) `; const profileParams = [userId, email || null, dob || null, gender || null, phone || null, address || null, new_profile_image_url, admission_date || null, roll_no || null]; await db.query(profileSql, profileParams); res.status(200).json({ message: 'Profile updated successfully!', profile_image_url: new_profile_image_url }); } catch (error) { console.error("!!! SERVER ERROR IN PUT /api/profiles/:userId:", error); res.status(500).json({ message: 'An error occurred while updating the profile.' }); }});

// --- TIMETABLE API ROUTES ---
app.get('/api/teachers', async (req, res) => { try { const [teachers] = await db.query("SELECT id, full_name, subjects_taught FROM users WHERE role = 'teacher'"); res.status(200).json(teachers); } catch (error) { console.error("GET /api/teachers Error:", error); res.status(500).json({ message: 'Could not fetch teachers.' }); }});
app.get('/api/timetable/:class_group', async (req, res) => { try { const { class_group } = req.params; if (!class_group) { return res.status(400).json({ message: 'Class group is required.' }); } const query = `SELECT t.*, u.full_name as teacher_name FROM timetables t LEFT JOIN users u ON t.teacher_id = u.id WHERE t.class_group = ?`; const [slots] = await db.query(query, [class_group]); res.status(200).json(slots); } catch (error) { console.error("GET /api/timetable/:class_group Error:", error); res.status(500).json({ message: 'Could not fetch timetable.' }); }});
app.get('/api/timetable/teacher/:teacherId', async (req, res) => { try { const { teacherId } = req.params; if (!teacherId || isNaN(parseInt(teacherId))) { return res.status(400).json({ message: 'A valid Teacher ID is required.' }); } const query = `SELECT t.class_group, t.day_of_week, t.period_number, t.subject_name, t.teacher_id, u.full_name as teacher_name FROM timetables t JOIN users u ON t.teacher_id = u.id WHERE t.teacher_id = ? ORDER BY day_of_week, period_number`; const [slots] = await db.query(query, [teacherId]); res.status(200).json(slots); } catch (error) { console.error("GET /api/timetable/teacher/:teacherId Error:", error); res.status(500).json({ message: 'Could not fetch teacher timetable.' }); }});
app.post('/api/timetable', async (req, res) => { const { class_group, day_of_week, period_number, subject_name, teacher_id } = req.body; const connection = await db.getConnection(); try { await connection.beginTransaction(); await connection.execute('DELETE FROM timetables WHERE class_group = ? AND day_of_week = ? AND period_number = ?', [class_group, day_of_week, period_number] ); if (teacher_id && subject_name) { await connection.execute( 'INSERT INTO timetables (class_group, day_of_week, period_number, subject_name, teacher_id) VALUES (?, ?, ?, ?, ?)', [class_group, day_of_week, period_number, subject_name, teacher_id] ); } await connection.commit(); res.status(201).json({ message: 'Timetable updated successfully!' }); } catch (error) { await connection.rollback(); console.error("POST /api/timetable Error:", error); res.status(500).json({ message: error.message || 'Error updating timetable.' }); } finally { connection.release(); }});

// ==========================================================
// --- ATTENDANCE API ROUTES ---
// ==========================================================
app.get('/api/subjects/:class_group', async (req, res) => { try { const { class_group } = req.params; if (!class_group) { return res.status(400).json({ message: 'Class group is required.' }); } const query = `SELECT DISTINCT subject_name FROM timetables WHERE class_group = ? ORDER BY subject_name;`; const [subjects] = await db.query(query, [class_group]); res.status(200).json(subjects.map(s => s.subject_name)); } catch (error) { console.error("GET /api/subjects/:class_group Error:", error); res.status(500).json({ message: 'Could not fetch subjects for the class.' }); }});
app.get('/api/teacher-assignments/:teacherId', async (req, res) => { try { const { teacherId } = req.params; if (!teacherId) { return res.status(400).json({ message: 'Teacher ID is required.' }); } const query = `SELECT DISTINCT class_group, subject_name FROM timetables WHERE teacher_id = ? ORDER BY class_group, subject_name;`; const [assignments] = await db.query(query, [teacherId]); res.status(200).json(assignments); } catch (error) { console.error("GET /api/teacher-assignments/:teacherId Error:", error); res.status(500).json({ message: 'Could not fetch teacher assignments.' }); }});
app.get('/api/attendance/teacher-summary', async (req, res) => { try { const { teacherId, classGroup, subjectName } = req.query; if (!teacherId || !classGroup || !subjectName) { return res.status(400).json({ message: 'Teacher ID, Class Group, and Subject Name are required.' }); } const summaryQuery = `SELECT COUNT(id) as total_classes, SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as total_present FROM attendance_records WHERE teacher_id = ? AND class_group = ? AND subject_name = ?`; const [[overallSummary]] = await db.query(summaryQuery, [teacherId, classGroup, subjectName]); const studentDetailsQuery = `SELECT u.id AS student_id, u.full_name, SUM(CASE WHEN ar.status = 'Present' THEN 1 ELSE 0 END) as present_count, COUNT(ar.id) as total_marked_days FROM users u LEFT JOIN attendance_records ar ON u.id = ar.student_id AND ar.teacher_id = ? AND ar.subject_name = ? WHERE u.role = 'student' AND u.class_group = ? GROUP BY u.id, u.full_name ORDER BY u.full_name;`; const [studentDetails] = await db.query(studentDetailsQuery, [teacherId, subjectName, classGroup]); res.status(200).json({ overallSummary: { total_classes: overallSummary.total_classes || 0, total_present: overallSummary.total_present || 0, }, studentDetails, }); } catch (error) { console.error("GET /api/attendance/teacher-summary Error:", error); res.status(500).json({ message: 'Could not fetch attendance summary.' }); }});
app.get('/api/attendance/admin-summary', async (req, res) => { try { const { classGroup, subjectName } = req.query; if (!classGroup || !subjectName) { return res.status(400).json({ message: 'Class Group and Subject Name are required.' }); } const summaryQuery = `SELECT COUNT(id) as total_classes, SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as total_present FROM attendance_records WHERE class_group = ? AND subject_name = ?`; const [[overallSummary]] = await db.query(summaryQuery, [classGroup, subjectName]); const studentDetailsQuery = `SELECT u.id AS student_id, u.full_name, SUM(CASE WHEN ar.status = 'Present' THEN 1 ELSE 0 END) as present_count, COUNT(ar.id) as total_marked_days FROM users u LEFT JOIN attendance_records ar ON u.id = ar.student_id AND ar.subject_name = ? WHERE u.role = 'student' AND u.class_group = ? GROUP BY u.id, u.full_name ORDER BY u.full_name;`; const [studentDetails] = await db.query(studentDetailsQuery, [subjectName, classGroup]); res.status(200).json({ overallSummary: { total_classes: overallSummary.total_classes || 0, total_present: overallSummary.total_present || 0, }, studentDetails, }); } catch (error) { console.error("GET /api/attendance/admin-summary Error:", error); res.status(500).json({ message: 'Could not fetch admin attendance summary.' }); }});
app.get('/api/attendance/sheet', async (req, res) => { const { class_group, date, period_number } = req.query; try { if (!class_group || !date || !period_number) { return res.status(400).json({ message: 'Class group, date, and period number are required.' }); } const periodNum = parseInt(period_number, 10); if (isNaN(periodNum) || periodNum < 1 || periodNum > 8) { return res.status(400).json({ message: 'Period number must be between 1 and 8.' }); } const query = `SELECT u.id, u.full_name, ar.status FROM users u LEFT JOIN attendance_records ar ON u.id = ar.student_id AND ar.attendance_date = ? AND ar.period_number = ? WHERE u.role = 'student' AND u.class_group = ? ORDER BY u.full_name;`; const [students] = await db.query(query, [date, periodNum, class_group]); res.status(200).json(students); } catch (error) { console.error("GET /api/attendance/sheet Error:", error); res.status(500).json({ message: 'Error fetching attendance sheet.' }); }});
app.post('/api/attendance', async (req, res) => { const { class_group, subject_name, period_number, date, teacher_id, attendanceData } = req.body; const connection = await db.getConnection(); try { if (!class_group || !subject_name || !period_number || !date || !teacher_id || !Array.isArray(attendanceData)) { return res.status(400).json({ message: 'All fields are required, and attendanceData must be an array.' }); } const periodNum = parseInt(period_number, 10); if (isNaN(periodNum) || periodNum < 1 || periodNum > 8) { return res.status(400).json({ message: 'Period number must be between 1 and 8.' }); } if (attendanceData.some(record => !record.student_id || !['Present', 'Absent'].includes(record.status))) { return res.status(400).json({ message: 'Each attendance record must have a valid student_id and status (Present or Absent).' }); } const dayOfWeek = new Date(date).toLocaleString('en-US', { weekday: 'long' }); const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']; if (!validDays.includes(dayOfWeek)) { return res.status(400).json({ message: 'Attendance can only be marked on school days (Monday to Saturday).' }); } const [timetableSlot] = await connection.query( 'SELECT teacher_id FROM timetables WHERE class_group = ? AND day_of_week = ? AND period_number = ?', [class_group, dayOfWeek, periodNum] ); if (!timetableSlot.length || timetableSlot[0].teacher_id !== parseInt(teacher_id)) { return res.status(403).json({ message: 'You are not assigned to this class period.' }); } await connection.beginTransaction(); const query = `INSERT INTO attendance_records (student_id, teacher_id, class_group, subject_name, attendance_date, period_number, status) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status);`; for (const record of attendanceData) { await connection.execute(query, [ record.student_id, teacher_id, class_group, subject_name, date, periodNum, record.status ]); } await connection.commit(); res.status(201).json({ message: 'Attendance saved successfully!' }); } catch (error) { await connection.rollback(); console.error("POST /api/attendance Error:", error); res.status(500).json({ message: 'Error saving attendance.' }); } finally { connection.release(); }});

app.get('/api/attendance/my-history/:studentId', async (req, res) => {
    const { studentId } = req.params;
    const { viewMode } = req.query; 

    try {
        let dateFilter = '';
        if (viewMode === 'daily') {
            dateFilter = 'AND attendance_date = CURDATE()';
        } else if (viewMode === 'monthly') {
            dateFilter = 'AND MONTH(attendance_date) = MONTH(CURDATE()) AND YEAR(attendance_date) = YEAR(CURDATE())';
        }

        const queryBase = `FROM attendance_records WHERE student_id = ? ${dateFilter}`;
        
        const summaryQuery = `SELECT 
                                SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_days,
                                COUNT(*) as total_days 
                              ${queryBase}`;
        const [[summary]] = await db.query(summaryQuery, [studentId]);

        const historyQuery = `SELECT attendance_date, status, subject_name, period_number 
                              ${queryBase} 
                              ORDER BY attendance_date DESC, period_number DESC`;
        const [history] = await db.query(historyQuery, [studentId]);

        res.status(200).json({
            summary: {
                present_days: summary.present_days || 0,
                absent_days: (summary.total_days || 0) - (summary.present_days || 0),
                total_days: summary.total_days || 0,
            },
            history
        });
    } catch (error) {
        console.error("GET /api/attendance/my-history Error:", error);
        res.status(500).json({ message: 'Could not fetch student history.' });
    }
});

app.get('/api/attendance/summary/:class_group', async (req, res) => { const { class_group } = req.params; try { if (!class_group) { return res.status(400).json({ message: 'Class group is required.' }); } const query = `SELECT u.full_name, u.id as student_id, SUM(CASE WHEN ar.status = 'Present' THEN 1 ELSE 0 END) as present_count, SUM(CASE WHEN ar.status = 'Absent' THEN 1 ELSE 0 END) as absent_count, COUNT(ar.id) as total_marked_days FROM users u LEFT JOIN attendance_records ar ON u.id = ar.student_id WHERE u.role = 'student' AND u.class_group = ? GROUP BY u.id ORDER BY u.full_name;`; const [summary] = await db.query(query, [class_group]); res.status(200).json(summary); } catch (error) { console.error("GET /api/attendance/summary Error:", error); res.status(500).json({ message: 'Could not fetch class summary.' }); }});

// 📂 File: backend/server.js  (Paste this code before the app.listen() call)

// ==========================================================
// --- HEALTH API ROUTES (NEW) ---
// ==========================================================

// Endpoint for a student to get their own record
app.get('/api/health/my-record/:userId', async (req, res) => {
    const { userId } = req.params;
    const query = `
        SELECT hr.*, u.full_name 
        FROM users u
        LEFT JOIN health_records hr ON u.id = hr.user_id 
        WHERE u.id = ?`;
    try {
        const [results] = await db.query(query, [userId]);
        // If no record exists, send back an object with the user's full name.
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            const [userRows] = await db.query('SELECT full_name FROM users WHERE id = ?', [userId]);
            const userName = userRows.length > 0 ? userRows[0].full_name : 'Student';
            res.json({ full_name: userName, user_id: userId });
        }
    } catch (error) {
        console.error("GET /api/health/my-record Error:", error);
        res.status(500).json({ message: "Error fetching health record." });
    }
});

// Endpoint for Teachers/Admins to get a list of all class groups
app.get('/api/health/classes', async (req, res) => {
    const query = "SELECT DISTINCT class_group FROM users WHERE role = 'student' AND class_group IS NOT NULL AND class_group <> '' ORDER BY class_group";
    try {
        const [results] = await db.query(query);
        res.json(results.map(r => r.class_group));
    } catch (error) {
        console.error("GET /api/health/classes Error:", error);
        res.status(500).json({ message: "Error fetching classes." });
    }
});

// Endpoint for Teachers/Admins to get students by class
app.get('/api/health/students/:class_group', async (req, res) => {
    const { class_group } = req.params;
    const query = "SELECT id, full_name, username FROM users WHERE role = 'student' AND class_group = ?";
    try {
        const [results] = await db.query(query, [class_group]);
        res.json(results);
    } catch (error) {
        console.error("GET /api/health/students/:class_group Error:", error);
        res.status(500).json({ message: "Error fetching students." });
    }
});

// Endpoint for Teachers/Admins to get a specific student's health record
app.get('/api/health/record/:userId', async (req, res) => {
    const { userId } = req.params;
    const query = `SELECT hr.*, u.full_name FROM users u LEFT JOIN health_records hr ON u.id = hr.user_id WHERE u.id = ?`;
    try {
        const [results] = await db.query(query, [userId]);
        if (results.length === 0) return res.status(404).json({ message: "Student not found." });
        
        const record = results[0];
        // If the student has no health record yet, some fields will be null. Ensure user_id and full_name are present.
        if (!record.user_id) record.user_id = userId;

        res.json(record);
    } catch (error) {
        console.error("GET /api/health/record/:userId Error:", error);
        res.status(500).json({ message: "Error fetching health record." });
    }
});

// Endpoint for Teachers/Admins to create or update a health record
app.post('/api/health/record/:userId', async (req, res) => {
    const studentUserId = req.params.userId;
    // We get the editor's ID from the request body, as there is no token.
    const { editorId, blood_group, height_cm, weight_kg, last_checkup_date, allergies, medical_conditions, medications } = req.body;
    
    const query = `
        INSERT INTO health_records (user_id, blood_group, height_cm, weight_kg, last_checkup_date, allergies, medical_conditions, medications, last_updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        blood_group = VALUES(blood_group), height_cm = VALUES(height_cm), weight_kg = VALUES(weight_kg), last_checkup_date = VALUES(last_checkup_date),
        allergies = VALUES(allergies), medical_conditions = VALUES(medical_conditions), medications = VALUES(medications), last_updated_by = VALUES(last_updated_by);
    `;
    const values = [studentUserId, blood_group, height_cm, weight_kg, last_checkup_date || null, allergies, medical_conditions, medications, editorId];
    try {
        await db.query(query, values);
        res.status(200).json({ message: "Health record saved successfully." });
    } catch (error) {
        console.error("POST /api/health/record/:userId Error:", error);
        res.status(500).json({ message: "Failed to save health record." });
    }
});

// ==========================================================
// --- SPORTS API ROUTES (NEW) ---
// ==========================================================

// STUDENT: Get a list of activities a specific student is registered for.
app.get('/api/sports/my-registrations/:userId', async (req, res) => {
    const { userId } = req.params;
    const query = `
        SELECT sa.name, sa.team_name, sa.coach_name, sa.schedule_details, ar.achievements
        FROM activity_registrations ar
        JOIN sports_activities sa ON ar.activity_id = sa.id
        WHERE ar.student_id = ? AND ar.status = 'Approved'`;
    try {
        const [registrations] = await db.query(query, [userId]);
        res.json(registrations);
    } catch (error) { res.status(500).json({ message: 'Error fetching registrations.' }); }
});

// STUDENT: Get a list of all available activities they haven't applied for yet.
app.get('/api/sports/available/:userId', async (req, res) => {
    const { userId } = req.params;
    const query = `
        SELECT * FROM sports_activities 
        WHERE is_active = TRUE AND id NOT IN 
        (SELECT activity_id FROM activity_registrations WHERE student_id = ?)`;
    try {
        const [activities] = await db.query(query, [userId]);
        res.json(activities);
    } catch (error) { res.status(500).json({ message: 'Error fetching available activities.' }); }
});

// STUDENT: Apply for an activity.
app.post('/api/sports/apply', async (req, res) => {
    const { userId, activityId } = req.body;
    try {
        await db.query('INSERT INTO activity_registrations (student_id, activity_id) VALUES (?, ?)', [userId, activityId]);
        res.status(201).json({ message: 'Successfully applied!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'You have already applied for this activity.' });
        }
        res.status(500).json({ message: 'Error applying for activity.' });
    }
});

// ADMIN/TEACHER: Create a new sport/activity.
app.post('/api/sports', async (req, res) => {
    const { name, team_name, coach_name, schedule_details, description, created_by } = req.body;
    const query = 'INSERT INTO sports_activities (name, team_name, coach_name, schedule_details, description, created_by) VALUES (?, ?, ?, ?, ?, ?)';
    try {
        await db.query(query, [name, team_name, coach_name, schedule_details, description, created_by]);
        res.status(201).json({ message: 'Activity created successfully!' });
    } catch (error) { res.status(500).json({ message: 'Error creating activity.' }); }
});

// ADMIN/TEACHER: Get all activities for management view.
app.get('/api/sports/all', async (req, res) => {
    const query = `
        SELECT sa.*, COUNT(ar.id) as application_count 
        FROM sports_activities sa 
        LEFT JOIN activity_registrations ar ON sa.id = ar.activity_id AND ar.status = 'Applied'
        GROUP BY sa.id ORDER BY sa.created_at DESC`;
    try {
        const [activities] = await db.query(query);
        res.json(activities);
    } catch (error) { res.status(500).json({ message: 'Error fetching all activities.' }); }
});

// ADMIN/TEACHER: Get all applications (Applied, Approved) for a specific activity.
app.get('/api/sports/applications/:activityId', async (req, res) => {
    const { activityId } = req.params;
    const query = `
        SELECT ar.id as registration_id, ar.status, ar.achievements, ar.remarks, u.id as student_id, u.full_name, ar.registration_date
        FROM activity_registrations ar
        JOIN users u ON ar.student_id = u.id
        WHERE ar.activity_id = ?
        ORDER BY ar.registration_date DESC`; // Order by most recent application first
    try {
        const [applications] = await db.query(query, [activityId]);
        res.json(applications);
    } catch (error) { res.status(500).json({ message: 'Error fetching applications.' }); }
});

// ADMIN/TEACHER: Update an application's status (Approve/Reject).
app.put('/api/sports/application/status', async (req, res) => {
    const { registrationId, status } = req.body;
    try {
        await db.query('UPDATE activity_registrations SET status = ? WHERE id = ?', [status, registrationId]);
        res.status(200).json({ message: `Application status updated to ${status}` });
    } catch (error) { res.status(500).json({ message: 'Error updating status.' }); }
});

// ADMIN/TEACHER: Update a student's achievements for a registration.
app.put('/api/sports/application/achievements', async (req, res) => {
    const { registrationId, achievements } = req.body;
    try {
        await db.query('UPDATE activity_registrations SET achievements = ? WHERE id = ?', [achievements, registrationId]);
        res.status(200).json({ message: 'Achievements updated successfully!' });
    } catch (error) { res.status(500).json({ message: 'Error updating achievements.' }); }
});
// ADMIN/TEACHER: Update an application's remarks.
app.put('/api/sports/application/remarks', async (req, res) => {
    const { registrationId, remarks } = req.body;
    try {
        await db.query('UPDATE activity_registrations SET remarks = ? WHERE id = ?', [remarks, registrationId]);
        res.status(200).json({ message: 'Remarks updated successfully!' });
    } catch (error) { res.status(500).json({ message: 'Error updating remarks.' }); }
});

// ==========================================================
// --- EVENTS API ROUTES (NEW) ---
// ==========================================================

// STUDENT: Get all upcoming events, along with the student's RSVP status for each.
app.get('/api/events/all-for-student/:userId', async (req, res) => {
    const { userId } = req.params;
    const query = `
        SELECT e.*, er.status as rsvp_status
        FROM events e
        LEFT JOIN event_rsvps er ON e.id = er.event_id AND er.student_id = ?
        WHERE e.event_datetime >= CURDATE()
        ORDER BY e.event_datetime ASC`;
    try {
        const [events] = await db.query(query, [userId]);
        res.json(events);
    } catch (error) { console.error(error); res.status(500).json({ message: 'Error fetching events.' }); }
});

// STUDENT: RSVP for an event.
app.post('/api/events/rsvp', async (req, res) => {
    const { eventId, userId } = req.body;
    try {
        await db.query('INSERT INTO event_rsvps (event_id, student_id) VALUES (?, ?)', [eventId, userId]);
        res.status(201).json({ message: 'RSVP successful! Awaiting approval.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'You have already RSVP\'d for this event.' });
        }
        res.status(500).json({ message: 'Error processing RSVP.' });
    }
});

// ADMIN/TEACHER: Create a new event.
app.post('/api/events', async (req, res) => {
    const { title, category, event_datetime, location, description, rsvp_required, created_by } = req.body;
    const query = 'INSERT INTO events (title, category, event_datetime, location, description, rsvp_required, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)';
    try {
        await db.query(query, [title, category, event_datetime, location, description, rsvp_required, created_by]);
        res.status(201).json({ message: 'Event created successfully!' });
    } catch (error) { console.error(error); res.status(500).json({ message: 'Error creating event.' }); }
});

// ADMIN/TEACHER: Get all events for the management view.
app.get('/api/events/all-for-admin', async (req, res) => {
    const query = `
        SELECT e.*, COUNT(er.id) as rsvp_count 
        FROM events e
        LEFT JOIN event_rsvps er ON e.id = er.event_id AND er.status = 'Applied'
        GROUP BY e.id ORDER BY e.event_datetime DESC`;
    try {
        const [events] = await db.query(query);
        res.json(events);
    } catch (error) { console.error(error); res.status(500).json({ message: 'Error fetching admin event list.' }); }
});

// ADMIN/TEACHER: Get all RSVPs (all statuses) for a specific event.
app.get('/api/events/rsvps/:eventId', async (req, res) => {
    const { eventId } = req.params;
    const query = `
        SELECT r.id as rsvp_id, r.status, u.id as student_id, u.full_name, r.rsvp_date
        FROM event_rsvps r
        JOIN users u ON r.student_id = u.id
        WHERE r.event_id = ?
        ORDER BY r.rsvp_date DESC`;
    try {
        const [rsvps] = await db.query(query, [eventId]);
        res.json(rsvps);
    } catch (error) { console.error(error); res.status(500).json({ message: 'Error fetching RSVPs.' }); }
});

// ADMIN/TEACHER: Update an RSVP status (Approve/Reject).
app.put('/api/events/rsvp/status', async (req, res) => {
    const { rsvpId, status } = req.body;
    try {
        await db.query('UPDATE event_rsvps SET status = ? WHERE id = ?', [status, rsvpId]);
        res.status(200).json({ message: `RSVP status updated.` });
    } catch (error) { console.error(error); res.status(500).json({ message: 'Error updating RSVP status.' }); }
});

// STUDENT: Get full details for a SINGLE event, including their specific RSVP.
app.get('/api/events/details/:eventId/:userId', async (req, res) => {
    const { eventId, userId } = req.params;

    // First query: Get the main event details
    const eventQuery = 'SELECT * FROM events WHERE id = ?';
    
    // Second query: Get the specific student's RSVP for this event
    const rsvpQuery = 'SELECT * FROM event_rsvps WHERE event_id = ? AND student_id = ?';

    try {
        const [eventResult] = await db.query(eventQuery, [eventId]);
        if (eventResult.length === 0) {
            return res.status(404).json({ message: 'Event not found.' });
        }
        
        const [rsvpResult] = await db.query(rsvpQuery, [eventId, userId]);

        const eventDetails = eventResult[0];
        const rsvpDetails = rsvpResult.length > 0 ? rsvpResult[0] : null;

        // Combine the results into a single response object
        res.json({
            event: eventDetails,
            rsvp: rsvpDetails
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching event details.' });
    }
});

// ==========================================================
// --- HELP DESK API ROUTES (NEW) ---
// ==========================================================

// ANY USER: Get all FAQs
app.get('/api/helpdesk/faqs', async (req, res) => {
    try {
        const [faqs] = await db.query('SELECT * FROM faqs ORDER BY id');
        res.json(faqs);
    } catch (error) { res.status(500).json({ message: 'Error fetching FAQs.' }); }
});

// STUDENT/TEACHER: Submit a new ticket
app.post('/api/helpdesk/submit', async (req, res) => {
    const { userId, subject, description } = req.body;
    try {
        await db.query('INSERT INTO helpdesk_tickets (user_id, subject, description) VALUES (?, ?, ?)', [userId, subject, description]);
        res.status(201).json({ message: 'Query submitted successfully! We will get back to you soon.' });
    } catch (error) { res.status(500).json({ message: 'Error submitting query.' }); }
});

// STUDENT/TEACHER: Get history of their own tickets
app.get('/api/helpdesk/my-tickets/:userId', async (req, res) => {
    const { userId } = req.params;
    const query = 'SELECT id, subject, status, last_updated_at FROM helpdesk_tickets WHERE user_id = ? ORDER BY last_updated_at DESC';
    try {
        const [tickets] = await db.query(query, [userId]);
        res.json(tickets);
    } catch (error) { res.status(500).json({ message: 'Error fetching your tickets.' }); }
});

// ADMIN: Get all tickets from all users for the management dashboard
app.get('/api/helpdesk/all-tickets', async (req, res) => {
    const { status } = req.query; // Filter by status, e.g., ?status=Open
    let query = `
    SELECT t.id, t.subject, t.status, t.last_updated_at, u.full_name as user_name, u.role, u.class_group
    FROM helpdesk_tickets t
    JOIN users u ON t.user_id = u.id `;
    const params = [];
    if (status) {
        query += 'WHERE t.status = ? ';
        params.push(status);
    }
    query += 'ORDER BY t.last_updated_at DESC';
    try {
        const [tickets] = await db.query(query, params);
        res.json(tickets);
    } catch (error) { res.status(500).json({ message: 'Error fetching all tickets.' }); }
});

// ANY USER: Get full conversation for a single ticket
app.get('/api/helpdesk/ticket/:ticketId', async (req, res) => {
    try {
        const ticketQuery = 'SELECT t.*, u.full_name as user_name, u.role, u.class_group FROM helpdesk_tickets t JOIN users u ON t.user_id = u.id WHERE t.id = ?';
        const repliesQuery = 'SELECT r.*, u.full_name, u.role FROM ticket_replies r JOIN users u ON r.user_id = u.id WHERE r.ticket_id = ? ORDER BY r.created_at ASC';
        
        const [[ticket]] = await db.query(ticketQuery, [req.params.ticketId]);
        const [replies] = await db.query(repliesQuery, [req.params.ticketId]);

        if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });
        res.json({ ticket, replies });
    } catch (error) { res.status(500).json({ message: 'Error fetching ticket details.' }); }
});

// ANY USER: Post a reply to a ticket
// 📂 File: backend/server.js (Replace this route)

// ANY USER: Post a reply to a ticket
// 📂 File: backend/server.js (Replace the existing route with this)

// ANY USER: Post a reply to a ticket
app.post('/api/helpdesk/reply', async (req, res) => {
    const { ticketId, userId, replyText } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Step 1: Insert the new reply into the conversation history.
        await connection.query(
            'INSERT INTO ticket_replies (ticket_id, user_id, reply_text) VALUES (?, ?, ?)',
            [ticketId, userId, replyText]
        );
        
        // Step 2: Update the parent ticket's timestamp. This bumps the ticket to the top of lists sorted by recent activity.
        // It does NOT change the status.
        await connection.query(
            'UPDATE helpdesk_tickets SET last_updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [ticketId]
        );

        await connection.commit();
        res.status(201).json({ message: 'Reply posted successfully.' });
    } catch (error) {
        await connection.rollback();
        console.error("Reply Error:", error);
        res.status(500).json({ message: 'Error posting reply.' });
    } finally {
        connection.release();
    }
});

// ADMIN: Change a ticket's status
app.put('/api/helpdesk/ticket/status', async (req, res) => {
    const { ticketId, status, adminId, adminName } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('UPDATE helpdesk_tickets SET status = ? WHERE id = ?', [status, ticketId]);
        // Add an automatic reply to the log when status changes
        const autoReply = `Admin ${adminName} has updated the status to: ${status}.`;
        await connection.query('INSERT INTO ticket_replies (ticket_id, user_id, reply_text) VALUES (?, ?, ?)', [ticketId, adminId, autoReply]);
        await connection.commit();
        res.status(200).json({ message: 'Status updated.' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Error updating status.' });
    } finally {
        connection.release();
    }
});


// ==========================================================
// --- DONOR HELP DESK API ROUTES (NEW - PUBLIC & ADMIN) ---
// ==========================================================

// PUBLIC: A donor submits a new query
app.post('/api/donor/submit-query', async (req, res) => {
    const { donor_name, donor_email, subject, description } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO donor_queries (donor_name, donor_email, subject, description) VALUES (?, ?, ?, ?)',
            [donor_name, donor_email, subject, description]
        );
        res.status(201).json({ 
            message: 'Query submitted! Please save your Ticket ID to check the status later.',
            ticketId: result.insertId // Send the new ID back to the donor
        });
    } catch (error) { res.status(500).json({ message: 'Error submitting query.' }); }
});

// PUBLIC: A donor checks the status and history of their query using a Ticket ID
app.get('/api/donor/query-status/:ticketId', async (req, res) => {
    const { ticketId } = req.params;
    try {
        const [[queryDetails]] = await db.query('SELECT * FROM donor_queries WHERE id = ?', [ticketId]);
        if (!queryDetails) return res.status(404).json({ message: 'Ticket ID not found.' });
        
        const [replies] = await db.query('SELECT * FROM donor_query_replies WHERE query_id = ? ORDER BY created_at ASC', [ticketId]);
        res.json({ details: queryDetails, replies });
    } catch (error) { res.status(500).json({ message: 'Error fetching query status.' }); }
});

// ADMIN: Get all donor queries for the management dashboard
app.get('/api/admin/donor-queries', async (req, res) => {
    const { status } = req.query;
    let query = 'SELECT * FROM donor_queries ';
    const params = [];
    if (status) {
        query += 'WHERE status = ? ';
        params.push(status);
    }
    query += 'ORDER BY last_updated_at DESC';
    try {
        const [queries] = await db.query(query, params);
        res.json(queries);
    } catch (error) { res.status(500).json({ message: 'Error fetching donor queries.' }); }
});

// ADMIN: Post a reply to a donor's query
app.post('/api/admin/donor-reply', async (req, res) => {
    const { queryId, replyText } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('INSERT INTO donor_query_replies (query_id, is_admin_reply, reply_text) VALUES (?, TRUE, ?)', [queryId, replyText]);
        // Set status to In Progress when admin replies
        await connection.query("UPDATE donor_queries SET status = 'In Progress', last_updated_at = CURRENT_TIMESTAMP WHERE id = ?", [queryId]);
        await connection.commit();
        res.status(201).json({ message: 'Reply posted.' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Error posting reply.' });
    } finally {
        connection.release();
    }
});

// ADMIN: Change a donor query's status
app.put('/api/admin/donor-query/status', async (req, res) => {
    const { queryId, status } = req.body;
    try {
        await db.query('UPDATE donor_queries SET status = ?, last_updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, queryId]);
        res.status(200).json({ message: `Status updated to ${status}.` });
    } catch (error) { res.status(500).json({ message: 'Error updating status.' }); }
});



// ==========================================================
// --- PARENT-TEACHER MEETING (PTM) API ROUTES (CORRECTED) ---
// ==========================================================
// This version REMOVES token authentication to match your Health Info module's pattern.

// GET all meetings (Now public, no token needed)
app.get('/api/ptm', async (req, res) => {
    try {
        const query = `SELECT * FROM ptm_meetings ORDER BY meeting_datetime DESC`;
        const [meetings] = await db.query(query);
        res.status(200).json(meetings);
    } catch (error) {
        console.error("GET /api/ptm Error:", error);
        res.status(500).json({ message: 'Error fetching PTM schedules.' });
    }
});

// GET list of all teachers for the form (Now public, no token needed)
app.get('/api/ptm/teachers', async (req, res) => {
    try {
        const [teachers] = await db.query("SELECT id, full_name FROM users WHERE role = 'teacher' ORDER BY full_name ASC");
        res.status(200).json(teachers);
    } catch (error) {
        console.error("GET /api/ptm/teachers Error:", error);
        res.status(500).json({ message: 'Could not fetch the list of teachers.' });
    }
});

// POST a new meeting
app.post('/api/ptm', async (req, res) => {
    const { meeting_datetime, teacher_id, subject_focus, notes } = req.body;
    
    if (!meeting_datetime || !teacher_id || !subject_focus) {
        return res.status(400).json({ message: 'Meeting Date, Teacher, and Subject are required.' });
    }

    try {
        const [[teacher]] = await db.query('SELECT full_name FROM users WHERE id = ?', [teacher_id]);
        if (!teacher) {
            return res.status(404).json({ message: 'Selected teacher not found.' });
        }
        const query = `INSERT INTO ptm_meetings (meeting_datetime, teacher_id, teacher_name, subject_focus, notes) VALUES (?, ?, ?, ?, ?)`;
        await db.query(query, [meeting_datetime, teacher_id, teacher.full_name, subject_focus, notes || null]);
        res.status(201).json({ message: 'Meeting scheduled successfully!' });
    } catch (error) {
        console.error("POST /api/ptm Error:", error);
        res.status(500).json({ message: 'An error occurred while scheduling the meeting.' });
    }
});

// PUT (update) an existing meeting
app.put('/api/ptm/:id', async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (status === undefined || notes === undefined) {
         return res.status(400).json({ message: 'Status and Notes must be provided for an update.' });
    }

    try {
        const query = 'UPDATE ptm_meetings SET status = ?, notes = ? WHERE id = ?';
        const [result] = await db.query(query, [status, notes, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Meeting not found.' });
        }
        res.status(200).json({ message: 'Meeting updated successfully!' });
    } catch (error) {
        console.error("PUT /api/ptm/:id Error:", error);
        res.status(500).json({ message: 'An error occurred while updating the meeting.' });
    }
});

// DELETE a meeting
app.delete('/api/ptm/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'DELETE FROM ptm_meetings WHERE id = ?';
        const [result] = await db.query(query, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Meeting not found.' });
        }
        res.status(200).json({ message: 'Meeting deleted successfully.' });
    } catch (error) {
        console.error("DELETE /api/ptm/:id Error:", error);
        res.status(500).json({ message: 'An error occurred while deleting the meeting.' });
    }
});


// ==========================================================
// --- DIGITAL LABS API ROUTES (NEW) ---
// ==========================================================
// This section handles creating, fetching, and managing digital lab resources.
// It uses the 'upload' multer instance you already configured.

// GET all digital labs (Publicly accessible for students to view)
app.get('/api/labs', async (req, res) => {
    try {
        const query = `SELECT * FROM digital_labs ORDER BY created_at DESC`;
        const [labs] = await db.query(query);
        res.status(200).json(labs);
    } catch (error) {
        console.error("GET /api/labs Error:", error);
        res.status(500).json({ message: 'Error fetching digital labs.' });
    }
});

// POST a new digital lab (Admin/Teacher only)
// 'upload.single('coverImage')' handles the file upload.
app.post('/api/labs', upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'labFile', maxCount: 1 }]), async (req, res) => {
    const { title, subject, lab_type, description, access_url, created_by } = req.body;

    // The req.files object will contain the uploaded files
    const coverImageFile = req.files['coverImage'] ? req.files['coverImage'][0] : null;
    const labFile = req.files['labFile'] ? req.files['labFile'][0] : null;

    const cover_image_url = coverImageFile ? `/uploads/${coverImageFile.filename}` : null;
    const file_path = labFile ? `/uploads/${labFile.filename}` : null;
    
    // A lab must have either an external URL or an uploaded file
    if (!access_url && !file_path) {
        return res.status(400).json({ message: 'You must provide either an Access URL or upload a Lab File.' });
    }

    try {
        const query = `
            INSERT INTO digital_labs (title, subject, lab_type, description, access_url, file_path, cover_image_url, created_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        // Note: access_url can be null if a file is uploaded, and vice-versa
        await db.query(query, [title, subject, lab_type, description, access_url || null, file_path, cover_image_url, created_by || null]);
        res.status(201).json({ message: 'Digital lab created successfully!' });
    } catch (error) {
        console.error("POST /api/labs Error:", error);
        res.status(500).json({ message: 'Error creating digital lab.' });
    }
});

// ... inside the DIGITAL LABS API ROUTES section ...

// PUT (update) an existing lab (Admin/Teacher only)
// This handles updating text fields and optionally a new cover image.
// PUT (update) an existing lab (Corrected to handle optional file uploads)
app.put('/api/labs/:id', upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'labFile', maxCount: 1 }]), async (req, res) => {
    const { id } = req.params;
    const { title, subject, lab_type, description, access_url } = req.body;
    
    try {
        const [existingLab] = await db.query('SELECT cover_image_url, file_path FROM digital_labs WHERE id = ?', [id]);
        if (existingLab.length === 0) {
            return res.status(404).json({ message: 'Lab not found.' });
        }

        const coverImageFile = req.files['coverImage'] ? req.files['coverImage'][0] : null;
        const labFile = req.files['labFile'] ? req.files['labFile'][0] : null;

        // Use new file if uploaded, otherwise keep the existing path
        let cover_image_url = coverImageFile ? `/uploads/${coverImageFile.filename}` : existingLab[0].cover_image_url;
        let file_path = labFile ? `/uploads/${labFile.filename}` : existingLab[0].file_path;

        const query = `
            UPDATE digital_labs SET 
            title = ?, subject = ?, lab_type = ?, description = ?, access_url = ?, file_path = ?, cover_image_url = ?
            WHERE id = ?
        `;
        await db.query(query, [title, subject, lab_type, description, access_url || null, file_path, cover_image_url, id]);
        res.status(200).json({ message: 'Digital lab updated successfully!' });
    } catch (error) {
        console.error("PUT /api/labs/:id Error:", error);
        res.status(500).json({ message: 'Error updating digital lab.' });
    }
});

// ... your existing DELETE route for /api/labs/:id


// DELETE a digital lab (Admin/Teacher only)
app.delete('/api/labs/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // You might want to add logic here to delete the associated image file from the /uploads folder
        const [result] = await db.query('DELETE FROM digital_labs WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Digital lab not found.' });
        }
        res.status(200).json({ message: 'Digital lab deleted successfully.' });
    } catch (error) {
        console.error("DELETE /api/labs/:id Error:", error);
        res.status(500).json({ message: 'Error deleting digital lab.' });
    }
});


// ==========================================================
// --- HOMEWORK & ASSIGNMENTS API ROUTES (CORRECTED & FINAL) ---
// ==========================================================

// --- UTILITY ROUTES (FOR HOMEWORK FORMS) ---

// Get a list of all unique student class groups
app.get('/api/student-classes', async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT class_group FROM users 
            WHERE role = 'student' AND class_group IS NOT NULL AND class_group <> '' AND class_group <> 'N/A'
            ORDER BY class_group ASC`;
        const [rows] = await db.query(query);
        res.json(rows.map(r => r.class_group));
    } catch (error) { 
        console.error('Error fetching student classes:', error);
        res.status(500).json({ message: 'Error fetching student classes.' }); 
    }
});

// Get all subjects for a selected class from the timetable
app.get('/api/subjects-for-class/:classGroup', async (req, res) => {
    const { classGroup } = req.params;
    try {
        const query = "SELECT DISTINCT subject_name FROM timetables WHERE class_group = ? ORDER BY subject_name";
        const [rows] = await db.query(query, [classGroup]);
        res.json(rows.map(r => r.subject_name));
    } catch (error) { 
        console.error('Error fetching subjects for class:', error);
        res.status(500).json({ message: 'Error fetching subjects.' }); 
    }
});


// --- TEACHER / ADMIN ROUTES ---

// Get assignment history for a specific teacher
app.get('/api/homework/teacher/:teacherId', async (req, res) => {
    const { teacherId } = req.params;
    try {
        const query = `
            SELECT a.*, (SELECT COUNT(*) FROM homework_submissions s WHERE s.assignment_id = a.id) as submission_count
            FROM homework_assignments a
            WHERE a.teacher_id = ? ORDER BY a.created_at DESC`;
        const [assignments] = await db.query(query, [teacherId]);
        res.json(assignments);
    } catch (error) { 
        console.error('Error fetching teacher assignments:', error);
        res.status(500).json({ message: 'Error fetching created assignments.' }); 
    }
});

// Create a new homework assignment
app.post('/api/homework', upload.single('attachment'), async (req, res) => {
    const { title, description, class_group, subject, due_date, teacher_id } = req.body;
    const attachment_path = req.file ? `/uploads/${req.file.filename}` : null;
    try {
        const query = `INSERT INTO homework_assignments (title, description, class_group, subject, due_date, teacher_id, attachment_path) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        await db.query(query, [title, description, class_group, subject, due_date, teacher_id, attachment_path]);
        res.status(201).json({ message: 'Homework created successfully.' });
    } catch (error) { 
        console.error('Error creating homework:', error);
        res.status(500).json({ message: 'Error creating homework.' }); 
    }
});

// Update an existing homework assignment (Note: uses POST for multipart/form-data compatibility)
app.post('/api/homework/:assignmentId', upload.single('attachment'), async (req, res) => {
    const { assignmentId } = req.params;
    const { title, description, class_group, subject, due_date, existing_attachment_path } = req.body;
    
    try {
        // If a new file is uploaded, use its path. Otherwise, use the existing path sent from the client.
        let attachment_path = existing_attachment_path || null;
        if (req.file) { 
            attachment_path = `/uploads/${req.file.filename}`; 
        }

        const query = `UPDATE homework_assignments SET title = ?, description = ?, class_group = ?, subject = ?, due_date = ?, attachment_path = ? WHERE id = ?`;
        await db.query(query, [title, description, class_group, subject, due_date, attachment_path, assignmentId]);
        res.status(200).json({ message: 'Homework updated successfully.' });
    } catch (error) { 
        console.error('Error updating homework:', error);
        res.status(500).json({ message: 'Error updating homework.' }); 
    }
});

// Delete a homework assignment
app.delete('/api/homework/:assignmentId', async (req, res) => {
    const { assignmentId } = req.params;
    try {
        // Note: For a robust system, you'd also delete associated submission files from the /uploads folder.
        // This query also relies on cascading deletes in the DB or deleting submissions first.
        // Assuming `homework_submissions` has an ON DELETE CASCADE for `assignment_id` foreign key.
        await db.query('DELETE FROM homework_assignments WHERE id = ?', [assignmentId]);
        res.status(200).json({ message: 'Homework and all its submissions deleted.' });
    } catch (error) { 
        console.error('Error deleting homework:', error);
        res.status(500).json({ message: 'Error deleting homework.' }); 
    }
});

// Get all submissions for a specific assignment
app.get('/api/homework/submissions/:assignmentId', async (req, res) => {
    const { assignmentId } = req.params;
    try {
        const query = `
            SELECT s.*, u.full_name as student_name 
            FROM homework_submissions s
            JOIN users u ON s.student_id = u.id
            WHERE s.assignment_id = ? ORDER BY s.submitted_at DESC`;
        const [submissions] = await db.query(query, [assignmentId]);
        res.json(submissions);
    } catch (error) { 
        console.error('Error fetching submissions:', error);
        res.status(500).json({ message: 'Error fetching submissions.' }); 
    }
});

// Grade a submission
app.put('/api/homework/grade/:submissionId', async (req, res) => {
    const { submissionId } = req.params;
    const { grade, remarks } = req.body;
    try {
        const query = `UPDATE homework_submissions SET grade = ?, remarks = ?, status = 'Graded' WHERE id = ?`;
        await db.query(query, [grade || null, remarks || null, submissionId]);
        res.status(200).json({ message: 'Submission graded successfully.' });
    } catch (error) { 
        console.error('Error grading submission:', error);
        res.status(500).json({ message: 'Error grading submission.' }); 
    }
});


// --- STUDENT ROUTES ---

// Get all assignments for a student's class
app.get('/api/homework/student/:studentId/:classGroup', async (req, res) => {
    const { studentId, classGroup } = req.params;
    try {
        const query = `
            SELECT 
                a.id, a.title, a.description, a.subject, a.due_date, a.attachment_path,
                s.id as submission_id, 
                s.submitted_at, 
                s.status, 
                s.grade, 
                s.remarks
            FROM homework_assignments a
            LEFT JOIN homework_submissions s ON a.id = s.assignment_id AND s.student_id = ?
            WHERE a.class_group = ? 
            ORDER BY a.due_date DESC, a.id DESC`;
        const [assignments] = await db.query(query, [studentId, classGroup]);
        // Process status to be more reliable
        const processedAssignments = assignments.map(a => ({
            ...a,
            status: a.submission_id ? (a.status || 'Submitted') : 'Pending'
        }));
        res.json(processedAssignments);
    } catch (error) { 
        console.error('Error fetching student assignments:', error);
        res.status(500).json({ message: 'Error fetching assignments.' }); 
    }
});

// ✅ --- NEW ROUTE ADDED TO FIX THE SUBMISSION ERROR --- ✅
// Student submits a homework file
// The frontend sends the file under the field name 'submission'
app.post('/api/homework/submit/:assignmentId', upload.single('submission'), async (req, res) => {
    const { assignmentId } = req.params;
    const { student_id } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ message: 'No file was uploaded.' });
    }
    
    const submission_path = `/uploads/${req.file.filename}`;
    
    try {
        // First, check if a submission already exists to prevent duplicates
        const [existing] = await db.query(
            'SELECT id FROM homework_submissions WHERE assignment_id = ? AND student_id = ?',
            [assignmentId, student_id]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: 'You have already submitted this homework.' });
        }

        const query = `
            INSERT INTO homework_submissions (assignment_id, student_id, submission_path, status) 
            VALUES (?, ?, ?, 'Submitted')
        `;
        await db.query(query, [assignmentId, student_id, submission_path]);
        res.status(201).json({ message: 'Homework submitted successfully.' });
    } catch (error) {
        console.error('Error submitting homework:', error);
        res.status(500).json({ message: 'Database error during homework submission.' });
    }
});


// ==========================================================
// --- EXAM SCHEDULE API ROUTES ---
// ==========================================================

// --- TEACHER / ADMIN ROUTES ---

// Get all exam schedules created (for the main list view)
app.get('/api/exam-schedules', async (req, res) => {
    try {
        const query = `
            SELECT es.id, es.title, es.class_group, u.full_name as created_by
            FROM exam_schedules es
            JOIN users u ON es.created_by_id = u.id
            ORDER BY es.updated_at DESC
        `;
        const [schedules] = await db.query(query);
        res.json(schedules);
    } catch (error) {
        console.error("Error fetching exam schedules:", error);
        res.status(500).json({ message: "Failed to fetch exam schedules." });
    }
});

// Get a single, detailed exam schedule for editing
app.get('/api/exam-schedules/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `SELECT * FROM exam_schedules WHERE id = ?`;
        const [schedules] = await db.query(query, [id]);
        if (schedules.length === 0) {
            return res.status(404).json({ message: "Schedule not found." });
        }
        res.json(schedules[0]);
    } catch (error) {
        console.error("Error fetching single exam schedule:", error);
        res.status(500).json({ message: "Failed to fetch schedule details." });
    }
});

// Create a new exam schedule
app.post('/api/exam-schedules', async (req, res) => {
    const { class_group, title, subtitle, schedule_data, created_by_id } = req.body;
    if (!class_group || !title || !schedule_data || !created_by_id) {
        return res.status(400).json({ message: "Missing required fields." });
    }
    try {
        const query = `
            INSERT INTO exam_schedules (class_group, title, subtitle, schedule_data, created_by_id)
            VALUES (?, ?, ?, ?, ?)
        `;
        // Ensure schedule_data is stored as a JSON string
        await db.query(query, [class_group, title, subtitle, JSON.stringify(schedule_data), created_by_id]);
        res.status(201).json({ message: "Exam schedule created successfully." });
    } catch (error) {
        console.error("Error creating exam schedule:", error);
        res.status(500).json({ message: "Failed to create exam schedule." });
    }
});

// Update an existing exam schedule
app.put('/api/exam-schedules/:id', async (req, res) => {
    const { id } = req.params;
    const { class_group, title, subtitle, schedule_data } = req.body;
    try {
        const query = `
            UPDATE exam_schedules 
            SET class_group = ?, title = ?, subtitle = ?, schedule_data = ?
            WHERE id = ?
        `;
        await db.query(query, [class_group, title, subtitle, JSON.stringify(schedule_data), id]);
        res.status(200).json({ message: "Exam schedule updated successfully." });
    } catch (error) {
        console.error("Error updating exam schedule:", error);
        res.status(500).json({ message: "Failed to update exam schedule." });
    }
});

// Delete an exam schedule
app.delete('/api/exam-schedules/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM exam_schedules WHERE id = ?', [id]);
        res.status(200).json({ message: "Exam schedule deleted successfully." });
    } catch (error) {
        console.error("Error deleting exam schedule:", error);
        res.status(500).json({ message: "Failed to delete exam schedule." });
    }
});


// --- STUDENT ROUTE ---

// Get the latest exam schedule for the student's class
app.get('/api/exam-schedules/class/:classGroup', async (req, res) => {
    const { classGroup } = req.params;
    try {
        const query = `
            SELECT * FROM exam_schedules 
            WHERE class_group = ? 
            ORDER BY updated_at DESC 
            LIMIT 1
        `;
        const [schedules] = await db.query(query, [classGroup]);
        if (schedules.length === 0) {
            return res.status(404).json({ message: "No exam schedule found for your class." });
        }
        res.json(schedules[0]);
    } catch (error) {
        console.error("Error fetching student exam schedule:", error);
        res.status(500).json({ message: "Failed to fetch exam schedule." });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`✅ Backend server is running on http://localhost:${PORT}`);
});
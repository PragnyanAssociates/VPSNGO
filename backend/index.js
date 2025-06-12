// 📂 File: server.js (CORRECTED & FINAL)

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken'); // 👈 ADD THIS LINE
const path = require('path');

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
    jsonColumns: ['subjects_taught'],
});

// ==========================================================
// --- USER API ROUTES ---
// ==========================================================
app.post('/api/login', async (req, res) => { const { username, password } = req.body; try { const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]); const user = rows[0]; if (!user || !(await bcrypt.compare(password, user.password))) { return res.status(401).json({ message: 'Error: Invalid username or password.' }); } const { password: _, ...userData } = user; res.status(200).json({ message: 'Login successful!', user: userData }); } catch (error) { res.status(500).json({ message: 'Error: Database connection failed.' }); }});
app.get('/api/users', async (req, res) => { try { const [rows] = await db.query('SELECT id, username, full_name, role, class_group, subjects_taught FROM users'); res.status(200).json(rows); } catch (error) { console.error("GET /api/users Error:", error); res.status(500).json({ message: 'Error: Could not get users.' }); }});
app.post('/api/users', async (req, res) => { const { username, password, full_name, role, class_group, subjects_taught } = req.body; const subjectsJson = (role === 'teacher' && Array.isArray(subjects_taught)) ? JSON.stringify(subjects_taught) : null; try { const hashedPassword = await bcrypt.hash(password, 10); await db.query('INSERT INTO users (username, password, full_name, role, class_group, subjects_taught) VALUES (?, ?, ?, ?, ?, ?)', [username, hashedPassword, full_name, role, class_group, subjectsJson]); res.status(201).json({ message: 'User created successfully!' }); } catch (error) { if (error.code === 'ER_DUP_ENTRY') { return res.status(409).json({ message: 'Error: This username already exists.' }); } console.error("POST /api/users Error:", error); res.status(500).json({ message: 'Error: Could not create user.' }); }});
app.put('/api/users/:id', async (req, res) => { const { id } = req.params; const { username, password, full_name, role, class_group, subjects_taught } = req.body; const subjectsJson = (role === 'teacher' && Array.isArray(subjects_taught)) ? JSON.stringify(subjects_taught) : null; try { let query, queryParams; if (password && password.trim() !== '') { const hashedPassword = await bcrypt.hash(password, 10); query = 'UPDATE users SET username = ?, password = ?, full_name = ?, role = ?, class_group = ?, subjects_taught = ? WHERE id = ?'; queryParams = [username, hashedPassword, full_name, role, class_group, subjectsJson, id]; } else { query = 'UPDATE users SET username = ?, full_name = ?, role = ?, class_group = ?, subjects_taught = ? WHERE id = ?'; queryParams = [username, full_name, role, class_group, subjectsJson, id]; } const [result] = await db.query(query, queryParams); if (result.affectedRows === 0) { return res.status(404).json({ message: 'Error: User not found.' }); } res.status(200).json({ message: 'User updated successfully!' }); } catch (error) { if (error.code === 'ER_DUP_ENTRY') { return res.status(409).json({ message: 'Error: This username is already taken.' }); } console.error(`PUT /api/users/${id} Error:`, error); res.status(500).json({ message: 'Error: Could not update user.' }); }});
app.patch('/api/users/:id/reset-password', async (req, res) => { const { id } = req.params; const { newPassword } = req.body; if (!newPassword || newPassword.trim() === '') { return res.status(400).json({ message: 'Error: New password cannot be empty.' }); } try { const hashedPassword = await bcrypt.hash(newPassword, 10); const [result] = await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]); if (result.affectedRows === 0) { return res.status(404).json({ message: 'Error: User not found.' }); } res.status(200).json({ message: 'Password has been reset successfully!' }); } catch (error) { console.error('Error resetting password:', error); res.status(500).json({ message: 'Error: Could not reset password.' }); }});
app.delete('/api/users/:id', async (req, res) => { const { id } = req.params; try { await db.query('DELETE FROM users WHERE id = ?', [id]); res.status(200).json({ message: 'User deleted successfully.' }); } catch (error) { res.status(500).json({ message: 'Error: Could not delete user.' }); }});

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

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Backend server is running on http://localhost:${PORT}`);
});
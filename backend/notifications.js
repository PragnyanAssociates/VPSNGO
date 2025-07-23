// 📂 File: backend/notifications.js

// These will be exported from your main index.js file
const { db, io } = require('./index.js'); 

// This map tracks online users for instant alerts
const userSocketMap = new Map();

/**
 * The central function to create and send all notifications based on your rules.
 */
async function createAndDispatchNotifications({ actor, action, entity, classGroup = null }) {
    let message = '';
    let link = '';
    let targetUserIds = new Set();

    try {
        // --- DEFINE YOUR NOTIFICATION RULES HERE ---
        switch (action) {
            case 'NEW_HOMEWORK_ASSIGNED':
                // Rule: A teacher assigns homework.
                // Notify: All students in that class AND all admins.
                message = `${actor.full_name} assigned new homework for ${classGroup}: "${entity.title}"`;
                link = 'StudentHomework'; // Screen for students to navigate to
                
                const [students] = await db.query("SELECT id FROM users WHERE role = 'student' AND class_group = ?", [classGroup]);
                students.forEach(s => targetUserIds.add(s.id));
                
                const [admins] = await db.query("SELECT id FROM users WHERE role = 'admin'");
                admins.forEach(a => targetUserIds.add(a.id));
                break;

            case 'HOMEWORK_SUBMITTED':
                // Rule: A student submits homework.
                // Notify: The teacher who assigned it.
                message = `${actor.full_name} from ${actor.class_group} submitted homework: "${entity.title}"`;
                link = `TeacherHomeworkSubmissions/${entity.id}`; // Screen for teachers
                targetUserIds.add(entity.teacher_id);
                break;
                
            case 'NEW_SUGGESTION_FROM_DONOR':
                // Rule: A donor makes a suggestion.
                // Notify: All admins.
                message = `New suggestion from donor ${actor.full_name}: "${entity.subject}"`;
                link = `AdminSuggestionDetails/${entity.id}`;
                const [allAdmins] = await db.query("SELECT id FROM users WHERE role = 'admin'");
                allAdmins.forEach(a => targetUserIds.add(a.id));
                break;

            // ... Add more cases here for your other 28 modules ...
        }

        if (targetUserIds.size === 0 || !message) return;
        targetUserIds.delete(actor.id); // Users don't get notified about their own actions

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const notificationPayloads = Array.from(targetUserIds).map(userId => [userId, message, link]);
            
            if (notificationPayloads.length > 0) {
                await connection.query('INSERT INTO notifications (recipient_id, message, link) VALUES ?', [notificationPayloads]);
            }
            await connection.commit();

            // Send a real-time alert to any online recipients
            notificationPayloads.forEach(([userId]) => {
                const socketId = userSocketMap.get(userId);
                if (socketId) {
                    io.to(socketId).emit('new_notification', { message });
                }
            });
        } catch (dbError) {
            await connection.rollback();
            throw dbError; // Rethrow to be caught by the outer catch block
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error("Error in createAndDispatchNotifications:", error);
    }
}

module.exports = { createAndDispatchNotifications, userSocketMap };
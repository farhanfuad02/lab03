const db = require('../config/db');

async function addDeletedAtColumn() {
    try {
        await db.query('ALTER TABLE tasks ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL');
        console.log('Successfully added deleted_at column to tasks table.');
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Column deleted_at already exists.');
        } else {
            console.error('Error adding column:', err);
        }
    } finally {
        process.exit();
    }
}

addDeletedAtColumn();

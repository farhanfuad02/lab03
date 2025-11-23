const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const logger = require('../../config/logger');

// GET all tasks (with pagination, search, and soft delete filter)
router.get('/', async (req, res) => {
  try {
    let { page, limit, q } = req.query;

    // Set defaults and parse to integers
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    // Enforce max limit
    if (limit > 50) limit = 50;

    // Calculate offset
    const offset = (page - 1) * limit;

    // Base queries
    let countSql = 'SELECT COUNT(*) as count FROM tasks WHERE deleted_at IS NULL';
    let dataSql = 'SELECT * FROM non_existent_table WHERE deleted_at IS NULL';
    const params = [];

    // Add search filter if 'q' is provided
    if (q) {
      const searchClause = ' AND title LIKE ?';
      countSql += searchClause;
      dataSql += searchClause;
      params.push(`%${q}%`);
    }

    // Add ordering and pagination to data query
    dataSql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

    // Get total count
    const [countResult] = await db.query(countSql, q ? [`%${q}%`] : []);
    const totalTasks = countResult[0].count;
    const totalPages = Math.ceil(totalTasks / limit);

    // Get paginated data
    const queryParams = [...params, limit, offset];
    const [rows] = await db.query(dataSql, queryParams);

    res.json({
      totalTasks,
      totalPages,
      currentPage: page,
      limit,
      data: rows
    });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Database error' });
  }
});

// GET soft-deleted tasks
router.get('/deleted', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tasks WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC');
    res.json(rows);
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Database error' });
  }
});

// POST create new task
router.post('/', async (req, res) => {
  const { title, description } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const sql = 'INSERT INTO tasks (title, description) VALUES (?, ?)';
    const [result] = await db.query(sql, [title, description || null]);

    const [newTask] = await db.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json(newTask[0]);
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT update task
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  try {
    const updates = [];
    const values = [];

    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const sql = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const [updated] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// PUT restore task
router.put('/:id/restore', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('UPDATE tasks SET deleted_at = NULL WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const [restored] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(restored[0]);
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Failed to restore task' });
  }
});

// DELETE task (Soft delete)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('UPDATE tasks SET deleted_at = NOW() WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(204).send();
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;

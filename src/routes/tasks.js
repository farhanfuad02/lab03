const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// GET all tasks
// GET all tasks with pagination
router.get('/', async (req, res) => {
  try {
    let { page, limit } = req.query;

    // Set defaults and parse to integers
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    // Enforce max limit
    if (limit > 50) limit = 50;

    // Calculate offset
    const offset = (page - 1) * limit;

    // Get total count
    const [countResult] = await db.query('SELECT COUNT(*) as count FROM tasks');
    const totalTasks = countResult[0].count;
    const totalPages = Math.ceil(totalTasks / limit);

    // Get paginated data
    const [rows] = await db.query('SELECT * FROM tasks ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);

    res.json({
      totalTasks,
      totalPages,
      currentPage: page,
      limit,
      data: rows
    });
  } catch (err) {
    console.error(err);
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
    console.error(err);
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
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE task
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;

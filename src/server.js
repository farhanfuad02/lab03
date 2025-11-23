const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Task Management API is running');
});
const taskRoutes = require('./routes/tasks.js');
app.use('/tasks', taskRoutes);

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

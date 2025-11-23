const db = require('./config/db');

async function seed() {
    try {
        // Check if tasks already exist
        const [rows] = await db.query('SELECT COUNT(*) as count FROM tasks');
        const count = rows[0].count;

        if (count > 0) {
            console.log('Tasks table is not empty. Skipping seed.');
            process.exit(0);
        }

        console.log('Seeding tasks...');

        const tasks = [
            { title: 'Learn Node.js', description: 'Study Express and MySQL', status: 'pending' },
            { title: 'Learn React', description: 'Study hooks and components', status: 'pending' },
            { title: 'Buy Groceries', description: 'Milk, eggs, bread', status: 'pending' },
            { title: 'Walk the dog', description: 'Take the dog to the park', status: 'pending' },
            { title: 'Read a book', description: 'Read "Clean Code"', status: 'pending' },
            { title: 'Write blog post', description: 'Write about Node.js streams', status: 'pending' },
            { title: 'Fix bugs', description: 'Fix issue #123', status: 'pending' },
            { title: 'Review PR', description: 'Review pull request #456', status: 'pending' },
            { title: 'Update documentation', description: 'Update API docs', status: 'pending' },
            { title: 'Deploy to staging', description: 'Deploy latest build to staging', status: 'pending' },
            { title: 'Clean house', description: 'Vacuum and dust', status: 'pending' },
            { title: 'Pay bills', description: 'Pay electricity and internet bills', status: 'pending' },
            { title: 'Call mom', description: 'Weekly call', status: 'pending' },
            { title: 'Go for a run', description: 'Run 5k', status: 'pending' },
            { title: 'Cook dinner', description: 'Make pasta', status: 'pending' }
        ];

        const sql = 'INSERT INTO tasks (title, description, status) VALUES ?';
        const values = tasks.map(task => [task.title, task.description, task.status]);

        await db.query(sql, [values]);

        console.log('Successfully seeded 15 tasks.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding tasks:', err);
        process.exit(1);
    }
}

seed();

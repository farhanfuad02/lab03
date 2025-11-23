const mysql = require('mysql2');

const connection = mysql.createPool({
  host: 'localhost',
  user: 'taskuser',
  password: 'taskpass123',
  database: 'taskdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promiseConnection = connection.promise();
module.exports = promiseConnection;

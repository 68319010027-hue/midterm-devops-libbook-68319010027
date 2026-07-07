const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const initDb = async () => {
  const createQuery = `
      CREATE TABLE IF NOT EXISTS books (
        isbn VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        year INT NOT NULL,
        status VARCHAR(50) DEFAULT 'พร้อมให้ยืม'
      );
    `;

  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      await pool.query(createQuery);
      console.log('Database initialized.');
      return;
    } catch (err) {
      console.error(`Database init attempt ${attempt} failed:`, err.message);
      if (attempt === 10) {
        console.error('Database initialization failed after 10 attempts.');
        process.exit(1);
      }
      await sleep(2000);
    }
  }
};

const startServer = async () => {
  await initDb();
  app.listen(process.env.PORT || 3000, () => console.log('Server running on port', process.env.PORT || 3000));
};

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.get('/api/books', asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM books');
  res.json(result.rows);
}));

app.get('/api/books/:isbn', asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM books WHERE isbn = $1', [req.params.isbn]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
}));

app.post('/api/books', asyncHandler(async (req, res) => {
  const { isbn, title, author, category, year, status } = req.body;
  if (!isbn || !title || !author || !category || !year) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }
  const result = await pool.query(
    'INSERT INTO books (isbn, title, author, category, year, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [isbn, title, author, category, year, status || 'พร้อมให้ยืม']
  );
  res.status(201).json(result.rows[0]);
}));

app.put('/api/books/:isbn', asyncHandler(async (req, res) => {
  const { title, author, category, year, status } = req.body;
  const result = await pool.query(
    'UPDATE books SET title=$1, author=$2, category=$3, year=$4, status=$5 WHERE isbn=$6 RETURNING *',
    [title, author, category, year, status || 'พร้อมให้ยืม', req.params.isbn]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
}));

app.delete('/api/books/:isbn', asyncHandler(async (req, res) => {
  const result = await pool.query('DELETE FROM books WHERE isbn = $1 RETURNING *', [req.params.isbn]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted' });
}));

app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === '23505') {
    return res.status(400).json({ error: 'ISBN นี้มีอยู่แล้ว' });
  }
  const statusCode = err.status || 500;
  res.status(statusCode).json({ error: err.message || 'Internal server error' });
});

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
module.exports = app;
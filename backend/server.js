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

const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS books (
        isbn VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        year INT NOT NULL,
        status VARCHAR(50) DEFAULT 'พร้อมให้ยืม'
      );
    `);
  } catch (err) { console.error(err); }
};
initDb();

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.get('/api/books', async (req, res) => {
  const result = await pool.query('SELECT * FROM books');
  res.json(result.rows);
});

app.get('/api/books/:isbn', async (req, res) => {
  const result = await pool.query('SELECT * FROM books WHERE isbn = $1', [req.params.isbn]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
});

app.post('/api/books', async (req, res) => {
  const { isbn, title, author, category, year, status } = req.body;
  const result = await pool.query(
    'INSERT INTO books (isbn, title, author, category, year, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [isbn, title, author, category, year, status]
  );
  res.status(201).json(result.rows[0]);
});

app.put('/api/books/:isbn', async (req, res) => {
  const { title, author, category, year, status } = req.body;
  const result = await pool.query(
    'UPDATE books SET title=$1, author=$2, category=$3, year=$4, status=$5 WHERE isbn=$6 RETURNING *',
    [title, author, category, year, status, req.params.isbn]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
});

app.delete('/api/books/:isbn', async (req, res) => {
  const result = await pool.query('DELETE FROM books WHERE isbn = $1 RETURNING *', [req.params.isbn]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(process.env.PORT || 3000, () => console.log('Server running'));
}
module.exports = app;
const request = require('supertest');
const app = require('./server');

jest.mock('pg', () => {
  return { Pool: jest.fn(() => ({ query: jest.fn().mockResolvedValue({ rows: [] }) })) };
});

describe('API Tests', () => {
  it('GET /health should return 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
  });
  it('GET /api/books/999 should return 404', async () => {
    const res = await request(app).get('/api/books/999');
    expect(res.statusCode).toBe(404);
  });
});
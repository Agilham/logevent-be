// src/__tests__/index.test.ts

import request from 'supertest';
import app from '../index'; // Import the exported Express app instance

describe('Express App (index.ts)', () => {
  // Test the /metrics endpoint as an example
  it('should respond with 200 to the /metrics endpoint', async () => {
    const res = await request(app).get('/metrics');
    expect(res.statusCode).toEqual(200);
    expect(res.headers['content-type']).toContain('text/plain'); // Prometheus metrics are usually text/plain
  });

  // Test an unknown endpoint
  it('should respond with 404 to an unknown endpoint', async () => {
    const res = await request(app).get('/nonexistent-route');
    expect(res.statusCode).toEqual(404);
  });

  // You can add more integration-style tests here for your main app setup
  // For instance, check if CORS headers are present or if JSON parsing works.
  // However, most specific API endpoint tests should go into their respective controller test files.
});
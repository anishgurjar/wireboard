process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');

describe('GET /api/health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Board API (in-memory store)', () => {
  const sessionId = `test-${Date.now()}`;

  it('GET unknown session returns empty board', async () => {
    const res = await request(app).get(`/api/board/${sessionId}`);
    expect(res.status).toBe(200);
    expect(res.body.elements).toEqual([]);
    expect(res.body.connectors).toEqual([]);
  });

  it('POST saves board and returns it', async () => {
    const payload = {
      elements: [{ id: '1', type: 'server', x: 10, y: 10, w: 130, h: 72, label: 'API Gateway' }],
      connectors: [{ id: 'c1', from: '1', to: '2', label: 'HTTP' }],
    };
    const res = await request(app)
      .post(`/api/board/${sessionId}`)
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.elements).toHaveLength(1);
    expect(res.body.elements[0].type).toBe('server');
    expect(res.body.connectors).toHaveLength(1);
  });

  it('GET returns the previously saved board', async () => {
    const res = await request(app).get(`/api/board/${sessionId}`);
    expect(res.status).toBe(200);
    expect(res.body.elements).toHaveLength(1);
    expect(res.body.connectors).toHaveLength(1);
  });

  it('POST overwrites existing board data', async () => {
    const res = await request(app)
      .post(`/api/board/${sessionId}`)
      .send({ elements: [], connectors: [] });

    expect(res.status).toBe(200);
    expect(res.body.elements).toHaveLength(0);
  });

  it('DELETE removes the board', async () => {
    const res = await request(app).delete(`/api/board/${sessionId}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('GET after DELETE returns empty board', async () => {
    const res = await request(app).get(`/api/board/${sessionId}`);
    expect(res.status).toBe(200);
    expect(res.body.elements).toEqual([]);
  });
});

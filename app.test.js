const request = require('supertest');
const app = require('./app');

describe("Test teams API", () => {
    Test("GET /api/teams", () => {
        return request(app
            .get('/api/teams')
            .expect(200);
        )
    })
})
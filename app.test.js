const request = require('supertest');
const app = require('./app');

describe('Listing the teams', () => {
    test('GET /api/teams', () => {
        return request(app)
            .get('/api/teams')
            .expect(200);
    });
});

describe('Listing a team by ID', () => {
    test('GET /api/teams/?id=BOS -valid ID', () => {
        return request(app)
            .get('/api/teams/?id=BOS')
            .expect(200);
    });
    test('GET /api/teams/?id=XXX -invalid ID', () => {
        return request(app)
            .get('/api/teams/?id=XXX')
            .expect(404);
    });
});

describe('Listing a team by position', () => {
    test('GET /api/teams/?position=12 -valid position', () => {
        return request(app)
            .get('/api/teams/?position=12')
            .expect(200);
    });
    test('GET /api/teams/?position=100 -invalid position', () => {
        return request(app)
            .get('/api/teams/?position=100')
            .expect(404);
    });
});

describe('Adding a fantasy team', () => {
    test('POST /api/teams -invalid team data', () => {
        const body = {
            name: '',
            gamesPlayed: -1,
            points: 'ten'
        };
        return request(app)
            .post('/api/teams')
            .send(body)
            .expect(400);
    });
    test('POST /api/teams -valid team data', () => {
        const body = {
            name: 'Durham Dinosaurs',
            gamesPlayed: 35,
            points: 38
        };
        return request(app)
            .post('/api/teams')
            .send(body)
            .expect(201);
    });
    test('POST /api/teams -already have a fantasy team', () => {
        const body = {
            name: 'Durham Dinosaurs',
            gamesPlayed: 35,
            points: 38
        };
        return request(app)
            .post('/api/teams')
            .send(body)
            .expect(409);
    });
});

describe('Deleting a fantasy team', () => {
    test('DELETE /api/teams/FAN -valid team ID', () => {
        return request(app)
            .delete('/api/teams/FAN')
            .expect(200);
    });
    test('DELETE /api/teams/XXX -invalid team ID', () => {
        return request(app)
            .delete('/api/teams/XXX')
            .expect(403);
    });
});

describe('Listing the matches', () => {
    test('GET /api/matches', () => {
        return request(app)
            .get('/api/matches')
            .expect(200);
    });
});

describe('Listing a match by ID', () => {
    test('GET /api/matches/?id=1191 -valid ID', () => {
        return request(app)
            .get('/api/matches/?id=1191')
            .expect(200);
    });
    test('GET /api/matches/?id=100 -invalid ID', () => {
        return request(app)
            .get('/api/matches/?id=100')
            .expect(404);
    });
});

describe('Listing the next match', () => {
    test('GET /api/matches/next', () => {
        return request(app)
            .get('/api/matches/next')
            .expect(200);
    });
});

describe('Adding a fantasy match', () => {
    test('POST /api/matches -valid match data', () => {
        const body = {
            away: 'BOS',
            home: 'CGY',
            odds: 60,
            datetime: '2025-01-30T18:00'
        };
        return request(app)
            .post('/api/matches')
            .send(body)
            .expect(201);
    });
    test('POST /api/matches -invalid match data', () => {
        const body = {
            away: 'XXX',
            home: 'YYY',
            odds: -10,
            datetime: 'tomorrow'
        };
        return request(app)
            .post('/api/matches')
            .send(body)
            .expect(400);
    });
});

describe('Voting on a match', () => {
    test('PATCH /api/matches/1192/vote -valid add-vote data', () => {
        const body = {
            team: 'DET',
            vote: 1
        };
        return request(app)
            .patch('/api/matches/1192/vote')
            .send(body)
            .expect(200);
    });
    test('PATCH /api/matches/1192/vote -valid remove-vote data', () => {
        const body = {
            team: 'DET',
            vote: -1
        };
        return request(app)
            .patch('/api/matches/1192/vote')
            .send(body)
            .expect(200);
    });
    test('PATCH /api/matches/1192/vote -invalid vote data', () => {
        const body = {
            team: 'XXX',
            vote: 100
        };
        return request(app)
            .patch('/api/matches/1192/vote')
            .send(body)
            .expect(400);
    });
    test('PATCH /api/matches/100/vote -invalid match ID', () => {
        const body = {
            team: 'DET',
            vote: 1
        };
        return request(app)
            .patch('/api/matches/100/vote')
            .send(body)
            .expect(404);
    });
    test('PATCH /api/matches/F1/vote -fantasy match ID', () => {
        const body = {
            team: 'BOS',
            vote: 1
        };
        return request(app)
            .patch('/api/matches/F1/vote')
            .send(body)
            .expect(403);
    });
});

describe('Deleting a fantasy match', () => {
    test('DELETE /api/matches/F1 -valid match ID', () => {
        return request(app)
            .delete('/api/matches/F1')
            .expect(200);
    });
    test('DELETE /api/matches/XXX -invalid match ID', () => {
        return request(app)
            .delete('/api/matches/XXX')
            .expect(404);
    });
    test('DELETE /api/matches/1191 -real match ID', () => {
        return request(app)
            .delete('/api/matches/1191')
            .expect(403);
    });
});

describe('Viewing the standings', () => {
    test('GET /api/standings', () => {
        return request(app)
            .get('/api/standings')
            .expect(200);
    });
});

describe('Viewing the schedule', () => {
    test('GET /api/schedule', () => {
        return request(app)
            .get('/api/schedule')
            .expect(200);
    });
});

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import express from 'express';
import cookieParser from 'cookie-parser';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import authRouter from '../routes/auth-router';
import storeRouter from '../routes/store-router';
import songRouter from '../routes/song-router';
import Playlist from '../models/playlist-model';
import Song from '../models/song-model';
import User from '../models/user-model';

// Spin up an express app with the existing routers
function createApp() {
    const app = express();
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cookieParser());
    app.use('/auth', authRouter);
    app.use('/store', storeRouter);
    app.use('/songs', songRouter);
    return app;
}

describe('Final project API (memory Mongo)', () => {
    let mongo;
    let app;
    let agent;
    const testUser = {
        userName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
    };

    beforeAll(async () => {
        process.env.JWT_SECRET = 'testsecret';
        mongo = await MongoMemoryServer.create();
        const uri = mongo.getUri();
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        app = createApp();
        agent = request.agent(app);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        if (mongo) await mongo.stop();
    });

    it('registers and logs in a user', async () => {
        const reg = await agent
            .post('/auth/register')
            .send({
                userName: testUser.userName,
                email: testUser.email,
                password: testUser.password,
                passwordVerify: testUser.password,
            })
            .expect(200);
        expect(reg.body.success).toBe(true);

        const login = await agent
            .post('/auth/login')
            .send({ email: testUser.email, password: testUser.password })
            .expect(200);
        expect(login.body.user.email).toBe(testUser.email);
        expect(login.headers['set-cookie']).toBeDefined();
    });

    it('creates a playlist and increments listens on play', async () => {
        const createRes = await agent
            .post('/store/playlist')
            .send({ name: 'My List', songs: [], ownerEmail: testUser.email })
            .expect(201);
        const playlistId = createRes.body.playlist._id;
        expect(createRes.body.playlist.name).toBe('My List');

        const listenRes = await agent.post(`/store/playlist/${playlistId}/listen`).expect(200);
        expect(listenRes.body.listens).toBe(1);

        const fetched = await agent.get(`/store/playlist/${playlistId}`).expect(200);
        expect(fetched.body.playlist.listens).toBe(1);
    });

    it('creates a song, rejects duplicate, listens, copies, and adds to playlist', async () => {
        // Create playlist for add-to-playlist
        const plRes = await agent
            .post('/store/playlist')
            .send({ name: 'SongBucket', songs: [], ownerEmail: testUser.email })
            .expect(201);
        const playlistId = plRes.body.playlist._id;

        // Create song
        const createSong = await agent
            .post('/songs')
            .send({ title: 'UniqueSong', artist: 'Tester', year: 2024, youTubeId: 'dQw4w9WgXcQ' })
            .expect(201);
        const songId = createSong.body.song._id;

        // Duplicate should fail
        await agent
            .post('/songs')
            .send({ title: 'UniqueSong', artist: 'Tester', year: 2024, youTubeId: 'dup' })
            .expect(400);

        // Listen increments
        const listenSong = await agent.post(`/songs/listen/${songId}`).expect(200);
        expect(listenSong.body.listens).toBe(1);

        // Copy song assigns to current user and unique title
        const copy = await agent.post(`/songs/copy/${songId}`).expect(201);
        expect(copy.body.song.ownerEmail).toBe(testUser.email);
        expect(copy.body.song.title).not.toBe('UniqueSong'); // Should have a copy suffix

        // Add original song to playlist (owner required)
        const addResp = await agent
            .post('/songs/add-to-playlist')
            .send({ songId, playlistId })
            .expect(200);
        expect(addResp.body.playlist.songs.length).toBe(1);
    });
});

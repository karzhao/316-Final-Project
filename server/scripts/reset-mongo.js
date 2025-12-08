const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Playlist = require('../models/playlist-model');
const User = require('../models/user-model');
const Song = require('../models/song-model');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

/**
 * Reset Mongo data using server/test/data/PlaylisterDataWithSongs.json.
 * - Drops playlists, users, songs collections
 * - Inserts users, playlists, songs from the JSON file
 */
async function run() {
    const mongoUri = process.env.MONGO_URI || process.env.DB_CONNECT || 'mongodb://127.0.0.1:27017/playlister';
    console.log('Connecting to', mongoUri);
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    const dataPath = path.join(__dirname, '..', 'test', 'data', 'PlaylisterDataWithSongs.json');
    const fallbackPath = path.join(__dirname, '..', 'test', 'data', 'PlaylisterData.json');
    const raw = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(raw);

    console.log('Dropping collections...');
    await Playlist.deleteMany({});
    await User.deleteMany({});
    if (Song && Song.deleteMany) await Song.deleteMany({});

    console.log('Inserting users...');
    const users = (data.users || []).map((u) => {
        const email = (u.email || '').toLowerCase();
        const userName = (u.userName || u.name || email.split('@')[0] || 'user').trim();
        const passwordHash = bcrypt.hashSync('password', 10);
        return { userName, email, passwordHash, avatar: u.avatar || "", playlists: [] };
    });
    const userDocs = await User.insertMany(users, { ordered: false });
    const userEmailToId = new Map(userDocs.map(u => [u.email, u._id]));

    console.log('Inserting playlists...');
    let playlists = data.playlists || [];
    if (!playlists.length && fs.existsSync(fallbackPath)) {
        try {
            const rawFallback = fs.readFileSync(fallbackPath, 'utf8');
            const jsonFallback = JSON.parse(rawFallback);
            playlists = jsonFallback.playlists || [];
            console.log('Loaded playlists from PlaylisterData.json fallback');
        } catch (e) {
            console.warn('Failed to load fallback playlists', e.message);
        }
    }
    const playlistDocs = await Playlist.insertMany(playlists.map(p => ({
        name: p.name,
        songs: (p.songs || []).map((s) => ({ ...s, ownerEmail: (p.ownerEmail || '').toLowerCase() })),
        ownerEmail: (p.ownerEmail || '').toLowerCase()
    })));

    // attach playlist ids to user.playlists
    const userPlaylistsMap = {};
    playlistDocs.forEach(pl => {
        if (!userPlaylistsMap[pl.ownerEmail]) userPlaylistsMap[pl.ownerEmail] = [];
        userPlaylistsMap[pl.ownerEmail].push(pl._id);
    });
    for (const [email, ids] of Object.entries(userPlaylistsMap)) {
        const _id = userEmailToId.get(email);
        if (_id) {
            await User.updateOne({ _id }, { $set: { playlists: ids } });
        }
    }

    console.log('Inserting songs into catalog...');
    let songs = data.songs || [];
    // If songs array missing/empty, derive from playlists
    if ((!songs || !songs.length) && playlists.length) {
        const seen = new Set();
        songs = playlists.flatMap((p) =>
            (p.songs || []).map((s) => {
                const key = `${s.title}|${s.artist}|${s.year}`;
                if (seen.has(key)) return null;
                seen.add(key);
                return { ...s, ownerEmail: (p.ownerEmail || '').toLowerCase() };
            }).filter(Boolean)
        );
    }
    if (songs.length && Song && Song.insertMany) {
        try {
            await Song.insertMany(songs.map((s) => ({ ...s, ownerEmail: (s.ownerEmail || '').toLowerCase() })), { ordered: false });
        } catch (e) {
            // Ignore duplicate key errors; log others
            if (!(e && e.code === 11000)) {
                console.warn('Song insert error:', e.message);
            }
        }
    }

    console.log('Done. Users:', users.length, 'Playlists:', playlists.length, 'Songs:', songs.length);
    await mongoose.disconnect();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});

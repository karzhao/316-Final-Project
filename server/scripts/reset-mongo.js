const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Playlist = require('../models/playlist-model');
const User = require('../models/user-model');
const Song = require('../models/song-model');
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
    const raw = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(raw);

    console.log('Dropping collections...');
    await Playlist.deleteMany({});
    await User.deleteMany({});
    if (Song && Song.deleteMany) await Song.deleteMany({});

    console.log('Inserting users...');
    const users = data.users || [];
    const userDocs = await User.insertMany(users.map(u => ({
        name: u.name,
        email: u.email,
        playlists: []
    })));
    const userEmailToId = new Map(userDocs.map(u => [u.email, u._id]));

    console.log('Inserting playlists...');
    const playlists = data.playlists || [];
    const playlistDocs = await Playlist.insertMany(playlists.map(p => ({
        name: p.name,
        songs: p.songs || [],
        ownerEmail: p.ownerEmail
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

    console.log('Inserting songs...');
    const songs = data.songs || [];
    if (songs.length && Song && Song.insertMany) {
        await Song.insertMany(songs);
    }

    console.log('Done. Users:', users.length, 'Playlists:', playlists.length, 'Songs:', songs.length);
    await mongoose.disconnect();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});

const Song = require('../models/song-model');
const Playlist = require('../models/playlist-model');
const User = require('../models/user-model');
const auth = require('../auth');

const createSong = async (req, res) => {
    try {
        const userId = auth.verifyUser(req);
        if (!userId) return res.status(401).json({ errorMessage: "Unauthorized" });

        const { title, artist, year, youTubeId } = req.body;
        if (!title || !artist || !year || !youTubeId) {
            return res.status(400).json({ errorMessage: "Please provide all fields." });
        }
        const owner = await User.findById(userId);
        const existing = await Song.findOne({ title, artist, year });
        if (existing) {
            return res.status(400).json({ errorMessage: "Song with that title/artist/year already exists." });
        }
        const song = new Song({ title, artist, year, youTubeId, ownerEmail: owner.email });
        const saved = await song.save();
        return res.status(201).json({ success: true, song: saved });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ errorMessage: "Server error creating song." });
    }
};

const getSongs = async (req, res) => {
    try {
        const { title, artist, year, owner, sort } = req.query;
        const query = {};
        if (title) query.title = { $regex: title, $options: 'i' };
        if (artist) query.artist = { $regex: artist, $options: 'i' };
        if (year) query.year = Number(year);
        if (owner) query.ownerEmail = { $regex: owner, $options: 'i' };

        let sortObj = {};
        switch (sort) {
            case 'listens-desc': sortObj = { listens: -1 }; break;
            case 'listens-asc': sortObj = { listens: 1 }; break;
            case 'playlists-desc': sortObj = { playlistsCount: -1 }; break;
            case 'playlists-asc': sortObj = { playlistsCount: 1 }; break;
            case 'title-asc': sortObj = { title: 1 }; break;
            case 'title-desc': sortObj = { title: -1 }; break;
            case 'artist-asc': sortObj = { artist: 1 }; break;
            case 'artist-desc': sortObj = { artist: -1 }; break;
            case 'year-asc': sortObj = { year: 1 }; break;
            case 'year-desc': sortObj = { year: -1 }; break;
            default: sortObj = { createdAt: -1 };
        }

        const songs = await Song.find(query).sort(sortObj);
        return res.status(200).json({ success: true, songs });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ errorMessage: "Server error loading songs." });
    }
};

const updateSong = async (req, res) => {
    try {
        const userId = auth.verifyUser(req);
        if (!userId) return res.status(401).json({ errorMessage: "Unauthorized" });

        const song = await Song.findById(req.params.id);
        if (!song) return res.status(404).json({ errorMessage: "Song not found" });

        const owner = await User.findById(userId);
        if (song.ownerEmail !== owner.email) {
            return res.status(403).json({ errorMessage: "Only the owner can edit this song." });
        }

        const { title, artist, year, youTubeId } = req.body;
        song.title = title || song.title;
        song.artist = artist || song.artist;
        song.year = year || song.year;
        song.youTubeId = youTubeId || song.youTubeId;
        await song.save();
        return res.status(200).json({ success: true, song });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ errorMessage: "Server error updating song." });
    }
};

const deleteSong = async (req, res) => {
    try {
        const userId = auth.verifyUser(req);
        if (!userId) return res.status(401).json({ errorMessage: "Unauthorized" });

        const song = await Song.findById(req.params.id);
        if (!song) return res.status(404).json({ errorMessage: "Song not found" });

        const owner = await User.findById(userId);
        if (song.ownerEmail !== owner.email) {
            return res.status(403).json({ errorMessage: "Only the owner can delete this song." });
        }

        // remove from playlists
        await Playlist.updateMany(
            { "songs.title": song.title, "songs.artist": song.artist, "songs.year": song.year },
            { $pull: { songs: { title: song.title, artist: song.artist, year: song.year } } }
        );
        await song.deleteOne();
        return res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ errorMessage: "Server error deleting song." });
    }
};

const addSongToPlaylist = async (req, res) => {
    try {
        const userId = auth.verifyUser(req);
        if (!userId) return res.status(401).json({ errorMessage: "Unauthorized" });
        const { songId, playlistId } = req.body;
        const owner = await User.findById(userId);
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) return res.status(404).json({ errorMessage: "Playlist not found" });
        if (playlist.ownerEmail !== owner.email) {
            return res.status(403).json({ errorMessage: "Only the owner can modify this playlist." });
        }
        const song = await Song.findById(songId);
        if (!song) return res.status(404).json({ errorMessage: "Song not found" });

        playlist.songs.push({
            title: song.title,
            artist: song.artist,
            year: song.year,
            youTubeId: song.youTubeId
        });
        await playlist.save();
        song.playlistsCount += 1;
        await song.save();
        return res.status(200).json({ success: true, playlist });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ errorMessage: "Server error adding song to playlist." });
    }
};

module.exports = {
    createSong,
    getSongs,
    updateSong,
    deleteSong,
    addSongToPlaylist
};

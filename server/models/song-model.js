const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SongSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        artist: { type: String, required: true, trim: true },
        year: { type: Number, required: true },
        youTubeId: { type: String, required: true, trim: true },
        ownerEmail: { type: String, required: true, lowercase: true, trim: true },
        listens: { type: Number, default: 0 },
        playlistsCount: { type: Number, default: 0 }
    },
    { timestamps: true }
);

SongSchema.index({ title: 1, artist: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Song', SongSchema);

const express = require('express');
const router = express.Router();
const SongController = require('../controllers/song-controller');
const auth = require('../auth');

router.get('/', SongController.getSongs);
router.post('/', auth.verify, SongController.createSong);
router.put('/:id', auth.verify, SongController.updateSong);
router.delete('/:id', auth.verify, SongController.deleteSong);
router.post('/add-to-playlist', auth.verify, SongController.addSongToPlaylist);
router.post('/copy/:id', auth.verify, SongController.copySong);
router.post('/listen/:id', SongController.listenSong);

module.exports = router;

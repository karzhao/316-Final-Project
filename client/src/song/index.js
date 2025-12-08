import axios from 'axios';
axios.defaults.withCredentials = true;
const api = axios.create({ baseURL: 'http://localhost:4000/songs' });

export const getSongs = (params) => api.get('/', { params });
export const createSong = (title, artist, year, youTubeId) => api.post('/', { title, artist, year, youTubeId });
export const updateSong = (id, data) => api.put(`/${id}`, data);
export const deleteSong = (id) => api.delete(`/${id}`);
export const addSongToPlaylist = (songId, playlistId) => api.post('/add-to-playlist', { songId, playlistId });
export const copySong = (id) => api.post(`/copy/${id}`);

const songApis = {
    getSongs,
    createSong,
    updateSong,
    deleteSong,
    addSongToPlaylist,
    copySong
};

export default songApis;

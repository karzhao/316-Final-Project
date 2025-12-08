import React, { useContext, useEffect, useMemo, useState } from 'react';
import AuthContext from '../auth';
import { GlobalStoreContext } from '../store';
import songApis from '../song';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import MUIRemoveSongModal from './MUIRemoveSongModal';

const sortOptions = [
    { value: 'listens-desc', label: 'Listens (Hi-Lo)' },
    { value: 'listens-asc', label: 'Listens (Lo-Hi)' },
    { value: 'playlists-desc', label: 'Playlists (Hi-Lo)' },
    { value: 'playlists-asc', label: 'Playlists (Lo-Hi)' },
    { value: 'title-asc', label: 'Title (A-Z)' },
    { value: 'title-desc', label: 'Title (Z-A)' },
    { value: 'artist-asc', label: 'Artist (A-Z)' },
    { value: 'artist-desc', label: 'Artist (Z-A)' },
    { value: 'year-asc', label: 'Year (Lo-Hi)' },
    { value: 'year-desc', label: 'Year (Hi-Lo)' },
];

export default function SongCatalogScreen() {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    const [filters, setFilters] = useState({ title: '', artist: '', year: '' });
    const [sortValue, setSortValue] = useState('listens-desc');
    const [songs, setSongs] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSong, setEditingSong] = useState(null);
    const [songForm, setSongForm] = useState({ title: '', artist: '', year: '', youTubeId: '' });
    const [addMenu, setAddMenu] = useState({ open: false, songId: null });
    const [removeModal, setRemoveModal] = useState({ open: false, song: null });

    useEffect(() => {
        if (auth.loggedIn) {
            store.loadIdNamePairs();
        }
    }, [auth.loggedIn]);

    const loadSongs = async () => {
        const params = {
            title: filters.title || undefined,
            artist: filters.artist || undefined,
            year: filters.year || undefined,
            sort: sortValue
        };
        const response = await songApis.getSongs(params);
        if (response.data.success) {
            setSongs(response.data.songs);
        }
    };

    useEffect(() => {
        loadSongs();
    }, [sortValue]);

    const handleSearch = () => {
        loadSongs();
    };

    const handleClear = () => {
        setFilters({ title: '', artist: '', year: '' });
        loadSongs();
    };

    const openNewSong = () => {
        setEditingSong(null);
        setSongForm({ title: '', artist: '', year: '', youTubeId: '' });
        setModalOpen(true);
    };

    const openEditSong = (song) => {
        setEditingSong(song);
        setSongForm({
            title: song.title,
            artist: song.artist,
            year: song.year,
            youTubeId: song.youTubeId
        });
        setModalOpen(true);
    };

    const handleSaveSong = async () => {
        const { title, artist, year, youTubeId } = songForm;
        if (!title || !artist || !year || !youTubeId) return;
        if (editingSong) {
            await songApis.updateSong(editingSong._id, { title, artist, year, youTubeId });
        } else {
            await songApis.createSong(title, artist, year, youTubeId);
        }
        setModalOpen(false);
        loadSongs();
    };

    const handleDeleteSong = async (song) => {
        if (!auth.loggedIn || auth.user?.email !== song.ownerEmail) return;
        setRemoveModal({ open: true, song });
    };

    const confirmDeleteSong = async () => {
        if (!removeModal.song) return;
        await songApis.deleteSong(removeModal.song._id);
        setRemoveModal({ open: false, song: null });
        loadSongs();
    };

    const handleAddToPlaylist = async (playlistId) => {
        if (!addMenu.songId) return;
        await songApis.addSongToPlaylist(addMenu.songId, playlistId);
        setAddMenu({ open: false, songId: null });
    };

    const ownedEmail = auth.user?.email || "";

    const filteredSongs = useMemo(() => songs, [songs]);

    return (
        <Box sx={{ padding: 2, bgcolor: '#fff9f0', borderRadius: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Songs Catalog</Typography>
                    <Stack spacing={1.5}>
                        <TextField label="by Title" value={filters.title} onChange={(e) => setFilters({ ...filters, title: e.target.value })} />
                        <TextField label="by Artist" value={filters.artist} onChange={(e) => setFilters({ ...filters, artist: e.target.value })} />
                        <TextField label="by Year" value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button variant="contained" onClick={handleSearch}>Search</Button>
                            <Button variant="outlined" onClick={handleClear}>Clear</Button>
                        </Box>
                    </Stack>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <TextField
                            select
                            label="Sort"
                            value={sortValue}
                            onChange={(e) => setSortValue(e.target.value)}
                            size="small"
                        >
                            {sortOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                        </TextField>
                        <Typography variant="body1">{filteredSongs.length} Songs</Typography>
                    </Box>
                    <Stack spacing={1.5}>
                        {filteredSongs.map((song) => {
                            const owned = ownedEmail && song.ownerEmail === ownedEmail;
                            return (
                                <Card key={song._id} sx={{ border: owned ? '2px solid #0f7b2f' : '1px solid #ddd' }}>
                                    <CardContent>
                                        <Typography variant="h6">{song.title} ({song.year})</Typography>
                                        <Typography variant="subtitle2" color="text.secondary">{song.artist}</Typography>
                                        <Typography variant="caption">Listens: {song.listens || 0} | Playlists: {song.playlistsCount || 0}</Typography>
                                    </CardContent>
                                    <CardActions>
                                        {auth.loggedIn && (
                                            <Button size="small" variant="contained" onClick={() => setAddMenu({ open: true, songId: song._id })}>
                                                Add to Playlist
                                            </Button>
                                        )}
                                        {owned && (
                                            <>
                                                <IconButton onClick={() => openEditSong(song)}><EditIcon /></IconButton>
                                                <IconButton onClick={() => handleDeleteSong(song)}><DeleteIcon /></IconButton>
                                            </>
                                        )}
                                    </CardActions>
                                </Card>
                            );
                        })}
                    </Stack>
                    {auth.loggedIn && (
                        <Box sx={{ mt: 2 }}>
                            <Button startIcon={<AddIcon />} variant="contained" onClick={openNewSong}>New Song</Button>
                        </Box>
                    )}
                </Grid>
            </Grid>

            <Dialog
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                PaperProps={{
                    sx: {
                        bgcolor: '#b7f4b7',
                        border: '2px solid #16752d',
                        borderRadius: 2,
                        minWidth: 400,
                        maxWidth: '90vw'
                    }
                }}
            >
                <DialogTitle sx={{ bgcolor: '#0f7b2f', color: 'white', fontWeight: 'bold', pb: 1 }}>
                    {editingSong ? "Edit Song" : "New Song"}
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <TextField label="Title" value={songForm.title} onChange={(e) => setSongForm({ ...songForm, title: e.target.value })} />
                    <TextField label="Artist" value={songForm.artist} onChange={(e) => setSongForm({ ...songForm, artist: e.target.value })} />
                    <TextField label="Year" value={songForm.year} onChange={(e) => setSongForm({ ...songForm, year: e.target.value })} />
                    <TextField label="YouTube Id" value={songForm.youTubeId} onChange={(e) => setSongForm({ ...songForm, youTubeId: e.target.value })} />
                </DialogContent>
                <DialogActions sx={{ pb: 2, pr: 2 }}>
                    <Button variant="contained" color="inherit" onClick={() => setModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="success" onClick={handleSaveSong} disabled={!songForm.title || !songForm.artist || !songForm.year || !songForm.youTubeId}>Complete</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={addMenu.open} onClose={() => setAddMenu({ open: false, songId: null })}>
                <DialogTitle>Add to Playlist</DialogTitle>
                <DialogContent>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                        {store.idNamePairs.map((p) => (
                            <Button key={p._id} variant="outlined" onClick={() => handleAddToPlaylist(p._id)}>
                                {p.name}
                            </Button>
                        ))}
                        {store.idNamePairs.length === 0 && <Typography variant="body2">No owned playlists.</Typography>}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddMenu({ open: false, songId: null })}>Close</Button>
                </DialogActions>
            </Dialog>

            <MUIRemoveSongModal
                open={removeModal.open}
                songTitle={removeModal.song?.title || "this song"}
                onConfirm={confirmDeleteSong}
                onCancel={() => setRemoveModal({ open: false, song: null })}
            />
        </Box>
    );
}

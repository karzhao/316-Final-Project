import { useContext, useEffect, useMemo, useState } from 'react'
import { GlobalStoreContext } from '../store'
import PlaylistCard from './PlaylistCard.js'
import MUIDeleteModal from './MUIDeleteModal'
import storeRequestSender from '../store/requests'

import AddIcon from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab'
import List from '@mui/material/List';
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MUIEditPlaylistModal from './MUIEditPlaylistModal';

/*
    Playlists screen with filters, sort, play/edit/delete/copy actions.
*/
const sortOptions = [
    { value: 'listeners-desc', label: 'Listeners (Hi-Lo)' },
    { value: 'listeners-asc', label: 'Listeners (Lo-Hi)' },
    { value: 'name-asc', label: 'Playlist Name (A-Z)' },
    { value: 'name-desc', label: 'Playlist Name (Z-A)' },
    { value: 'owner-asc', label: 'Owner (A-Z)' },
    { value: 'owner-desc', label: 'Owner (Z-A)' },
];

const HomeScreen = ({ guestMode = false }) => {
    const { store } = useContext(GlobalStoreContext);
    const [allPlaylists, setAllPlaylists] = useState([]);
    const [filters, setFilters] = useState({
        name: '',
        owner: '',
        songTitle: '',
        songArtist: '',
        songYear: ''
    });
    const [appliedFilters, setAppliedFilters] = useState({
        name: '',
        owner: '',
        songTitle: '',
        songArtist: '',
        songYear: ''
    });
    const [sortValue, setSortValue] = useState('listeners-desc');
    const [editModalPlaylist, setEditModalPlaylist] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                const response = guestMode
                    ? await storeRequestSender.getPublicPlaylists()
                    : await storeRequestSender.getPlaylists();
                if (response.data.success) {
                    setAllPlaylists(response.data.data);
                }
            } catch (err) {
                console.error("Failed to load playlists", err);
            }
        }
        load();
        const off = store.addPlaylistListener(load);
        return () => { if (off) off(); }
    }, [guestMode]);

    const filtered = useMemo(() => {
        const name = appliedFilters.name.toLowerCase();
        const owner = appliedFilters.owner.toLowerCase();
        const songTitle = appliedFilters.songTitle.toLowerCase();
        const songArtist = appliedFilters.songArtist.toLowerCase();
        const songYear = appliedFilters.songYear.trim();

        let result = allPlaylists.filter((p) => {
            const matchesName = !name || p.name?.toLowerCase().includes(name);
            const matchesOwner = !owner || (p.ownerName || p.ownerEmail || "").toLowerCase().includes(owner);
            const matchesSong = !songTitle && !songArtist && !songYear ? true : (p.songs || []).some((s) => {
                const titleOk = !songTitle || s.title.toLowerCase().includes(songTitle);
                const artistOk = !songArtist || s.artist.toLowerCase().includes(songArtist);
                const yearOk = !songYear || (String(s.year) === songYear);
                return titleOk && artistOk && yearOk;
            });
            return matchesName && matchesOwner && matchesSong;
        });

        const listenersVal = (p) => p.listeners || 0;
        const ownerVal = (p) => (p.ownerName || p.ownerEmail || "").toLowerCase();
        switch (sortValue) {
            case 'listeners-asc':
                result.sort((a, b) => listenersVal(a) - listenersVal(b));
                break;
            case 'listeners-desc':
                result.sort((a, b) => listenersVal(b) - listenersVal(a));
                break;
            case 'name-asc':
                result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
                break;
            case 'name-desc':
                result.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
                break;
            case 'owner-asc':
                result.sort((a, b) => ownerVal(a).localeCompare(ownerVal(b)));
                break;
            case 'owner-desc':
                result.sort((a, b) => ownerVal(b).localeCompare(ownerVal(a)));
                break;
            default:
                break;
        }

        return result;
    }, [allPlaylists, filters, sortValue]);

    function handleCreateNewList() {
        (async () => {
            const newList = await store.createNewList();
            if (newList) {
                setEditModalPlaylist(newList);
            }
        })();
    }

    const handleFilterChange = (field) => (event) => {
        setFilters({ ...filters, [field]: event.target.value });
    };

    const applySearch = () => {
        setAppliedFilters(filters);
    };

    const handleClear = () => {
        const cleared = {
            name: '',
            owner: '',
            songTitle: '',
            songArtist: '',
            songYear: ''
        };
        setFilters(cleared);
        setAppliedFilters(cleared);
    };

    useEffect(() => {
        setAppliedFilters(filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            applySearch();
        }
    };

    return (
        <Grid container spacing={2} sx={{ padding: 2, bgcolor: '#fff9f0', borderRadius: 2 }}>
            <Grid item xs={12} md={4}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Playlists</Typography>
                <Stack spacing={1.5}>
                    <TextField label="by Playlist Name" value={filters.name} onChange={handleFilterChange('name')} onKeyDown={handleKeyDown} />
                    <TextField label="by User Name" value={filters.owner} onChange={handleFilterChange('owner')} onKeyDown={handleKeyDown} />
                    <TextField label="by Song Title" value={filters.songTitle} onChange={handleFilterChange('songTitle')} onKeyDown={handleKeyDown} />
                    <TextField label="by Song Artist" value={filters.songArtist} onChange={handleFilterChange('songArtist')} onKeyDown={handleKeyDown} />
                    <TextField label="by Song Year" value={filters.songYear} onChange={handleFilterChange('songYear')} onKeyDown={handleKeyDown} />
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Button variant="contained" onClick={applySearch}>Search</Button>
                        <Button variant="outlined" onClick={handleClear}>Clear</Button>
                    </Box>
                </Stack>
                {!guestMode && (
                    <Box sx={{ mt: 2 }}>
                        <Fab color="primary" aria-label="add" onClick={handleCreateNewList}>
                            <AddIcon />
                        </Fab>
                    </Box>
                )}
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
                        {sortOptions.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                    </TextField>
                    <Typography variant="body1">{filtered.length} Playlists</Typography>
                </Box>
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {filtered.map((playlist) => (
                        <PlaylistCard
                            key={playlist._id}
                            idNamePair={{ _id: playlist._id, name: playlist.name }}
                            playlist={playlist}
                            readOnly={guestMode}
                        />
                    ))}
                </List>
                <MUIDeleteModal />
            </Grid>
            <MUIEditPlaylistModal
                open={Boolean(editModalPlaylist)}
                playlistName={editModalPlaylist?.name || ""}
                owner={editModalPlaylist?.ownerEmail || ""}
                songs={editModalPlaylist?.songs || []}
                onRename={(name) => setEditModalPlaylist(p => ({...p, name}))}
                onConfirm={() => setEditModalPlaylist(null)}
                onClose={() => setEditModalPlaylist(null)}
                onGoCatalog={() => window.location.href = "/catalog/"}
            />
        </Grid>
    );
}

export default HomeScreen;

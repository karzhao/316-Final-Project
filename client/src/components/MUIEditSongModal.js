import { useContext, useState } from 'react';
import GlobalStoreContext from '../store';
import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 420,
    bgcolor: '#b7f4b7',
    border: '2px solid #16752d',
    boxShadow: 24,
    borderRadius: 2,
    overflow: 'hidden',
    paddingBottom: 2
};

const headerStyle = {
    backgroundColor: '#0f7b2f',
    color: 'white',
    padding: '10px 16px',
    fontWeight: 'bold'
};

export default function MUIEditSongModal() {
    const { store } = useContext(GlobalStoreContext);
    const [ title, setTitle ] = useState(store.currentSong.title);
    const [ artist, setArtist ] = useState(store.currentSong.artist);
    const [ year, setYear ] = useState(store.currentSong.year);
    const [ youTubeId, setYouTubeId ] = useState(store.currentSong.youTubeId);

    const valid = title.trim() && artist.trim() && year && youTubeId.trim();

    function handleConfirmEditSong() {
        if (!valid) return;
        let newSongData = {
            title: title,
            artist: artist,
            year: year,
            youTubeId: youTubeId
        };
        store.addUpdateSongTransaction(store.currentSongIndex, newSongData);        
    }

    function handleCancelEditSong() {
        store.hideModals();
    }

    return (
        <Modal
            open={store.currentModal === "EDIT_SONG"}
        >
        <Box sx={modalStyle}>
            <Typography id="edit-song-modal-title" sx={headerStyle}>
                Edit Song
            </Typography>
            <Box sx={{padding: '16px 20px 8px 20px'}}>
                <Stack spacing={2}>
                    <TextField
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Artist"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Year"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="YouTube Id"
                        value={youTubeId}
                        onChange={(e) => setYouTubeId(e.target.value)}
                        fullWidth
                    />
                </Stack>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: '12px', padding: '0 20px 12px 20px' }}>
                <Button variant="contained" color="success" disabled={!valid} onClick={handleConfirmEditSong}>
                    Complete
                </Button>
                <Button variant="contained" color="inherit" onClick={handleCancelEditSong}>Cancel</Button>
            </Box>
        </Box>
        </Modal>
    );
}

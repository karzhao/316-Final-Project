import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

const baseStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 720,
    bgcolor: '#b7f4b7',
    border: '2px solid #16752d',
    boxShadow: 24,
    borderRadius: 2,
    overflow: 'hidden',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: 'auto 1fr auto'
};

const headerStyle = {
    gridColumn: '1 / span 2',
    backgroundColor: '#0f7b2f',
    color: 'white',
    padding: '10px 16px',
    fontWeight: 'bold'
};

const leftPane = {
    padding: '12px 12px 0 12px',
    overflowY: 'auto'
};

const rightPane = {
    padding: '12px'
};

const footerStyle = {
    gridColumn: '1 / span 2',
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '0 16px 12px 16px'
};

/**
 * Styling-only play playlist modal (green theme). Replace dummy data when wiring up.
 */
export default function MUIPlayPlaylistModal({
    open = false,
    playlistName = "Playlist Title",
    owner = "Owner Name",
    songs = [
        { title: "Song One", artist: "Artist A", year: 2000 },
        { title: "Song Two", artist: "Artist B", year: 2001 }
    ],
    onClose = () => {}
}) {
    return (
        <Modal open={open} aria-labelledby="play-playlist-title">
            <Box sx={baseStyle}>
                <Typography id="play-playlist-title" sx={headerStyle}>
                    Play Playlist
                </Typography>

                <Box sx={leftPane}>
                    <Typography variant="subtitle2" sx={{ color: '#1f3b1d', mb: 1 }}>
                        {playlistName}
                        <br />
                        <span style={{ color: '#2f5930' }}>{owner}</span>
                    </Typography>
                    <List sx={{ bgcolor: '#fff', borderRadius: 1, border: '1px solid #d6e9d6', maxHeight: 320, overflowY: 'auto' }}>
                        {songs.map((song, idx) => (
                            <React.Fragment key={idx}>
                                <ListItem dense button>
                                    <ListItemText primary={`${idx + 1}. ${song.title}`} secondary={`${song.artist} (${song.year})`} />
                                </ListItem>
                                {idx < songs.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                </Box>

                <Box sx={rightPane}>
                    <Box sx={{ bgcolor: '#ffffffb0', border: '1px solid #d6e9d6', borderRadius: 1, height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body2" color="#2f5930">Video player placeholder</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
                        <Button variant="outlined" size="small">⏮</Button>
                        <Button variant="outlined" size="small">⏯</Button>
                        <Button variant="outlined" size="small">⏭</Button>
                    </Box>
                </Box>

                <Box sx={footerStyle}>
                    <Button variant="contained" color="success" onClick={onClose}>Close</Button>
                </Box>
            </Box>
        </Modal>
    );
}

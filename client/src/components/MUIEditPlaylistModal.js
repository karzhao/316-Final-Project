import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';

const baseStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '75vw',
    maxWidth: 960,
    minWidth: 640,
    bgcolor: '#b7f4b7',
    border: '2px solid #16752d',
    boxShadow: 24,
    borderRadius: 2,
    overflow: 'hidden',
    display: 'grid',
    gridTemplateRows: 'auto auto 1fr auto',
    gridTemplateColumns: '1fr'
};

const headerStyle = {
    backgroundColor: '#0f7b2f',
    color: 'white',
    padding: '10px 16px',
    fontWeight: 'bold'
};

const controlsRow = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    backgroundColor: '#a5e4a5'
};

const listContainer = {
    padding: '12px 16px 0 16px',
    overflowY: 'auto'
};

const footerStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '0 16px 12px 16px'
};

/**
 * Styling-only edit playlist modal (green theme). Wire up handlers later.
 */
export default function MUIEditPlaylistModal({
    open = false,
    playlistName = "Playlist title",
    owner = "Owner Name",
    ownerAvatar = "",
    songs = [
        { title: "Song One", artist: "Artist A", year: 2000 },
        { title: "Song Two", artist: "Artist B", year: 2001 }
    ],
    onClose = () => {},
    onRename = () => {},
    onRemove = () => {},
    onMoveUp = () => {},
    onMoveDown = () => {}
}) {
    return (
        <Modal open={open} aria-labelledby="edit-playlist-title">
            <Box sx={baseStyle}>
                <Typography id="edit-playlist-title" sx={headerStyle}>
                    Edit Playlist
                </Typography>

                <Box sx={{ ...controlsRow, justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: '#0f7b2f' }} src={ownerAvatar || undefined}>
                            {owner ? owner.substring(0,2).toUpperCase() : ''}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Playlist Name"
                                value={playlistName}
                                onChange={(e) => onRename(e.target.value)}
                            />
                            <Typography variant="caption" sx={{ color: '#2f5930' }}>{owner}</Typography>
                        </Box>
                    </Box>
                    <Button variant="contained" color="success" size="small" sx={{ ml: 1 }}>+ / ↻</Button>
                </Box>

                <Box sx={listContainer}>
                    <List sx={{ bgcolor: '#fff', borderRadius: 1, border: '1px solid #d6e9d6' }}>
                        {songs.map((song, idx) => (
                            <ListItem
                                key={idx}
                                secondaryAction={
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <IconButton edge="end" size="small" onClick={() => onMoveUp(idx)}><DragIndicatorIcon fontSize="small" /></IconButton>
                                        <IconButton edge="end" size="small" onClick={() => onMoveDown(idx)}><DragIndicatorIcon fontSize="small" /></IconButton>
                                        <IconButton edge="end" size="small"><EditIcon fontSize="small" /></IconButton>
                                        <IconButton edge="end" size="small" onClick={() => onRemove(idx)}><DeleteIcon fontSize="small" /></IconButton>
                                    </Box>
                                }
                            >
                                <Typography variant="body2">{idx + 1}. {song.title} ({song.year}) by {song.artist}</Typography>
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <Box sx={footerStyle}>
                    <Button variant="contained" color="inherit" onClick={onClose}>Close</Button>
                </Box>
            </Box>
        </Modal>
    );
}

import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Avatar from '@mui/material/Avatar';

const baseStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '70vw',
    height: '75vh',
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
    justifyContent: 'space-between',
    gap: '12px',
    padding: '0 16px 12px 16px',
    alignItems: 'center'
};

/**
 * Edit Playlist modal (green theme) with undo/redo and song controls.
 */
export default function MUIEditPlaylistModal({
    open = false,
    playlistName = "Playlist title",
    owner = "Owner Name",
    ownerAvatar = "",
    songs = [],
    onClose = () => {},
    onConfirm = () => {},
    onGoCatalog = () => {},
    onRename = () => {},
    onRenameCommit = () => {},
    onRemove = () => {},
    onReorder = () => {},
    onUndo = () => {},
    onRedo = () => {},
    canUndo = false,
    canRedo = false
}) {
    const [nameValue, setNameValue] = React.useState(playlistName);

    React.useEffect(() => {
        setNameValue(playlistName);
    }, [playlistName, open]);

    const commitRename = () => {
        onRenameCommit(nameValue);
    };

    const handleNameKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            commitRename();
        }
    };

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
                                value={nameValue}
                                onChange={(e) => {
                                    setNameValue(e.target.value);
                                    onRename(e.target.value);
                                }}
                                onBlur={commitRename}
                                onKeyDown={handleNameKeyDown}
                            />
                            <Typography variant="caption" sx={{ color: '#2f5930' }}>{owner}</Typography>
                        </Box>
                    </Box>
                </Box>

                <Box sx={listContainer}>
                    <List sx={{ bgcolor: '#fff', borderRadius: 1, border: '1px solid #d6e9d6' }}>
                        {songs.map((song, idx) => (
                            <ListItem
                                key={idx}
                                draggable
                                onDragStart={(e) => e.dataTransfer.setData('text/plain', String(idx))}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const from = Number(e.dataTransfer.getData('text/plain'));
                                    const to = idx;
                                    if (!Number.isNaN(from) && from !== to) {
                                        onReorder(from, to);
                                    }
                                }}
                                secondaryAction={
                                    <IconButton edge="end" size="small" onClick={() => onRemove(idx)} aria-label="remove song">
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                }
                            >
                                <Typography variant="body2">{idx + 1}. {song.title} ({song.year}) by {song.artist}</Typography>
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <Box sx={footerStyle}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="outlined" color="info" onClick={onGoCatalog}>Song Catalog</Button>
                        <Button variant="outlined" disabled={!canUndo} onClick={onUndo}>Undo</Button>
                        <Button variant="outlined" disabled={!canRedo} onClick={onRedo}>Redo</Button>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="contained" color="success" onClick={onConfirm}>Confirm Changes</Button>
                        <Button variant="contained" color="inherit" onClick={onClose}>Close</Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
}

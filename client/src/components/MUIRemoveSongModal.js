import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const baseStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 420,
    maxWidth: '90vw',
    bgcolor: '#b7f4b7',
    border: '2px solid #16752d',
    boxShadow: 24,
    borderRadius: 2,
    overflow: 'hidden'
};

const headerStyle = {
    backgroundColor: '#0f7b2f',
    color: 'white',
    padding: '10px 16px',
    fontWeight: 'bold'
};

const bodyStyle = {
    padding: '20px 20px 10px 20px',
    color: '#1f3b1d'
};

const actionsStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    padding: '0 20px 16px 20px'
};

/**
 * Styling-only remove song modal (green theme) ready to wire to data later.
 */
export default function MUIRemoveSongModal({
    open = false,
    songTitle = "this song",
    onConfirm = () => {},
    onCancel = () => {}
}) {
    return (
        <Modal open={open} aria-labelledby="remove-song-title" aria-describedby="remove-song-description">
            <Box sx={baseStyle}>
                <Typography id="remove-song-title" sx={headerStyle}>
                    Remove Song?
                </Typography>
                <Box sx={bodyStyle}>
                    <Typography id="remove-song-description" variant="h6" sx={{ fontWeight: 600 }}>
                        Are you sure you want to remove "{songTitle}" from the catalog?
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Doing so will remove it from all of your playlists.
                    </Typography>
                </Box>
                <Box sx={actionsStyle}>
                    <Button variant="contained" color="success" onClick={onConfirm}>Remove Song</Button>
                    <Button variant="contained" color="inherit" onClick={onCancel}>Cancel</Button>
                </Box>
            </Box>
        </Modal>
    );
}

import { useContext } from 'react';
import GlobalStoreContext from '../store';
import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

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

const actionStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    padding: '0 20px 20px 20px'
};

export default function MUIDeleteModal() {
    const { store } = useContext(GlobalStoreContext);
    let name = "";
    if (store.listMarkedForDeletion) {
        name = store.listMarkedForDeletion.name;
    }
    function handleDeleteList(event) {
        store.deleteMarkedList();
    }
    function handleCloseModal(event) {
        store.hideModals();
    }

    return (
        <Modal
        open={store.listMarkedForDeletion !== null}
        aria-labelledby="delete-playlist-title"
        aria-describedby="delete-playlist-description"
        >
        <Box sx={modalStyle}>
            <Typography id="delete-playlist-title" sx={headerStyle}>
                Delete playlist?
            </Typography>
            <Box sx={bodyStyle}>
                <Typography id="delete-playlist-description" variant="h6" sx={{ fontWeight: 600 }}>
                    Are you sure you want to delete the "{name}" playlist?
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Doing so means it will be permanently removed.
                </Typography>
            </Box>
            <Box sx={actionStyle}>
                <Button variant="contained" color="success" onClick={handleDeleteList}>Delete Playlist</Button>
                <Button variant="contained" color="inherit" onClick={handleCloseModal}>Cancel</Button>
            </Box>
        </Box>
    </Modal>
    );
}

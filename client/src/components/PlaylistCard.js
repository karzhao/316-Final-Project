import { useContext, useState } from 'react'
import { GlobalStoreContext } from '../store'
import AuthContext from '../auth';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import Button from '@mui/material/Button';
import MUIPlayPlaylistModal from './MUIPlayPlaylistModal';
import MUIEditPlaylistModal from './MUIEditPlaylistModal';
import storeRequestSender from '../store/requests';

/*
    This is a card in our list of top 5 lists. It lets select
    a list for editing and it has controls for changing its 
    name or deleting it.
    
    @author McKilla Gorilla
*/
function PlaylistCard(props) {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
    const { idNamePair, readOnly, playlist } = props;
    const [playOpen, setPlayOpen] = useState(false);
    const [playPlaylist, setPlayPlaylist] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editData, setEditData] = useState(playlist || null);
    const isOwner = !readOnly && auth.loggedIn && auth.user?.email && (playlist?.ownerEmail === auth.user.email || editData?.ownerEmail === auth.user.email);
    const [editName, setEditName] = useState(playlist?.name || idNamePair.name);

    function handleLoadList(event, id) {
        console.log("handleLoadList for " + id);
        if (!event.target.disabled) {
            let _id = event.target.id;
            if (_id.indexOf('list-card-text-') >= 0)
                _id = ("" + _id).substring("list-card-text-".length);

            console.log("load " + event.target.id);

            if (readOnly) {
                store.setCurrentListPublic(id);
            } else {
                store.setCurrentList(id);
            }
        }
    }

    async function handleDeleteList(event, id) {
        if (!isOwner) return;
        event.stopPropagation();
        //let _id = event.target.id;
        //_id = ("" + _id).substring("delete-list-".length);
        store.markListForDeletion(id);
    }

    async function handlePlayClick(event) {
        event.stopPropagation();
        if (playlist) {
            setPlayPlaylist(playlist);
            setPlayOpen(true);
            return;
        }
        try {
            const response = readOnly
                ? await storeRequestSender.getPublicPlaylistById(idNamePair._id)
                : await storeRequestSender.getPlaylistById(idNamePair._id);
            if (response.data.success) {
                setPlayPlaylist(response.data.playlist);
                setPlayOpen(true);
            }
        } catch (err) {
            console.error("Failed to load playlist for play", err);
        }
    }

    function handleCopy(event) {
        event.stopPropagation();
        store.copyPlaylist(idNamePair._id);
    }

    async function handleEditClick(event) {
        event.stopPropagation();
        if (playlist) {
            setEditData(playlist);
            setEditName(playlist.name);
            setEditOpen(true);
            return;
        }
        try {
            const response = await storeRequestSender.getPlaylistById(idNamePair._id);
            if (response.data.success) {
                setEditData(response.data.playlist);
                setEditName(response.data.playlist.name);
                setEditOpen(true);
            }
        } catch (err) {
            console.error("Failed to load playlist for edit", err);
        }
    }

    async function handleConfirmEdit() {
        if (!isOwner || !editData) {
            setEditOpen(false);
            return;
        }
        try {
            const updated = { ...editData, name: editName };
            await storeRequestSender.updatePlaylistById(idNamePair._id, updated);
            store.loadIdNamePairs();
            setEditData(updated);
        } catch (err) {
            console.error("Failed to save playlist name", err);
        }
        setEditOpen(false);
    }

    const playOwner = playPlaylist?.ownerName || playPlaylist?.ownerEmail || playlist?.ownerEmail || "";

    let cardElement =
        <ListItem
            id={idNamePair._id}
            key={idNamePair._id}
            sx={{borderRadius:"25px", p: "10px", bgcolor: '#8000F00F', marginTop: '15px', display: 'flex', alignItems: 'center' }}
            style={{ width: '100%' }}
            button
            onClick={(event) => {
                handleLoadList(event, idNamePair._id)
            }}
        >
            <Box sx={{ p: 1, flexGrow: 1, fontSize: '24px', fontWeight: 600, border: isOwner ? '2px solid #0f7b2f' : 'none', borderRadius: '12px' }}>
                {idNamePair.name}
                <Typography variant="caption" display="block" sx={{ color: '#444' }}>
                    {playlist?.ownerName || playlist?.ownerEmail || ""}
                </Typography>
            </Box>
            <Box sx={{ p: 1 }}>
                <Button size="small" variant="contained" color="primary" onClick={handlePlayClick}>Play</Button>
            </Box>
            {
                !readOnly && <>
                <Box sx={{ p: 1 }}>
                    <Button size="small" variant="contained" color="secondary" onClick={handleCopy}>Copy</Button>
                </Box>
                {isOwner && (
                    <Box sx={{ p: 1 }}>
                        <Button size="small" variant="contained" color="success" onClick={handleEditClick}>Edit</Button>
                    </Box>
                )}
                {isOwner && (
                    <Box sx={{ p: 1 }}>
                        <IconButton onClick={(event) => {
                                handleDeleteList(event, idNamePair._id)
                            }} aria-label='delete'>
                            <DeleteIcon style={{fontSize:'36pt'}} />
                        </IconButton>
                    </Box>
                )}
                </>
            }
        </ListItem>

    return (
        <>
            {cardElement}
            <MUIPlayPlaylistModal
                open={playOpen}
                playlistName={playPlaylist?.name || idNamePair.name}
                owner={playOwner}
                ownerAvatar={playPlaylist?.ownerAvatar || playlist?.ownerAvatar || ""}
                songs={playPlaylist?.songs || []}
                onClose={() => setPlayOpen(false)}
            />
            <MUIEditPlaylistModal
                open={editOpen}
                playlistName={editName}
                owner={playOwner}
                ownerAvatar={editData?.ownerAvatar || playlist?.ownerAvatar || ""}
                songs={editData?.songs || playlist?.songs || []}
                onGoCatalog={() => { window.location.href = "/catalog/"; }}
                onRename={(name) => setEditName(name)}
                onConfirm={handleConfirmEdit}
                onClose={() => setEditOpen(false)}
            />
        </>
    );
}

export default PlaylistCard;

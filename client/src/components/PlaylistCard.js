import { useContext, useState } from 'react'
import { GlobalStoreContext } from '../store'
import AuthContext from '../auth';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
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
    const [originalName, setOriginalName] = useState(playlist?.name || idNamePair.name);
    const [pendingRename, setPendingRename] = useState(null);

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
            storeRequestSender.listenPlaylist(playlist._id);
            return;
        }
        try {
            const response = readOnly
                ? await storeRequestSender.getPublicPlaylistById(idNamePair._id)
                : await storeRequestSender.getPlaylistById(idNamePair._id);
            if (response.data.success) {
                setPlayPlaylist(response.data.playlist);
                storeRequestSender.listenPlaylist(response.data.playlist._id);
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
        try {
            let data = playlist;
            if (!data) {
                data = await store.setCurrentListModal(idNamePair._id);
            } else {
                store.setCurrentListModal(idNamePair._id);
            }
            if (data) {
                setEditData(data);
                setEditName(data.name);
                setOriginalName(data.name);
                setPendingRename(null);
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
        const trimmedName = (pendingRename || editName || "").trim();
        if (store.currentList && trimmedName && trimmedName !== originalName) {
            await store.renamePlaylist(store.currentList._id, trimmedName);
            setOriginalName(trimmedName);
        }
        setPendingRename(null);
        store.loadIdNamePairs();
        setEditOpen(false);
    }

    const playOwner = playPlaylist?.ownerName || playPlaylist?.ownerEmail || playlist?.ownerEmail || "";

    let cardElement =
        <ListItem
            id={idNamePair._id}
            key={idNamePair._id}
            sx={{borderRadius:"25px", p: "10px", bgcolor: '#8000F00F', marginTop: '15px', display: 'flex', alignItems: 'center' }}
            style={{ width: '100%' }}
        >
            <Box sx={{ p: 1, flexGrow: 1, fontSize: '24px', fontWeight: 600, border: isOwner ? '2px solid #0f7b2f' : 'none', borderRadius: '12px' }}>
                {idNamePair.name}
                <Typography variant="caption" display="block" sx={{ color: '#444' }}>
                    {playlist?.ownerName || playlist?.ownerEmail || ""}
                </Typography>
                {typeof playlist?.listens === 'number' && (
                    <Typography variant="caption" display="block" sx={{ color: '#666' }}>
                        {playlist.listens} listens
                    </Typography>
                )}
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
                playlistId={playPlaylist?._id || idNamePair._id}
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
                songs={store.currentList?.songs || editData?.songs || playlist?.songs || []}
                onGoCatalog={() => { window.location.href = "/catalog/"; }}
                onRename={(name) => setEditName(name)}
                onRenameCommit={(name) => {
                    const trimmed = (name || "").trim();
                    setEditName(trimmed);
                    setEditData((prev) => prev ? ({...prev, name: trimmed}) : prev);
                    setPendingRename(trimmed);
                }}
                onReorder={(from, to) => {
                    if (store.currentList && from >= 0 && to >= 0 && from !== to) {
                        store.addMoveSongTransaction(from, to);
                        setEditData((prev) => {
                            if (!prev) return prev;
                            const updated = {...prev, songs: [...(store.currentList?.songs || prev.songs)]};
                            return updated;
                        });
                    }
                }}
                onRemove={(idx) => {
                    const song = (store.currentList?.songs || [])[idx];
                    if (song) store.addRemoveSongTransaction(song, idx);
                }}
                onUndo={() => store.undo()}
                onRedo={() => store.redo()}
                canUndo={store.canUndo()}
                canRedo={store.canRedo()}
                onConfirm={handleConfirmEdit}
                onClose={() => {
                    setPendingRename(null);
                    setEditName(originalName);
                    setEditOpen(false);
                }}
            />
        </>
    );
}

export default PlaylistCard;

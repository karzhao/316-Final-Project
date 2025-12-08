import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';

const baseStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '70vw',
    height: '75vh',
    bgcolor: '#b7f4b7',
    border: '2px solid #16752d',
    boxShadow: 24,
    borderRadius: 2,
    overflow: 'hidden',
    display: 'grid',
    gridTemplateColumns: '1.1fr 1fr',
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

export default function MUIPlayPlaylistModal({
    open = false,
    playlistName = "Playlist Title",
    owner = "Owner Name",
    ownerAvatar = "",
    songs = [],
    onClose = () => {}
}) {
    const [currentIndex, setCurrentIndex] = React.useState(0);

    React.useEffect(() => {
        setCurrentIndex(0);
    }, [playlistName, open]);

    const currentSong = songs[currentIndex] || {};
    const youTubeId = currentSong.youTubeId || currentSong.youtubeId;

    const handleSelect = (idx) => {
        setCurrentIndex(idx);
    };

    const handlePrev = () => {
        if (songs.length === 0) return;
        setCurrentIndex((idx) => (idx - 1 + songs.length) % songs.length);
    };

    const handleNext = () => {
        if (songs.length === 0) return;
        setCurrentIndex((idx) => (idx + 1) % songs.length);
    };

    return (
        <Modal open={open} aria-labelledby="play-playlist-title">
            <Box sx={baseStyle}>
                <Typography id="play-playlist-title" sx={headerStyle}>
                    Play Playlist
                </Typography>

                <Box sx={leftPane}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: '#0f7b2f' }} src={ownerAvatar || undefined}>
                            {owner ? owner.substring(0,2).toUpperCase() : ''}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" sx={{ color: '#1f3b1d', fontWeight: 700 }}>
                                {playlistName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#2f5930' }}>{owner}</Typography>
                        </Box>
                    </Box>
                    <List sx={{ bgcolor: '#fff', borderRadius: 1, border: '1px solid #d6e9d6', maxHeight: 320, overflowY: 'auto' }}>
                        {songs.map((song, idx) => (
                            <React.Fragment key={idx}>
                                <ListItem dense button selected={idx === currentIndex} onClick={() => handleSelect(idx)}>
                                    <ListItemText primary={`${idx + 1}. ${song.title}`} secondary={`${song.artist} (${song.year})`} />
                                </ListItem>
                                {idx < songs.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                </Box>

                <Box sx={rightPane}>
                    <Box sx={{ bgcolor: '#ffffffb0', border: '1px solid #d6e9d6', borderRadius: 1, height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {youTubeId ? (
                            <iframe
                                width="100%"
                                height="240"
                                src={`https://www.youtube.com/embed/${youTubeId}`}
                                title={currentSong.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <Typography variant="body2" color="#2f5930">Select a song to play</Typography>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
                        <Button variant="outlined" size="small" onClick={handlePrev} disabled={songs.length === 0}>⏮</Button>
                        <Button variant="outlined" size="small" disabled>⏯</Button>
                        <Button variant="outlined" size="small" onClick={handleNext} disabled={songs.length === 0}>⏭</Button>
                    </Box>
                </Box>

                <Box sx={footerStyle}>
                    <Button variant="contained" color="success" onClick={onClose}>Close</Button>
                </Box>
            </Box>
        </Modal>
    );
}

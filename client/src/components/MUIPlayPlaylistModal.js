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
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

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
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [loop, setLoop] = React.useState(false);
    const playerRef = React.useRef(null);

    React.useEffect(() => {
        setCurrentIndex(0);
        setIsPlaying(false);
    }, [playlistName, open]);

    const currentSong = songs[currentIndex] || {};
    const youTubeId = currentSong.youTubeId || currentSong.youtubeId;

    const handleSelect = (idx) => {
        setCurrentIndex(idx);
        setIsPlaying(true);
    };

    const handlePrev = () => {
        if (songs.length === 0) return;
        setCurrentIndex((idx) => (idx - 1 + songs.length) % songs.length);
        setIsPlaying(true);
    };

    const handleNext = () => {
        if (songs.length === 0) return;
        setCurrentIndex((idx) => (idx + 1) % songs.length);
        setIsPlaying(true);
    };

    const handlePlayerReady = (event) => {
        playerRef.current = event.target;
        if (isPlaying) {
            playerRef.current.playVideo();
        }
    };

    const handleStateChange = (event) => {
        // 0 = ended, 1 = playing, 2 = paused
        if (event.data === 0) {
            if (loop && songs.length > 0) {
                handleNext();
            } else if (currentIndex < songs.length - 1) {
                handleNext();
            } else if (loop) {
                setCurrentIndex(0);
                setIsPlaying(true);
            } else {
                setIsPlaying(false);
            }
        }
    };

    const togglePlayPause = () => {
        if (!playerRef.current) {
            setIsPlaying((p) => !p);
            return;
        }
        if (isPlaying) {
            playerRef.current.pauseVideo();
            setIsPlaying(false);
        } else {
            playerRef.current.playVideo();
            setIsPlaying(true);
        }
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
                                key={currentIndex}
                                width="100%"
                                height="240"
                                src={`https://www.youtube.com/embed/${youTubeId}?enablejsapi=1&autoplay=${isPlaying ? 1 : 0}`}
                                title={currentSong.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                ref={(ref) => {
                                    if (ref && ref.contentWindow) {
                                        const onReady = () => {
                                            try {
                                                const player = new window.YT.Player(ref, {
                                                    events: {
                                                        'onReady': handlePlayerReady,
                                                        'onStateChange': handleStateChange
                                                    }
                                                });
                                            } catch (e) {
                                                // ignore if YT not loaded
                                            }
                                        };
                                        if (window.YT && window.YT.Player) {
                                            onReady();
                                        } else {
                                            window.onYouTubeIframeAPIReady = onReady;
                                            const tag = document.createElement('script');
                                            tag.src = "https://www.youtube.com/iframe_api";
                                            document.body.appendChild(tag);
                                        }
                                    }
                                }}
                            />
                        ) : (
                            <Typography variant="body2" color="#2f5930">Select a song to play</Typography>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1, alignItems: 'center' }}>
                        <Button variant="outlined" size="small" onClick={handlePrev} disabled={songs.length === 0}>⏮</Button>
                        <Button variant="outlined" size="small" onClick={togglePlayPause} disabled={songs.length === 0}>{isPlaying ? "Pause" : "Play"}</Button>
                        <Button variant="outlined" size="small" onClick={handleNext} disabled={songs.length === 0}>⏭</Button>
                        <FormControlLabel
                            control={<Checkbox checked={loop} onChange={(e) => setLoop(e.target.checked)} />}
                            label="Repeat"
                        />
                    </Box>
                </Box>

                <Box sx={footerStyle}>
                    <Button variant="contained" color="success" onClick={onClose}>Close</Button>
                </Box>
            </Box>
        </Modal>
    );
}

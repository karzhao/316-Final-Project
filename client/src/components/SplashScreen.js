import { useHistory } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

export default function SplashScreen() {
    const history = useHistory();

    const handleLogin = () => {
        history.push('/login/');
    };

    const handleContinueAsGuest = () => {
        history.push('/');
    };

    const handleCreateAccount = () => {
        history.push('/register/');
    };

    return (
        <div id="splash-screen">
            <Paper className="splash-card" elevation={6}>
                <Avatar className="splash-avatar">
                    <MusicNoteIcon fontSize="large" />
                </Avatar>
                <Typography variant="h3" component="h1" className="splash-title">
                    The Playlister
                </Typography>
                <Stack direction="row" spacing={2} className="splash-actions">
                    <Button variant="contained" color="primary" onClick={handleLogin}>
                        Login
                    </Button>
                    <Button variant="outlined" color="primary" onClick={handleContinueAsGuest}>
                        Continue as Guest
                    </Button>
                    <Button variant="contained" color="secondary" onClick={handleCreateAccount}>
                        Create Account
                    </Button>
                </Stack>
            </Paper>
        </div>
    );
}

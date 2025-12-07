import { useContext, useMemo, useState } from 'react';
import AuthContext from '../auth'
import Copyright from './Copyright'

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const REQUIRED_AVATAR_SIZE = 128;

export default function RegisterScreen() {
    const { auth } = useContext(AuthContext);
    const [values, setValues] = useState({
        userName: "",
        email: "",
        password: "",
        passwordVerify: ""
    });
    const [avatarDataUrl, setAvatarDataUrl] = useState("");
    const [avatarError, setAvatarError] = useState("");
    const [touched, setTouched] = useState({
        userName: false,
        email: false,
        password: false,
        passwordVerify: false
    });

    const handleBlur = (field) => () => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const handleChange = (field) => (event) => {
        const { value } = event.target;
        setValues((prev) => ({ ...prev, [field]: value }));
    };

    const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(values.email.trim()), [values.email]);
    const passwordLongEnough = values.password.length >= 8;
    const passwordsMatch = values.password === values.passwordVerify;
    const userNameValid = values.userName.trim().length > 0;
    const avatarValid = Boolean(avatarDataUrl) && !avatarError;

    const formValid = userNameValid && emailValid && passwordLongEnough && passwordsMatch && avatarValid;

    const handleAvatarChange = (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) {
            setAvatarDataUrl("");
            setAvatarError("Please select an avatar image.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            const dataUrl = loadEvent.target.result;
            const img = new Image();
            img.onload = () => {
                if (img.width !== REQUIRED_AVATAR_SIZE || img.height !== REQUIRED_AVATAR_SIZE) {
                    setAvatarError(`Avatar must be exactly ${REQUIRED_AVATAR_SIZE}x${REQUIRED_AVATAR_SIZE}px.`);
                    setAvatarDataUrl("");
                } else {
                    setAvatarError("");
                    setAvatarDataUrl(dataUrl);
                }
            };
            img.onerror = () => {
                setAvatarError("Could not read that image. Please try another file.");
                setAvatarDataUrl("");
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setTouched({
            userName: true,
            email: true,
            password: true,
            passwordVerify: true
        });
        if (!formValid) return;
        const emailLower = values.email.trim().toLowerCase();
        auth.registerUser(
            values.userName.trim(),
            emailLower,
            values.password,
            values.passwordVerify,
            avatarDataUrl
        );
    };

    const fieldHelperText = {
        userName: touched.userName && !userNameValid ? "User name is required." : " ",
        email: touched.email && !emailValid ? "Enter a valid email address." : " ",
        password: touched.password && !passwordLongEnough ? "At least 8 characters." : " ",
        passwordVerify: touched.passwordVerify && !passwordsMatch ? "Passwords must match." : " "
    };

    return (
        <Box className="auth-page">
            <Container component="main" maxWidth="md" className="auth-card">
                <CssBaseline />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h4" className="auth-title" sx={{ mt: 1, mb: 1 }}>
                        Create Account
                    </Typography>
                    <Typography variant="body2" className="auth-subtitle">
                        Choose a username, add your avatar (exactly {REQUIRED_AVATAR_SIZE}x{REQUIRED_AVATAR_SIZE}px), and set a secure password.
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 2, width: '100%' }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <Stack spacing={1} alignItems="center">
                                    <Avatar
                                        src={avatarDataUrl || undefined}
                                        sx={{ width: 90, height: 90, bgcolor: 'primary.light', fontSize: 32 }}
                                    >
                                        {!avatarDataUrl ? values.userName.substring(0, 2).toUpperCase() : null}
                                    </Avatar>
                                    <Button
                                        variant="outlined"
                                        startIcon={<PhotoCamera />}
                                        component="label"
                                        fullWidth
                                    >
                                        Select Avatar
                                        <input
                                            hidden
                                            accept="image/*"
                                            type="file"
                                            onChange={handleAvatarChange}
                                        />
                                    </Button>
                                    <Typography variant="caption" color={avatarError ? "error" : "text.secondary"} align="center">
                                        {avatarError || `Use a ${REQUIRED_AVATAR_SIZE}x${REQUIRED_AVATAR_SIZE}px PNG or JPG.`}
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={8}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            fullWidth
                                            id="userName"
                                            label="User Name"
                                            name="userName"
                                            value={values.userName}
                                            onChange={handleChange('userName')}
                                            onBlur={handleBlur('userName')}
                                            error={touched.userName && !userNameValid}
                                            helperText={fieldHelperText.userName}
                                            autoFocus
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            fullWidth
                                            id="email"
                                            label="Email Address"
                                            name="email"
                                            value={values.email}
                                            onChange={handleChange('email')}
                                            onBlur={handleBlur('email')}
                                            error={touched.email && !emailValid}
                                            helperText={fieldHelperText.email}
                                            autoComplete="email"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            fullWidth
                                            name="password"
                                            label="Password"
                                            type="password"
                                            id="password"
                                            value={values.password}
                                            onChange={handleChange('password')}
                                            onBlur={handleBlur('password')}
                                            error={touched.password && !passwordLongEnough}
                                            helperText={fieldHelperText.password}
                                            autoComplete="new-password"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            fullWidth
                                            name="passwordVerify"
                                            label="Password Confirm"
                                            type="password"
                                            id="passwordVerify"
                                            value={values.passwordVerify}
                                            onChange={handleChange('passwordVerify')}
                                            onBlur={handleBlur('passwordVerify')}
                                            error={touched.passwordVerify && !passwordsMatch}
                                            helperText={fieldHelperText.passwordVerify}
                                            autoComplete="new-password"
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        {auth.errorMessage ? (
                            <Typography color="error" sx={{ mt: 1 }}>
                                {auth.errorMessage}
                            </Typography>
                        ) : null}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, py: 1.4 }}
                            disabled={!formValid}
                        >
                            Create Account
                        </Button>
                        <Grid container justifyContent="center">
                            <Grid item>
                                <Link href="/login/" variant="body2" underline="hover">
                                    Already have an account? Sign in
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
                <Copyright sx={{ mt: 5 }} />
            </Container>
        </Box>
    );
}

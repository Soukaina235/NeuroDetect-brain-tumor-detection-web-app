/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import NavBar from '../components/LoginPageComponents/NavBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import getLPTheme from '../pages/getLPTheme';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import "../styles/Form.css";

// The route is the route that we want to go to when we submit the form,
// so it could be the token route  or it could be the register route
function Form({ route, method, setIsLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [mode, setMode] = React.useState('light');
  const [showCustomTheme] = React.useState(true);
  const LPtheme = createTheme(getLPTheme(mode));
  const defaultTheme = createTheme({ palette: { mode } });

  const toggleColorMode = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSubmit = async (e) => {
    setLoading(true);

    // prevents us from actually submitting the form so we we won't reload the page
    e.preventDefault();

    try {
      const res = await api.post(route, { username, password });

      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);

        setIsLoggedIn(true);
        navigate("/home");
      } else {
        // in order to get the tokens, we need to actually log in
        navigate("/login");
      }
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={showCustomTheme ? LPtheme : defaultTheme}>
      <NavBar mode={mode} toggleColorMode={toggleColorMode} />
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <img src="brain.png" alt="avatar" style={{ width: '50px', height: 'auto' }} />
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            {/* <input
              className="form-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
            />
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            /> */}

            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              // autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              InputLabelProps={{ style: { textAlign: 'center' } }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              // autoComplete="current-password"
              InputLabelProps={{ style: { textAlign: 'center' } }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider >
  );
}

export default Form;

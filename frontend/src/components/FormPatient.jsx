import React, { useState } from "react";
import api from "../api";
import PropTypes from "prop-types";

import { Box, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { useNavigate } from "react-router-dom";
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import getLPTheme from '../pages/getLPTheme';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import NavBar from '../components/HomePageComponents/NavBar';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';


function FormPatient({ route, authorized }) {
    const role = sessionStorage.getItem('role');
    const navigate = useNavigate();
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [gender, setGender] = useState("");
    const [age, setAge] = useState("");
    const [status, setStatus] = useState("NC");
    const [mode, setMode] = React.useState('light');
    const [showCustomTheme] = React.useState(true);
    const LPtheme = createTheme(getLPTheme(mode));
    const defaultTheme = createTheme({ palette: { mode } });

    const toggleColorMode = () => {
        setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const patientData = {
                firstname,
                lastname,
                email,
                phone,
                address,
                gender,
                age: parseInt(age),
                status
            };
            const res = await api.post(route, patientData);
            navigate("/list/patients/");
            console.log(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <ThemeProvider theme={showCustomTheme ? LPtheme : defaultTheme}>
            <NavBar mode={mode} toggleColorMode={toggleColorMode} authorized={authorized}
                role={role} />
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
                    <Typography component="h1" variant="h5">
                        Add Patient
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="firstname"
                            label="First Name"
                            name="firstname"
                            value={firstname}
                            onChange={(e) => setFirstname(e.target.value)}
                            autoFocus
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="lastname"
                            label="Last Name"
                            name="lastname"
                            value={lastname}
                            onChange={(e) => setLastname(e.target.value)}
                            autoFocus
                        />
                        <FormControl fullWidth>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoFocus
                            />
                        </FormControl>
                        <FormControl fullWidth>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="phone"
                                label="Phone"
                                name="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                autoFocus
                            />
                        </FormControl>
                        <FormControl fullWidth>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="address"
                                label="Address"
                                name="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                autoFocus
                            />
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel id="gender-label">Gender</InputLabel>
                            <Select
                                labelId="gender-label"
                                id="gender"
                                name="gender"
                                value={gender}
                                onChange={(event) => setGender(event.target.value)}
                                label="Gender"
                                required
                            >
                                <MenuItem value={'M'}>Male</MenuItem>
                                <MenuItem value={'F'}>Female</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="age"
                                label="Age"
                                name="age"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                autoFocus
                            />
                        </FormControl>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Add Patient
                        </Button>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider >
    );
}

FormPatient.propTypes = {
    authorized: PropTypes.bool.isRequired,
};

export default FormPatient;

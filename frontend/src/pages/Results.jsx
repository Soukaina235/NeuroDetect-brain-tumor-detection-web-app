import React from 'react';
import { useLocation } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import NavBar from '../components/PageComponents/NavBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import getLPTheme from './getLPTheme';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

const Image = styled.img`
    width: 140px;
    height: 140px;
    object-fit: fill;
    border-radius: 12px;
`;

const Containerstyle = styled.div`
    max-width: 100%;
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
    align-items: center;
    border: 2px dashed ${({ theme }) => theme.border}; 
    border-radius: 12px;
    color: ${({ theme }) => theme.soft};
    padding: 20px;
`;

function Results({ authorized }) {
    const role = sessionStorage.getItem('role');

    const location = useLocation();
    const { predictionData } = location.state;
    console.log(location.state);
    console.log(predictionData);
    const { prediction, scanner, probability } = predictionData;
    console.log(scanner)
    const [mode, setMode] = React.useState('light');
    const [showCustomTheme] = React.useState(true);
    const LPtheme = createTheme(getLPTheme(mode));
    const defaultTheme = createTheme({ palette: { mode } });

    const toggleColorMode = () => {
        setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };




    return (
        <ThemeProvider theme={showCustomTheme ? LPtheme : defaultTheme}>
            <NavBar mode={mode} toggleColorMode={toggleColorMode} role={role} authorized={authorized.authorized} />
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
                        Results
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                        <Containerstyle>
                            <Image src={scanner} alt="MRI" />
                        </Containerstyle>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="h6">
                            Prediction: {prediction}
                        </Typography>
                        <Typography variant="h6">
                            Probability: {Math.floor(probability * 100) / 100} %
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
}
export default Results;

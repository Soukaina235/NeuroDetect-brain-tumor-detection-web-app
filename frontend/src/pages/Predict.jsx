import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from "../api";

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


const Typo = styled.div`
    font-size: 18px;
    font-weight: 600;
`;

const TextBtn = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: ${({ theme }) => theme.primary};
    cursor: pointer;
`;

const Image = styled.img`
    width: 140px;
    height: 140px;
    object-fit: fill;
    border-radius: 12px;
`;

function Predict(authorized) {
    const role = sessionStorage.getItem('role');
    const { id } = useParams();

    const [image, setImage] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [patients, setPatients] = useState([]);
    const [probability, setProbability] = useState(null);


    const [mode, setMode] = React.useState('light');
    const [showCustomTheme] = React.useState(true);
    const LPtheme = createTheme(getLPTheme(mode));
    const defaultTheme = createTheme({ palette: { mode } });

    const navigate = useNavigate();
    const toggleColorMode = () => {
        setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const { getRootProps, getInputProps } = useDropzone({
        accept: 'image/*',
        onDrop: (acceptedFiles) => {
            const event = {
                target: {
                    files: acceptedFiles,
                    value: acceptedFiles[0].name
                }
            };
            handleImageUpload(event);
        }
    });

    const handleImageUpload = (event) => {
        setImage(event.target.files[0]);
        setImageUrl(URL.createObjectURL(event.target.files[0]));

    };
    const updatePatientStatus = (id, status) => {
        fetch(`http://localhost:8000/api/patients/${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        })
            .then(response => response.json())
            .then(data => {
                setPatients(patients.map(patient => patient.id === id ? { ...patient, status } : patient));
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('image', image);
        formData.append('patient_id', id);
        console.log(formData)
        try {
            const res = await api.post("/api/predict_tumor/", formData);
            setPrediction(res.data.prediction);
            setProbability(res.data.probability);
            updatePatientStatus(id, 'CO');

            // navigate(`/results/${id}`, { state: { prediction: res.data.prediction, probability: res.data.probability, imageUrl } });
        } catch (error) {
            console.error(error);
        }
    };

    const CustomisedButton = ({ triggerInput }) => {
        return (
            <TextBtn onClick={triggerInput}>
                Browse Images
            </TextBtn>
        );
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

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div {...getRootProps()}>
                            <Containerstyle>
                                <CloudUploadIcon sx={{ fontSize: "100px", cursor: 'pointer' }} />
                                <Typo variant="h6">Drag & Drop Image(s) here</Typo>
                                <div style={{ display: "flex", gap: '6px', alignItems: 'center' }}>
                                    <Typography variant="body1">or</Typography>
                                    <input id="file-upload" {...getInputProps()} style={{ display: 'none' }} />
                                    <CustomisedButton triggerInput={() => document.getElementById('file-upload').click()} />
                                </div>
                            </Containerstyle>
                        </div>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Predict
                        </Button>
                    </form>

                    {imageUrl &&
                        <Containerstyle>
                            <Image src={imageUrl} alt="Uploaded" />
                        </Containerstyle>
                    }

                    <Typography variant="h6">
                        Prediction: {prediction}
                    </Typography>
                    <Typography variant="h6">
                        Probability: {Math.floor(probability * 100) / 100} %
                    </Typography>

                    {/* {prediction && <p>Prediction: {prediction}</p>} */}
                </Box>
            </Container>
        </ThemeProvider>
    );
}


export default Predict; 

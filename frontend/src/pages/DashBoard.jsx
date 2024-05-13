import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import NavBar from '../components/PageComponents/NavBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import getLPTheme from '../pages/getLPTheme';
import Divider from "@mui/material/Divider";
import Footer from "../components/PageComponents/Footer";
import BarChart from "../components/BarChart";

export default function DashBoard(authorized) {
    const role = sessionStorage.getItem('role');
    const [mode, setMode] = React.useState('light');
    const [showCustomTheme] = React.useState(true);
    const LPtheme = createTheme(getLPTheme(mode));
    const defaultTheme = createTheme({ palette: { mode } });
    const [tumorPatientsByGender, setTumorPatientsByGender] = React.useState([0, 0]);
    React.useEffect(() => {
        fetch('http://localhost:8000/api/count_gender_tumor_patients/')
            .then(response => response.json())
            .then(data => {
                setTumorPatientsByGender([data.male_patients_with_tumor, data.female_patients_with_tumor]);
            });
    }, []);

    const toggleColorMode = () => {
        setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };
    // const tumorPatientsByGender = [12, 15];
    return (

        <ThemeProvider theme={showCustomTheme ? LPtheme : defaultTheme}>
            <NavBar mode={mode} toggleColorMode={toggleColorMode} authorized={authorized.authorized} role={role} />
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
                    {tumorPatientsByGender.length > 0 && <BarChart data={tumorPatientsByGender} />}
                </Box>
            </Container>
            <Divider />
            <Footer />
        </ThemeProvider>
    );
}
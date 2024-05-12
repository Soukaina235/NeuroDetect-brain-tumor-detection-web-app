import * as React from "react";
import { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import getLPTheme from "../pages/getLPTheme";
import NavBar from "./HomePageComponents/NavBar";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import { Link } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

function getGenderFullForm(gender) {
  switch (gender) {
    case "F":
      return "Female";
    case "M":
      return "Male";
    default:
      return "-";
  }
}
function getStatusFullForm(status) {
  switch (status) {
    case "NC":
      return "Not Consulted";
    case "CO":
      return "Consulted";
    default:
      return "Consulting";
  }
}

function ListPatients({ authorized }) {
  const role = sessionStorage.getItem("role");

  const [patients, setPatients] = useState([]);
  const [mode, setMode] = React.useState("light");
  const [showCustomTheme] = React.useState(true);
  const LPtheme = createTheme(getLPTheme(mode));
  const defaultTheme = createTheme({ palette: { mode } });
  const [page, setPage] = useState(1);
  const itemsPerPage = 3;

  const consultedPatients = patients.filter(
    (patient) => patient.status === "CO"
  );
  const otherPatients = patients.filter((patient) => patient.status !== "CO");

  const navigate = useNavigate();

  const toggleColorMode = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };
  const updatePatientStatus = (id, status) => {
    fetch(`http://localhost:8000/api/patients/${id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    })
      .then((response) => response.json())
      .then((data) => {
        setPatients(
          patients.map((patient) =>
            patient.id === id ? { ...patient, status } : patient
          )
        );
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  useEffect(() => {
    const url = "http://localhost:8000/api/patients/";

    fetch(url)
      .then((response) => response.json())
      .then((data) => setPatients(data))
      .catch((error) => console.error("Error:", error));
  }, []);

  async function getPatientPrediction(id) {
    try {
      const response = await fetch(
        `http://localhost:8000/api/patients/${id}/results/`
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log(data);

      navigate(`/results/${id}`, { state: { predictionData: data } });
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const patientsToShow = patients.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  return (
    <ThemeProvider theme={showCustomTheme ? LPtheme : defaultTheme}>
      <NavBar
        mode={mode}
        toggleColorMode={toggleColorMode}
        authorized={authorized}
        role={role}
      />
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h1"
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignSelf: "center",
              textAlign: "center",
              fontSize: "clamp(3.5rem, 10vw, 4rem)",
            }}
          >
            The&nbsp;&nbsp;
            <Typography
              component="span"
              variant="h1"
              sx={{
                fontSize: "clamp(3rem, 10vw, 4rem)",
                color: (theme) =>
                  theme.palette.mode === "light"
                    ? "primary.main"
                    : "primary.light",
              }}
            >
              Patients
            </Typography>
          </Typography>
          <br />
          <Divider />
          <React.Fragment>
            <Typography variant="h6" style={{ color: "#b1cbfa" }}>
              CONSULTED PATIENTS
            </Typography>
            <Divider style={{ backgroundColor: "#b1cbfa" }} />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Id</TableCell>
                  <TableCell align="center" style={{ width: "40%" }}>
                    First Name
                  </TableCell>
                  <TableCell align="center" style={{ width: "40%" }}>
                    Last Name
                  </TableCell>
                  <TableCell align="center">Email</TableCell>
                  <TableCell align="center">Phone</TableCell>
                  <TableCell align="center">Address</TableCell>
                  <TableCell align="center">Gender</TableCell>
                  <TableCell align="center">Age</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {consultedPatients.map((patient) => (
                  <TableRow
                    key={patient.id}
                    style={{
                      backgroundColor:
                        patient.status === "C" ? "#8fbcbb" : "inherit",
                    }}
                  >
                    <TableCell>
                      <span>{patient.id}</span>
                    </TableCell>
                    <TableCell>{patient.firstname}</TableCell>
                    <TableCell>{patient.lastname}</TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>{patient.address}</TableCell>
                    <TableCell>{getGenderFullForm(patient.gender)}</TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>{getStatusFullForm(patient.status)}</TableCell>
                    <TableCell>
                      {patient.status === "CO" ? (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => getPatientPrediction(patient.id)}
                        >
                          Show Results
                        </Button>
                      ) : (
                        <Button variant="contained" disabled>
                          Show Results
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              count={Math.ceil(consultedPatients.length / itemsPerPage)}
              page={page}
              onChange={handlePageChange}
            />
          </React.Fragment>
          <br /> <br />
          <React.Fragment>
            <Typography variant="h6" style={{ color: "#b1cbfa" }}>
              OTHER PATIENTS
            </Typography>
            <Divider style={{ backgroundColor: "#b1cbfa" }} />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Id</TableCell>
                  <TableCell align="center" style={{ width: "50%" }}>
                    First Name
                  </TableCell>
                  <TableCell align="center" style={{ width: "50%" }}>
                    Last Name
                  </TableCell>
                  <TableCell align="center">Email</TableCell>
                  <TableCell align="center">Phone</TableCell>
                  <TableCell align="center">Address</TableCell>
                  <TableCell align="center">Gender</TableCell>
                  <TableCell align="center">Age</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {otherPatients.map((patient) => (
                  <TableRow
                    key={patient.id}
                    style={{
                      backgroundColor:
                        patient.status === "C" ? "#8fbcbb" : "inherit",
                    }}
                  >
                    <TableCell>
                      {role === "AS" ? (
                        <span>{patient.id}</span>
                      ) : (
                        <Link
                          to={{ pathname: `/predict/${patient.id}` }}
                          style={{ cursor: "pointer", color: "blue" }}
                          onClick={() => updatePatientStatus(patient.id, "C")}
                        >
                          {patient.id}
                        </Link>
                      )}
                    </TableCell>
                    <TableCell>{patient.firstname}</TableCell>
                    <TableCell>{patient.lastname}</TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>{patient.address}</TableCell>
                    <TableCell>{getGenderFullForm(patient.gender)}</TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>{getStatusFullForm(patient.status)}</TableCell>
                    <TableCell>
                      {patient.status === "CO" ? (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => getPatientPrediction(patient.id)}
                        >
                          Show Results
                        </Button>
                      ) : (
                        <Button variant="contained" disabled>
                          Show Results
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              count={Math.ceil(otherPatients.length / itemsPerPage)}
              page={page}
              onChange={handlePageChange}
            />
          </React.Fragment>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default ListPatients;

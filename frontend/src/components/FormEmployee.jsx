import React, { useState } from "react";
import api from "../api";
import { Box, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import getLPTheme from "../pages/getLPTheme";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import NavBar from "./PageComponents/NavBar";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Footer from "../components/PageComponents/Footer";
function FormEmployee({ route, authorized }) {
  const roleuser = sessionStorage.getItem("role");

  const [first_name, setFirst_name] = useState("");
  const [last_name, setLast_name] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = React.useState("light");
  const [showCustomTheme] = React.useState(true);
  const LPtheme = createTheme(getLPTheme(mode));
  const defaultTheme = createTheme({ palette: { mode } });

  const toggleColorMode = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const employeeData = {
        first_name,
        last_name,
        email,
        username,
        role,
        password,
      };
      const res = await api.post(route, employeeData);
      console.log(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ThemeProvider theme={showCustomTheme ? LPtheme : defaultTheme}>
      <NavBar
        mode={mode}
        toggleColorMode={toggleColorMode}
        authorized={authorized}
        role={roleuser}
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
          <Typography component="h1" variant="h5">
            Add Employee
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="firstname"
              label="First Name"
              name="firstname"
              value={first_name}
              onChange={(e) => setFirst_name(e.target.value)}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="lastname"
              label="Last Name"
              name="lastname"
              value={last_name}
              onChange={(e) => setLast_name(e.target.value)}
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
                id="username"
                label="Username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="gender-label">Role</InputLabel>
              <Select
                labelId="gender-label"
                required
                fullWidth
                id="role"
                label="Role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value={"AS"}>Assistant</MenuItem>
                <MenuItem value={"DR"}>Doctor</MenuItem>
              </Select>
            </FormControl>
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
              InputLabelProps={{ style: { textAlign: "center" } }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Add Employee
            </Button>
          </Box>
        </Box>
      </Container>
      <Divider />
      <Footer />
    </ThemeProvider>
  );
}

export default FormEmployee;

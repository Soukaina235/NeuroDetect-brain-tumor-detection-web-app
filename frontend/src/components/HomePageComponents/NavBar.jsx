import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
import MenuIcon from "@mui/icons-material/Menu";
import ToggleColorMode from "./ToggleColorMode";
import { Link, useNavigate } from 'react-router-dom';


const logoStyle = {
  width: "200px",
  height: "auto",
  cursor: "pointer",
  marginBottom: '5px',
  marginLeft: '5px',
};

function NavBar({ mode, toggleColorMode, authorized, role }) {
  // , handleLogin
  // isLoggedIn,
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const scrollToSection = (sectionId) => {
    const sectionElement = document.getElementById(sectionId);
    const offset = 128;
    if (sectionElement) {
      const targetScroll = sectionElement.offsetTop - offset;
      sectionElement.scrollIntoView({ behavior: "smooth" });
      window.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
      setOpen(false);
    }
  };

  console.log("From NavBarHome: " + authorized);
  console.log("ROLE NAVBAR: " + role)

  return (
    <div>
      <AppBar
        position="fixed"
        sx={{
          boxShadow: 0,
          bgcolor: "transparent",
          backgroundImage: "none",
          mt: 2,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            variant="regular"
            sx={(theme) => ({
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
              borderRadius: "999px",
              bgcolor:
                theme.palette.mode === "light"
                  ? "rgba(255, 255, 255, 0.4)"
                  : "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(24px)",
              maxHeight: 40,
              border: "1px solid",
              borderColor: "divider",
              boxShadow:
                theme.palette.mode === "light"
                  ? `0 0 1px rgba(85, 166, 246, 0.1), 1px 1.5px 2px -1px rgba(85, 166, 246, 0.15), 4px 4px 12px -2.5px rgba(85, 166, 246, 0.15)`
                  : "0 0 1px rgba(2, 31, 59, 0.7), 1px 1.5px 2px -1px rgba(2, 31, 59, 0.65), 4px 4px 12px -2.5px rgba(2, 31, 59, 0.65)",
            })}
          >
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                ml: "-18px",
                px: 0,
              }}
            >
              <Link to="/home">
                <img
                  src={"/Logo.png"}
                  style={logoStyle}
                  alt="logo of NeuroDetect"
                />
              </Link>
              <Box sx={{ display: { xs: "none", md: "flex" } }}>
                <MenuItem
                  onClick={() => scrollToSection("OurDoctors")}
                  sx={{ py: "6px", px: "12px" }}
                >
                  <Typography variant="body2" color="text.primary">
                    Our Doctors
                  </Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => scrollToSection("OurServices")}
                  sx={{ py: "6px", px: "12px" }}
                >
                  <Typography variant="body2" color="text.primary">
                    Our Services
                  </Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => scrollToSection("AboutUs")}
                  sx={{ py: "6px", px: "12px" }}
                >
                  <Typography variant="body2" color="text.primary">
                    About Us
                  </Typography>
                </MenuItem>
                {role === 'AD' && (
                  <MenuItem onClick={() => navigate("/add/employee/")}>
                    Add Employee
                  </MenuItem>
                )}
                {role === 'AD' && (
                  <MenuItem onClick={() => navigate("/list/employees/")}>
                    List Employees
                  </MenuItem>
                )}

                {role === 'AS' && (
                  <MenuItem onClick={() => navigate("/add/patient/")}>
                    Add Patient
                  </MenuItem>
                )}
                {(role === 'AS' || role === 'DR') && (
                  <MenuItem onClick={() => navigate("/list/patients/")}>
                    List Patients
                  </MenuItem>
                )}
              </Box>
            </Box>
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                gap: 0.5,
                alignItems: "center",
              }}
            >
              <ToggleColorMode mode={mode} toggleColorMode={toggleColorMode} />

              {authorized ? (
                <Button
                  color="primary"
                  variant="contained"
                  size="small"
                  component="a"
                  href="/logout"
                //target="_blank"
                >
                  Sign out
                </Button>
              ) : (
                <Button
                  color="primary"
                  variant="contained"
                  size="small"
                  component="a"
                  href="/login"
                //target="_blank"
                >
                  Sign in
                </Button>
              )}
            </Box>
            <Box sx={{ display: { sm: "", md: "none" } }}>
              <Button
                variant="text"
                color="primary"
                aria-label="menu"
                onClick={toggleDrawer(true)}
                sx={{ minWidth: "30px", p: "4px" }}
              >
                <MenuIcon />
              </Button>
              <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
                <Box
                  sx={{
                    minWidth: "60dvw",
                    p: 2,
                    backgroundColor: "background.paper",
                    flexGrow: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "end",
                      flexGrow: 1,
                    }}
                  >
                    <ToggleColorMode
                      mode={mode}
                      toggleColorMode={toggleColorMode}
                    />
                  </Box>
                  <MenuItem onClick={() => scrollToSection("OurDoctors")}>
                    Our Doctors
                  </MenuItem>
                  <MenuItem onClick={() => scrollToSection("OurServices")}>
                    Our Services
                  </MenuItem>
                  <MenuItem onClick={() => scrollToSection("AboutUs")}>
                    About Us
                  </MenuItem>
                  {role === 'AD' && (
                    <MenuItem onClick={() => navigate("/add/employee/")}>
                      Add Employee
                    </MenuItem>
                  )}
                  {role === 'AD' && (
                    <MenuItem onClick={() => navigate("/list/employees/")}>
                      List Employees
                    </MenuItem>
                  )}

                  {role === 'AS' && (
                    <MenuItem onClick={() => navigate("/add/patient/")}>
                      Add Patient
                    </MenuItem>
                  )}
                  {(role === 'AS' || role === 'DR') && (
                    <MenuItem onClick={() => navigate("/list/patients/")}>
                      List Patients
                    </MenuItem>
                  )}

                  <Divider />
                  <MenuItem>
                    {authorized ? (
                      <Button
                        color="primary"
                        variant="contained"
                        size="small"
                        component="a"
                        href="/logout"
                      //target="_blank"
                      >
                        Sign out
                      </Button>
                    ) : (
                      <Button
                        color="primary"
                        variant="contained"
                        size="small"
                        component="a"
                        href="/login"
                      //target="_blank"
                      >
                        Sign in
                      </Button>
                    )}
                  </MenuItem>
                </Box>
              </Drawer>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </div>
  );
}

NavBar.propTypes = {
  mode: PropTypes.oneOf(["dark", "light"]).isRequired,
  toggleColorMode: PropTypes.func.isRequired,
  authorized: PropTypes.bool.isRequired,
};

export default NavBar;

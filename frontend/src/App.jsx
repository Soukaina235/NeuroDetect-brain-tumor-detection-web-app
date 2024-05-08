/* eslint-disable no-unused-vars */
import react, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/Home";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";
import api from "./api";
import { jwtDecode } from "jwt-decode";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  // making sure that we don't have any old access tokens that could cause an error
  return <Register />;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // useEffect(() => {
  //   // in case there any error => setIsAuthorized(false)
  //   auth().catch(() => setIsLoggedIn(false));
  // }, []);

  // // it is going to refresh the access token for us automatically
  // const refreshToken = async () => {
  //   const refreshToken = localStorage.getItem(REFRESH_TOKEN);
  //   try {
  //     // trying to send a response to this route, using this refresh token
  //     // which should give us a new access token
  //     const res = await api.post("/api/token/refresh", {
  //       refresh: refreshToken,
  //     });

  //     // if sucessful
  //     if (res.status === 200) {
  //       localStorage.setItem(ACCESS_TOKEN, res.data.access);
  //       setIsLoggedIn(true);
  //     } else {
  //       setIsLoggedIn(false);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     setIsLoggedIn(false);
  //   }
  // };

  //   const decoded = jwtDecode(token);
  //   const tokenExpiration = decoded.exp; // which stands for expiration
  //   const now = Date.now() / 1000; // to get the date in seconds, not in milliseconds

  //   // it already expired
  //   if (tokenExpiration < now) {
  //     await refreshToken();
  //   } else setIsLoggedIn(true);
  // };
  useEffect(() => {
    const auth = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000;

        if (tokenExpiration < now) {
          await refreshToken();
        } else {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.log(error);
        setIsLoggedIn(false);
      }
    };

    const refreshToken = async () => {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);
      try {
        const res = await api.post("/api/token/refresh", {
          refresh: refreshToken,
        });

        if (res.status === 200) {
          localStorage.setItem(ACCESS_TOKEN, res.data.access);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.log(error);
        setIsLoggedIn(false);
      }
    };

    auth().catch(() => setIsLoggedIn(false));
  }, []);

  console.log("From app: " + isLoggedIn);
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/home"
            element={
              // We can't access the home component unless we have the access token and it is valid
              // <ProtectedRoute>
              <Home authorized={isLoggedIn} />
              // </ProtectedRoute>

              // <ProtectedRoute>
              //   <Home />
              // </ProtectedRoute>
            }
          />

          <Route
            path="/login"
            element={<Login setIsLoggedIn={setIsLoggedIn} />}
          />
          <Route path="/logout" element={<Logout />} />

          <Route path="/register" element={<RegisterAndLogout />} />

          <Route path="*" element={<NotFound />} />

          {/* 
          
          <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Login />} />
        <Route path="/logout" />
          
          */}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

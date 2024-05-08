// this is going to represent a wrapper for our protective route
// we need to have an authorizatin token before being able to
// actually access this route

import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import React, { useEffect, useState } from "react";

function ProtectedRoute({ children }) {
  // we need to check if we are authorized before actually allowing someone
  // to access this route, otherwise, we are going to rediret them
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    // in case there any error => setIsAuthorized(false)
    auth().catch(() => setIsAuthorized(false));
  }, []);

  // it is going to refresh the access token for us automatically
  const refreshToken = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    try {
      // trying to send a response to this route, using this refresh token
      // which should give us a new access token
      const res = await api.post("/api/token/refresh", {
        refresh: refreshToken,
      });

      // if sucessful
      if (res.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.log(error);
      setIsAuthorized(false);
    }
  };

  // checks if we need to refresh the token or if we are good to go
  const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      setIsAuthorized(false);
      return;
    }

    const decoded = jwtDecode(token);
    const tokenExpiration = decoded.exp; // which stands for expiration
    const now = Date.now() / 1000; // to get the date in seconds, not in milliseconds

    // it already expired
    if (tokenExpiration < now) {
      await refreshToken();
    } else setIsAuthorized(true);
  };

  // until isAuthorized has some State that's not null, we are load, or checking
  // the tokens or potentially refreshing them
  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  // // if isAuthorized then we are going to return whatever children that we wrapped
  // // otherwise, we  are going to navigate to login
  // return isAuthorized ? children : <Navigate to="/login" />;

  console.log(location.pathname);

  // if (!isAuthorized && location.pathname === "/home") {
  //   // let authorized = isAuthorized;
  //   // return <Navigate to="/home?authorized=false" />;
  //   // return [children, authorized];
  //   return React.Children.map(children, (child) =>
  //     React.cloneElement(child, authorized: false )
  //   );
  // }
  // if (isAuthorized && location.pathname === "/home") {
  //   // let authorized = isAuthorized;
  //   // return <Navigate to="/home?authorized=true" />;
  //   // return [children, authorized];
  //   return React.Children.map(children, (child) =>
  //     React.cloneElement(child, { authorized: true })
  //   );
  // }
  // let childrenWithProps;
  // if (location.pathname === "/home") {
  //   childrenWithProps = React.Children.map(children, (child) =>
  //     React.cloneElement(child, { authorized: isAuthorized })
  //   );
  // } else childrenWithProps = children;

  // return isAuthorized || location.pathname === "/home" ? (
  //   childrenWithProps
  // ) : (
  //   <Navigate to="/login" />
  // );

  return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;

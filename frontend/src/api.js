// we are going to write something knwon as an interceptor
// it will intercept any request that we are going to send it will automatically
// add the correct header so we don't need to write it manually a bunch of different
// times repetitively in our code

// we are going to be using something known as axios
// it is a clean way to send network requests

// so we are going to create an axois interceptor
// anytime we send a request, it is going to check if we have an
// access token and if we do it, we will automatically add it to that request

import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
// });

const apiUrl = "/choreo-apis/awbo/backend/rest-api-be2/v1.0";

const api = axios.create({
  // import anything that is specified into an environment variable file

  baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : apiUrl,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      // this is how we pass a JWT access token
      // we crete an authorization header which will automatically be
      // handled for us by axios and it needs to start with Bearer
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

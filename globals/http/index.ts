import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:2000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },  
});

const APIS = axios.create({
  baseURL: "http://localhost:2000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ✅ Interceptor with raw token (no Bearer prefix)
APIS.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; 
  }
  return config;
});

export { API, APIS };

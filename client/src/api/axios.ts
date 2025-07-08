import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "http://localhost:4000/api",
});


API.interceptors.request.use((req) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
});

// Log the user out if the token is invalid
API.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response && err.response.status === 401 && err.response.data.message === "Token expired") {
            console.error("Invalid token, logging out...");

            window.location.href = '/logout';

            // localStorage.removeItem('authToken');
            // window.location.href = '/login'; // Redirect to login page
        }
        return Promise.reject(err);
    }
);


export default API;
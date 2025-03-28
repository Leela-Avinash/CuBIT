import axios from "axios";

const api = axios.create({
    BACKEND_URL: "http://localhost:5000",
});

export default api;

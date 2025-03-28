import axios from "axios";

const api = axios.create({
    BACKEND_URL: "https://cubit.onrender.com",
});

export default api;

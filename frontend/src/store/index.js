import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import deviceReducer from "./slices/deviceSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        device: deviceReducer,
    },
});

export default store;

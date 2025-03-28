import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const token = localStorage.getItem("token") || null;

const initialState = {
    isAuthenticated: false,
    user: null,
    token,
    loading: false,
    error: null,
};

export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (credentials, { dispatch, rejectWithValue }) => {
        try {
            // Remove device related data from credentials if present
            const { device, ...loginData } = credentials;
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(loginData),
                    credentials: "include",
                }
            );
            const json = await response.json();
            if (json.success) {
                localStorage.setItem("user", JSON.stringify(json.user));
                dispatch(setAuth(true));
                dispatch(setUser(json.user));
            }
            return json;
        } catch (error) {
            return rejectWithValue(
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                    error.message
            );
        }
    }
);

export const signupUser = createAsyncThunk(
    "auth/signupUser",
    async (userData, { dispatch, rejectWithValue }) => {
        try {
            // Remove device related data from userData if present
            const { device, ...signupData } = userData;
            const response = await fetch(
                "http://localhost:5000/api/auth/signup",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(signupData),
                    credentials: "include",
                }
            );
            const json = await response.json();
            if (json.success) {
                localStorage.setItem("user", JSON.stringify(json.user));
                dispatch(setAuth(true));
                dispatch(setUser(json.user));
            }
            return json;
        } catch (error) {
            return rejectWithValue(
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                    error.message
            );
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout(state) {
            state.user = null;
            state.token = null;
            localStorage.clear();
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null; 
        },
        setUser(state, action) {
            state.user = action.payload;
        },
        setAuth(state, action) {
            state.isAuthenticated = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                localStorage.setItem("token", action.payload.token);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(signupUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signupUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                localStorage.setItem("token", action.payload.token);
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, setUser, setAuth } = authSlice.actions;
export default authSlice.reducer;

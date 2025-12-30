import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { REHYDRATE } from "redux-persist";
import config from '../config/index';

const initialState = {
    user: null,
    isAuthenticated: false,
    role: null,
    loading: false
};



// 🔹 Async thunk to fetch user
export const fetchUser = createAsyncThunk("user/fetchUser", async () => {
    const res = await axios.get(`${config.API_BASE_URL}/api/v1/user/me`, {
        withCredentials: true
    });
    return res.data.user;
});

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        userLoggedIn: (state, action) => {
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.role = action.payload.user.role;
            state.loading = false;
        },
        userLoggedOut: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.role = null;
            state.loading = false;
        },
        // 🔹 Role changing helper
        userRoleChanging: (state) => {
            state.role = null;
            state.loading = true;
            if (state.user) {
                state.user.role = null;
            }
        },
        userRoleChanged: (state, action) => {
            state.role = action.payload.role;
            state.loading = false;
            if (state.user) {
                state.user.role = action.payload.role;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(REHYDRATE, (state, action) => {
                if (action.payload?.auth) {
                    return { ...state, ...action.payload.auth };
                }
            })
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.role = action.payload.role;
            })
            .addCase(fetchUser.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.role = null;
            });
    }
});

export const { userLoggedIn, userLoggedOut, userRoleChanging, userRoleChanged } = authSlice.actions;
export default authSlice.reducer;

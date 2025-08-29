// src/store/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { decryptHash } from "../../lib/crypto";

let storedUser = null;
try {
    const encrypted_data = Cookies.get("access_data");
    if (encrypted_data) {
        storedUser = decryptHash(encrypted_data);

        if(!storedUser){
            storedUser = null;
            Cookies.remove("access_data");
        }
    }
} catch (e) {
    storedUser = null;
    Cookies.remove("access_data");
}

const initialState = {
    user: storedUser,
    isAuthenticated: !!storedUser,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            Cookies.remove("access_data");
        },
    },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;

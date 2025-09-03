// src/store/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { decryptHash } from "@/lib/crypto.js";
import Fingerprint from "@/utils/fingerprint.js";

let storedUser = null;
try {
    const browserUnique = await Fingerprint();
    const encrypted_data = Cookies.get("access_data");
    if (encrypted_data) {
        storedUser = decryptHash(encrypted_data); 
        if(!storedUser || storedUser.client !== browserUnique){
            storedUser = null;
            if (typeof window !== "undefined") {
                window.location.href = '/auth/logout';
            }
        }
    }
} catch (e) {
    storedUser = null;
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

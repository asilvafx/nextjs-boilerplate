"use client";

import { Provider } from "react-redux";
import { ThemeProvider } from "next-themes";
import store from "../store/store";
import SafeCartProvider from "./SafeCartProvider"; 

export default function Providers({ children }) {
    return (
        <Provider store={store}>
            <SafeCartProvider>
                <ThemeProvider attribute="class" enableSystem={true} defaultTheme="system">
                    {children}
                </ThemeProvider>
            </SafeCartProvider>
        </Provider>
    );
}

"use client"

import { createContext, useContext, useState } from 'react';
import '@/app/styles/Dashboard.css';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('');

    return (
        <DashboardContext.Provider value={{
            sidebarOpen,
            setSidebarOpen,
            activeSection,
            setActiveSection
        }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};

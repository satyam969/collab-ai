// src/app/projects/layout.js  
"use client";  
import React from 'react';  
import { SessionProvider } from 'next-auth/react';  

const Layout = ({ children }) => {  
    return (  
        <SessionProvider>  
            {children}  
        </SessionProvider>  
    );  
};  

export default Layout;
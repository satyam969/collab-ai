"use client";

import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  styled,
  Box,
} from "@mui/material";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import NotificationCenter from "./NotificationCenter";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: "transparent",
  backdropFilter: "blur(10px)",
  boxShadow: "none",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  color: "white",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  marginLeft: theme.spacing(2),
  transition: "background-color 0.3s",
}));

const Navbar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogin = () => {
    signIn();
  };

  const handleLogout = () => {
    signOut();
  };

  const navigateTo = (path) => {
    router.push(path);
  };

  return (
    <StyledAppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Collab AI
        </Typography>
        <StyledButton onClick={() => navigateTo("/")}>Home</StyledButton>
        <StyledButton onClick={() => navigateTo("/docs")}>
          Documentation
        </StyledButton>

        {status === "authenticated" && (
          <Box sx={{ ml: 1 }}>
            <NotificationCenter />
          </Box>
        )}

        {status === "authenticated" ? (
          <StyledButton onClick={handleLogout}>Logout</StyledButton>
        ) : (
          <StyledButton onClick={handleLogin}>Login</StyledButton>
        )}
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar;

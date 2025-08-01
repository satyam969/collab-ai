import React, { useState } from "react";
import {
  Typography,
  Card,
  Divider,
  Box,
  TextField,
  Paper,
  IconButton,
  Tooltip,
  Modal,
  AppBar,
  Toolbar,
} from "@mui/material";
import { styled } from "@mui/system";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import CloseIcon from "@mui/icons-material/Close";

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: "#1e1e1e",
  borderRadius: "8px",
  border: "1px solid #333",
  position: "relative",
  width: "100%",
  height: "100%",
  overflow: "hidden",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
  transition: "box-shadow 0.3s ease",
  "&:hover": {
    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.5)",
  },
}));

const FullscreenModal = styled(Modal)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& .MuiBackdrop-root": {
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
});

const FullscreenContainer = styled(Box)({
  width: "100vw",
  height: "100vh",
  backgroundColor: "#1e1e1e",
  display: "flex",
  flexDirection: "column",
  outline: "none",
});

const FullscreenIframeContainer = styled(Box)({
  flex: 1,
  overflow: "hidden",
  margin: 0,
  padding: 0,
});

const ProjectViewPanel = ({ url, setUrl, webContainer }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleClose = () => {
    setIsFullscreen(false);
  };

  const HeaderSection = ({ showFullscreenButton = true }) => (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 4,
          py: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: "#d4d4d4",
            fontSize: "16px",
            fontWeight: 500,
          }}
        >
          Project View
        </Typography>
        {showFullscreenButton && url && webContainer && (
          <Tooltip title="Fullscreen Preview">
            <IconButton
              onClick={handleFullscreenToggle}
              sx={{
                color: "#d4d4d4",
                "&:hover": {
                  backgroundColor: "rgba(79, 193, 255, 0.1)",
                  color: "#4fc1ff",
                },
              }}
            >
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Divider
        sx={{ margin: "0 16px", bgcolor: "rgba(255, 255, 255, 0.1)" }}
      />
    </>
  );

  const URLInput = ({ sx = {} }) => (
    <TextField
      value={url}
      onChange={(e) => setUrl(e.target.value)}
      label="Project URL"
      variant="outlined"
      fullWidth
      sx={{
        m: 2,
        backgroundColor: "#1e1e1e",
        borderRadius: "4px",
        input: { color: "#d4d4d4" },
        label: { color: "#888" },
        "& .MuiOutlinedInput-root": {
          "& fieldset": { borderColor: "#444" },
          "&:hover fieldset": { borderColor: "#666" },
          "&.Mui-focused fieldset": { borderColor: "#4fc1ff" },
        },
        ...sx,
      }}
    />
  );

  const IframeContent = ({ sx = {} }) => (
    <Paper
      sx={{
        flex: 1,
        m: 2,
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid #333",
        ...sx,
      }}
    >
      <iframe
        src={url}
        title="Project Preview"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
      />
    </Paper>
  );

  return (
    <>
      {/* Regular Panel View */}
      <StyledCard className="h-full flex flex-col">
        <HeaderSection />
        <URLInput />
        {url && webContainer && <IframeContent />}
      </StyledCard>

      {/* Fullscreen Modal */}
      <FullscreenModal
        open={isFullscreen}
        onClose={handleClose}
        closeAfterTransition
      >
        <FullscreenContainer>
          {/* Fullscreen Header */}
          <AppBar
            position="static"
            sx={{
              backgroundColor: "#1e1e1e",
              borderBottom: "1px solid #333",
              boxShadow: "none",
            }}
          >
            <Toolbar sx={{ minHeight: "56px !important" }}>
              <Typography
                variant="h6"
                sx={{
                  flexGrow: 1,
                  color: "#d4d4d4",
                  fontSize: "16px",
                  fontWeight: 500,
                }}
              >
                Project Preview - Fullscreen
              </Typography>
              
              <URLInput
                sx={{
                  m: 0,
                  mr: 2,
                  width: "400px",
                  "& .MuiInputBase-root": {
                    height: "40px",
                  },
                }}
              />
              
              <Tooltip title="Exit Fullscreen">
                <IconButton
                  onClick={handleClose}
                  sx={{
                    color: "#d4d4d4",
                    "&:hover": {
                      backgroundColor: "rgba(244, 67, 54, 0.1)",
                      color: "#f44336",
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Toolbar>
          </AppBar>

          {/* Fullscreen Content */}
          {url && webContainer && (
            <FullscreenIframeContainer>
              <iframe
                src={url}
                title="Project Preview - Fullscreen"
               style={{
                  width: "100%",
                  height: "100%", 
                  border: "none",
                  backgroundColor: "#ffffff",
                  display: "block",
                }}
              />
            </FullscreenIframeContainer>
          )}
        </FullscreenContainer>
      </FullscreenModal>
    </>
  );
};

export default ProjectViewPanel;
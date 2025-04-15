"use client";
// pages/index.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Card as MuiCard,
  styled,
  IconButton,
  Snackbar,
  Alert,
  Badge,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DeleteIcon from "@mui/icons-material/Delete";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { pusherClient } from "@/lib/pusherClient";

// Shared Styled Card Component
const StyledCard = styled(MuiCard)(({ theme }) => ({
  backgroundColor: "#222",
  borderRadius: "16px",
  border: "1px solid transparent",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "150px",
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 0 15px rgba(0, 0, 0, 0.5)",
  "&:before": {
    // content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    background:
      "linear-gradient(145deg, rgba(255, 0, 0, 0.3), rgba(0, 0, 255, 0.3))",
    filter: "blur(30px)",
  },
  "&:hover": {
    borderColor: "rgba(255, 0, 255, 0.8)",
  },
}));

// Styled Add Button to Match Card Style
const StyledAddButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#222",
  borderRadius: "16px",
  border: "1px solid transparent",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "150px",
  width: "100%",
  fontSize: "2rem",
  boxShadow: "0 0 15px rgba(0, 0, 0, 0.5)",
  position: "relative",
  overflow: "hidden",
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    background:
      "linear-gradient(145deg, rgba(255, 0, 0, 0.3), rgba(0, 0, 255, 0.3))",
    filter: "blur(30px)",
  },
  "&:hover": {
    backgroundColor: "rgba(255, 0, 255, 0.1)",
  },
}));

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [visibleCount, setVisibleCount] = useState(9);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const router = useRouter();

  const { data: session, status } = useSession();

  //   useEffect(() => {
  //     if (status === 'unauthenticated') {
  //         router.push('/login');
  //     }
  // }, [status, router]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get("/api/chats", {
        params: {
          userId: session?.user._id,
        },
      });

      setProjects(response.data.projects);
      // console.log(response.data.projects)
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (status !== "unauthenticated" && session?.user) {
      fetchProjects();

      // Subscribe to user-specific channel for notifications
      const userChannel = `user-${session.user._id}`;
      pusherClient.subscribe(userChannel);

      // Listen for project deletion notifications
      const handleProjectDeleted = (data) => {
        setNotification({
          open: true,
          message: data.message,
          severity: "info",
        });

        // Refresh projects list to reflect the changes
        fetchProjects();
      };

      // Listen for invitation responses
      const handleInvitationResponse = (data) => {
        setNotification({
          open: true,
          message: data.message,
          severity: "info",
        });

        // Refresh projects since a user might have joined
        fetchProjects();
      };

      // Listen for user removal notifications
      const handleUserRemoved = (data) => {
        setNotification({
          open: true,
          message: data.message,
          severity: "info",
        });

        // Refresh projects list to reflect the changes
        fetchProjects();
      };

      // Listen for the custom refreshProjects event from NotificationCenter
      const handleRefreshProjects = (event) => {
        // Verify this event is meant for current user
        if (event.detail?.userId === session.user._id) {
          console.log("Refreshing projects from custom event");
          fetchProjects();
        }
      };

      const handlerealtime=(data)=>{
        setNotification({
          open: true,
          message: data.message,
          severity: "info",
        });
      }

      // Bind all event listeners
      pusherClient.bind("project-deleted", handleProjectDeleted);
      pusherClient.bind("invitation-response", handleInvitationResponse);
      pusherClient.bind("user-removed", handleUserRemoved);
      document.addEventListener("refreshProjects", handleRefreshProjects);
      pusherClient.bind("new-invitation", handlerealtime);
      return () => {
        pusherClient.unsubscribe(userChannel);
        pusherClient.unbind("project-deleted", handleProjectDeleted);
        pusherClient.unbind("invitation-response", handleInvitationResponse);
        pusherClient.unbind("user-removed", handleUserRemoved);
        document.removeEventListener("refreshProjects", handleRefreshProjects);
        pusherClient.unbind("new-invitation", handlerealtime);
      };
    }
  }, [session, status]);

  const handleAddProject = async () => {
    try {
      if (!newProjectName) {
        setError("Project name is required.");
        return;
      }

      // Logic for Adding a New Project

      const response = await axios.post("/api/chats", {
        projectname: newProjectName,
        userId: session?.user?._id,
      });

      console.log(response);

      console.log("Adding project:", newProjectName);
      setNewProjectName("");
      setShowDialog(false);
      setError("");

      // Refresh projects
      fetchProjects();
    } catch (error) {
      console.log(error);
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 3);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleDeleteClick = (e, project) => {
    e.stopPropagation(); // Prevent navigating to project page
    setProjectToDelete(project);
    setShowDeleteDialog(true);
  };

  const handleDeleteProject = async () => {
    try {
      await axios.delete(`/api/chats`, {
        params: {
          userId: session?.user._id,
          projectid: projectToDelete.projectid,
          action: "deleteProject",
        },
      });

      setShowDeleteDialog(false);
      setProjectToDelete(null);

      // Show notification
      setNotification({
        open: true,
        message: `Project "${projectToDelete.projectname}" has been deleted successfully`,
        severity: "success",
      });

      // Refresh projects after deletion
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      setNotification({
        open: true,
        message: "Failed to delete project. Please try again.",
        severity: "error",
      });
    }
  };

  const isCreator = (project) => {
    return (
      project.users.length > 0 && project.users[0]._id === session?.user._id
    );
  };

  return (
    <>
      <Navbar />
      <Box
        sx={{
          padding: 2,
          backgroundColor: "#000",
          minHeight: "calc(100vh - 64px)", // Adjust based on navbar height
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <StyledAddButton
              variant="contained"
              onClick={() => setShowDialog(true)}
            >
              +
            </StyledAddButton>
          </Grid>
          {projects.slice(0, visibleCount).map((project) => (
            <Grid item xs={12} sm={6} md={3} key={project.projectid}>
              <StyledCard
                onClick={() => router.push(`/project/${project.projectid}`)}
                sx={{ position: "relative" }}
              >
                <Typography variant="h6" color="white">
                  {project.projectname}
                </Typography>
                {isCreator(project) && (
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      color: "white",
                      backgroundColor: "rgba(255, 0, 0, 0.2)",
                      "&:hover": {
                        backgroundColor: "rgba(255, 0, 0, 0.4)",
                      },
                    }}
                    onClick={(e) => handleDeleteClick(e, project)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </StyledCard>
            </Grid>
          ))}
        </Grid>

        <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
          <DialogTitle>Add New Project</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Project Name"
              type="text"
              fullWidth
              variant="outlined"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
            {error && <Typography color="error">{error}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDialog(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleAddProject} color="primary">
              Add
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
        >
          <DialogTitle>Delete Project</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{projectToDelete?.projectname}"?
              This will also delete all associated messages and cannot be
              undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDeleteDialog(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteProject} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>

        {visibleCount < projects.length && (
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            sx={{ marginTop: 2 }}
          >
            Load More
          </Button>
        )}
      </Box>
    </>
  );
};

export default Home;

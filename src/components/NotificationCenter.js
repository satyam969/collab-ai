import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Tab,
  Tabs,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import axios from "axios";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";

const NotificationCenter = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const { data: session } = useSession();

  const fetchNotifications = async () => {
    if (!session?.user?._id) return;

    setLoading(true);
    try {
      const response = await axios.get("/api/notifications", {
        params: {
          userId: session.user._id,
          limit: 10,
          skip: 0,
        },
      });

      setNotifications(response.data.notifications);
      setUnreadCount(response.data.pagination.unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    if (!session?.user?._id) return;

    try {
      const response = await axios.get("/api/invitations", {
        params: {
          userId: session.user._id,
        },
      });
      setInvitations(response.data.invitations);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
      fetchInvitations();

      // Set up interval to fetch notifications and invitations every minute
      const interval = setInterval(() => {
        fetchNotifications();
        fetchInvitations();
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [session]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications(); // Refresh notifications when menu is opened
    fetchInvitations(); // Refresh invitations when menu is opened
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMarkAllAsRead = async () => {
    if (!session?.user?._id) return;

    try {
      await axios.patch("/api/notifications", {
        userId: session.user._id,
        all: true,
      });

      // Update local state to mark all as read
      setNotifications((prevNotifications) =>
        prevNotifications.map((note) => ({ ...note, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    if (!session?.user?._id) return;

    try {
      await axios.patch("/api/notifications", {
        userId: session.user._id,
        notificationIds: [notificationId],
      });

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((note) =>
          note._id === notificationId ? { ...note, isRead: true } : note
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleInvitationResponse = async (invitationId, response) => {
    try {
      await axios.patch("/api/invitations", {
        invitationId,
        response,
        userId: session?.user._id,
      });

      // Refresh invitations list
      fetchInvitations();

      // If accepted, also refresh notifications and trigger event for Home component
      if (response === "accepted") {
        setTimeout(() => {
          fetchNotifications();

          // Dispatch a custom event that Home page can listen for
          const refreshEvent = new CustomEvent("refreshProjects", {
            detail: { userId: session?.user._id },
          });
          document.dispatchEvent(refreshEvent);
        }, 500);
      }
    } catch (error) {
      console.error("Error responding to invitation:", error);
    }
  };

  const formatNotificationTime = (createdAt) => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    } catch (error) {
      return "";
    }
  };

  const getNotificationIcon = (type) => {
    // You can add different icons based on notification type
    return <NotificationsIcon fontSize="small" />;
  };

  const getTotalUnreadCount = () => {
    return unreadCount + invitations.length;
  };

  return (
    <Box>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={getTotalUnreadCount()} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            width: 320,
            maxHeight: 500,
            overflow: "auto",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            bgcolor: "#222",
            color: "white",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": { color: "white" },
              "& .Mui-selected": { color: "#4fc1ff" },
              "& .MuiTabs-indicator": { backgroundColor: "#4fc1ff" },
            }}
          >
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography>Notifications</Typography>
                  {unreadCount > 0 && (
                    <Badge
                      badgeContent={unreadCount}
                      color="error"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography>Invitations</Typography>
                  {invitations.length > 0 && (
                    <Badge
                      badgeContent={invitations.length}
                      color="error"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              }
            />
          </Tabs>

          {activeTab === 0 && (
            <Box>
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Notifications
                </Typography>
                {unreadCount > 0 && (
                  <Button
                    onClick={handleMarkAllAsRead}
                    size="small"
                    sx={{ color: "#4fc1ff" }}
                  >
                    Mark all as read
                  </Button>
                )}
              </Box>

              <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />

              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <CircularProgress size={24} sx={{ color: "#4fc1ff" }} />
                </Box>
              ) : notifications.length === 0 ? (
                <MenuItem
                  sx={{ color: "#999", justifyContent: "center", py: 3 }}
                >
                  <Typography variant="body2">No notifications</Typography>
                </MenuItem>
              ) : (
                <List sx={{ p: 0 }}>
                  {notifications.map((notification) => (
                    <ListItem
                      key={notification._id}
                      sx={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        p: 2,
                        bgcolor: notification.isRead
                          ? "transparent"
                          : "rgba(79, 193, 255, 0.1)",
                        transition: "background-color 0.3s",
                        "&:hover": {
                          bgcolor: "rgba(79, 193, 255, 0.05)",
                        },
                      }}
                      onClick={() =>
                        !notification.isRead &&
                        handleMarkAsRead(notification._id)
                      }
                    >
                      <Box sx={{ display: "flex", width: "100%", mb: 1 }}>
                        <Box sx={{ mr: 1 }}>
                          {getNotificationIcon(notification.type)}
                        </Box>
                        <ListItemText
                          primary={notification.message}
                          secondary={formatNotificationTime(
                            notification.createdAt
                          )}
                          primaryTypographyProps={{
                            variant: "body2",
                            color: "white",
                            sx: {
                              fontWeight: notification.isRead
                                ? "normal"
                                : "bold",
                            },
                          }}
                          secondaryTypographyProps={{
                            variant: "caption",
                            color: "#bbb",
                            sx: { mt: 0.5 },
                          }}
                        />
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}

              {notifications.length > 0 && (
                <Box sx={{ p: 1, display: "flex", justifyContent: "center" }}>
                  <Button
                    size="small"
                    sx={{ color: "#4fc1ff", fontSize: "0.75rem" }}
                    onClick={() => {
                      // You can implement viewing all notifications here
                      handleClose();
                    }}
                  >
                    View All
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Project Invitations
                </Typography>
              </Box>

              <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />

              {invitations.length === 0 ? (
                <MenuItem
                  sx={{ color: "#999", justifyContent: "center", py: 3 }}
                >
                  <Typography variant="body2">
                    No pending invitations
                  </Typography>
                </MenuItem>
              ) : (
                <List sx={{ width: "100%", p: 0 }}>
                  {invitations.map((invitation) => (
                    <ListItem
                      key={invitation._id}
                      sx={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        p: 2,
                        bgcolor: "rgba(79, 193, 255, 0.1)",
                        transition: "background-color 0.3s",
                        "&:hover": {
                          bgcolor: "rgba(79, 193, 255, 0.05)",
                        },
                      }}
                    >
                      <ListItemText
                        primary={`Project: ${invitation.projectName}`}
                        secondary={`From: ${
                          invitation.invitedBy?.name || "Unknown user"
                        }`}
                        primaryTypographyProps={{ color: "white" }}
                        secondaryTypographyProps={{ color: "#bbb" }}
                      />
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          mt: 1,
                          alignSelf: "flex-end",
                        }}
                      >
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() =>
                            handleInvitationResponse(invitation._id, "accepted")
                          }
                        >
                          Accept
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          onClick={() =>
                            handleInvitationResponse(invitation._id, "rejected")
                          }
                        >
                          Decline
                        </Button>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}
        </Box>
      </Menu>
    </Box>
  );
};

export default NotificationCenter;

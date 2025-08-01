
import React, { useState } from "react";
import {
  Typography,
  Card,
  Divider,
  Box,
  TextField,
  Button,
  Modal,
  List,
  ListItem,
  ListItemText,
  IconButton,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { styled } from "@mui/system";
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

const MessageContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  flex: 1,
  padding: "12px",
  backgroundColor: "#252526",
  gap: '10px', // Add a gap between message groups
});

const MessageBubble = styled(Card)(({ isuser }) => ({
  maxWidth: "85%", // Allow bubbles to be a bit wider
  background: isuser === "true" ? "#0078d4" : "#3c3c3c",
  color: "white",
  borderRadius: "12px",
  padding: "8px 12px",
  overflowWrap: "break-word",
  wordBreak: "break-word",
  whiteSpace: "pre-wrap",
  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
}));

const MessageWrapper = styled(Box)(({ isuser }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: isuser === 'true' ? 'flex-end' : 'flex-start',
}));

const ChatPanel = ({
  chats,
  newMessage,
  setNewMessage,
  include,
  setInclude,
  handleSendMessage,
  addedUsers,
  searchuser,
  searchTerm,
  setSearchTerm,
  handleAddUser,
  handleRemoveUser,
  session,
  messageContainerRef,
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Added safety checks for user and user.name
  const filteredSearchUsers = searchuser.filter((user) =>
    user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <StyledCard
      className="h-full flex flex-col"
      sx={{
        "&::-webkit-scrollbar": {
          width: "6px",
          height: "6px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(255, 255, 255, 0.2)",
          borderRadius: "10px",
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
      }}
    >
      <Box
        className="flex flex-row justify-between items-center px-4 py-2"
        sx={{ color: "#d4d4d4", fontSize: "16px", fontWeight: 500 }}
      >
        Chats
        <Button
          onClick={handleOpen}
          sx={{
            color: "#4fc1ff",
            textTransform: "none",
            fontSize: "14px",
            "&:hover": {
              backgroundColor: "#2a2d2e",
            },
          }}
        >
          Add Users
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          sx={{
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              backgroundColor: "#252526",
              border: "1px solid #333",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
              p: 3,
              borderRadius: 2,
              color: "#d4d4d4",
            }}
          >
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
              gutterBottom
              sx={{ fontSize: "18px" }}
            >
              Available Users
            </Typography>
            <TextField
              label="Search Users"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                mb: 2,
                backgroundColor: "#1e1e1e",
                borderRadius: "4px",
                input: { color: "#d4d4d4" },
                label: { color: "#888" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#444" },
                  "&:hover fieldset": { borderColor: "#666" },
                  "&.Mui-focused fieldset": { borderColor: "#4fc1ff" },
                },
              }}
            />
            <Typography
              variant="h6"
              component="h2"
              gutterBottom
              sx={{ fontSize: "16px" }}
            >
              Users in this Project
            </Typography>
            {addedUsers.length > 0 ? (
              <List>
                {addedUsers.map((user) => (
                  <ListItem
                    key={user._id}
                    sx={{
                      backgroundColor: "#2a2d2e",
                      marginBottom: "8px",
                      borderRadius: "4px",
                      position: "relative",
                      transition: "background-color 0.2s ease",
                      "&:hover": {
                        backgroundColor: "#323232",
                      },
                    }}
                  >
                    <ListItemText
                      primary={user.name}
                      sx={{ color: "#d4d4d4" }}
                    />
                    <IconButton
                      onClick={() => handleRemoveUser(user)}
                      sx={{
                        position: "absolute",
                        top: "50%",
                        right: "10px",
                        transform: "translateY(-50%)",
                        color: "#f44336",
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" sx={{ color: "#888" }}>
                No users in this project.
              </Typography>
            )}
            <Typography
              variant="h6"
              component="h2"
              gutterBottom
              sx={{ mt: 3, fontSize: "16px" }}
            >
              Add Users to Project
            </Typography>
            {filteredSearchUsers.length > 0 ? (
              <List>
                {filteredSearchUsers.map((user) => (
                  <ListItem
                    key={user._id}
                    sx={{
                      backgroundColor: "#2a2d2e",
                      marginBottom: "8px",
                      borderRadius: "4px",
                      position: "relative",
                      transition: "background-color 0.2s ease",
                      "&:hover": {
                        backgroundColor: "#323232",
                      },
                    }}
                  >
                    <ListItemText
                      primary={user.name}
                      sx={{ color: "#d4d4d4" }}
                    />
                    <IconButton
                      onClick={() => handleAddUser(user)}
                      sx={{
                        position: "absolute",
                        top: "50%",
                        right: "10px",
                        transform: "translateY(-50%)",
                        color: "#4caf50",
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" sx={{ color: "#888" }}>
                No users available to add.
              </Typography>
            )}
            <Button
              onClick={handleClose}
              variant="contained"
              sx={{
                mt: 2,
                backgroundColor: "#3c3c3c",
                color: "#d4d4d4",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#444",
                },
              }}
            >
              Close
            </Button>
          </Box>
        </Modal>
      </Box>
      <Divider
        sx={{ margin: "0 16px", bgcolor: "rgba(255, 255, 255, 0.1)" }}
      />
      <MessageContainer ref={messageContainerRef}>
        {chats?.map((chat) => {
          const isCurrentUser = chat?.sender?._id === session?.user?._id;
          return (
            <MessageWrapper key={chat?._id} isuser={isCurrentUser.toString()}>
              {!isCurrentUser && (
                <Typography sx={{ ml: 1, mb: 0.5, fontSize: "12px", color: "#b0b0b0" }}>
                  {chat?.sender?.name || 'Unknown User'}
                </Typography>
              )}
              <MessageBubble isuser={isCurrentUser.toString()}>
                <Typography sx={{ fontSize: "14px", color: "white" }}>
                  {chat?.content}
                </Typography>
              </MessageBubble>
            </MessageWrapper>
          );
        })}
      </MessageContainer>
      <Box sx={{ padding: "12px", backgroundColor: "#252526" }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { // Send on Enter, new line on Shift+Enter
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
          sx={{
            backgroundColor: "#1e1e1e",
            borderRadius: "4px",
            input: { color: "#d4d4d4" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#444" },
              "&:hover fieldset": { borderColor: "#666" },
              "&.Mui-focused fieldset": { borderColor: "#4fc1ff" },
            },
          }}
        />
        <Box sx={{ display: "flex", alignItems: "center", mt: 1, gap: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={include}
                onChange={(e) => setInclude(e.target.checked)}
                sx={{
                  color: "#888",
                  "&.Mui-checked": {
                    color: "#4fc1ff",
                  },
                }}
              />
            }
            label="Files"
            sx={{ color: "#d4d4d4", margin: 0 }}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            sx={{
              backgroundColor: "#0078d4",
              color: "#ffffff",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#005ea2",
              },
            }}
          >
            Send
          </Button>
        </Box>
      </Box>
    </StyledCard>
  );
};

export default ChatPanel;
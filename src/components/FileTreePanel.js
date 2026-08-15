import React, { useState } from "react";
import {
  Typography,
  Card,
  Divider,
  Box,
  TextField,
  Button,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from "@mui/material";
import LiveRoomWrapper from "./LiveRoomWrapper";
import CollaborativeEditor from "./CollaborativeEditor";
import { styled } from "@mui/system";
import AceEditor from "react-ace";
import axios from "axios";


import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-monokai";


import FileTree from "./FileTree";

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

const FileTreePanel = ({
  fileTree,
  setFileTree,
  selectedFileName,
  selectedFileContent,
  expandedDirs,
  projectType,
  clickCount,
  lastfiletreeid,
  handleSelectFile,
  toggleDirectory,
  handleFileContentChange,
  handleSave,
  handleProjectTypeChange,
  handleRunProject,
  setNotification,
  projectId,
  externalUpdateCount,
  pendingFileTree,
  onLiveModeChange
}) => {
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createPath, setCreatePath] = useState("Root");
  const [newItemName, setNewItemName] = useState("");
  const [newItemType, setNewItemType] = useState("file");
  const [liveRoomContent, setLiveRoomContent] = useState("");
  // showUpdateBanner is true whenever Live Room is ON and there are pending AI/save updates
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  // Ref to the Yjs apply function exposed by CollaborativeEditor
  const applyUpdatesRef = React.useRef(null);

  const handleSaveClick = () => {
    if (isLiveMode) {
      handleSave(liveRoomContent, selectedFileName);
      handleFileContentChange(liveRoomContent);
    } else {
      handleSave();
    }
  };

  const handleLiveModeToggle = (val) => {
    setIsLiveMode(val);
    if (!val) setShowUpdateBanner(false); // clear banner when leaving Live Room
    if (onLiveModeChange) onLiveModeChange(val);
  };
  // Show the banner whenever there are pending updates AND we're in Live Room mode
  React.useEffect(() => {
    if (isLiveMode && externalUpdateCount > 0) {
      setShowUpdateBanner(true);
    }
  }, [isLiveMode, externalUpdateCount]);

  const handleApplyUpdates = () => {
    if (applyUpdatesRef.current) {
      applyUpdatesRef.current();
    }
    setShowUpdateBanner(false);
  };

  const handleCreateModalOpen = (path, type = "file") => {
    setCreatePath(path);
    setNewItemType(type);
    setCreateModalOpen(true);
  };

  const getLanguage = (fileName) => {

    if (!fileName) {
      return "text";
    }

    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "js":
      case "jsx":
        return "javascript";
      case "ts":
      case "tsx":
        return "typescript";
      case "json":
        return "json";
      case "html":
        return "html";
      case "css":
        return "css";
      case "py":
        return "python";
      default:
        return "text";
    }
  };

  const handleCreateModalClose = () => {
    setCreateModalOpen(false);
    setNewItemName("");
    setNewItemType("file");
    setCreatePath("Root");
  };

  const handleCreateItem = () => {
    if (!newItemName) {
      alert("Please enter a name for the new item.");
      return;
    }

    const invalidChars = /[<>:"\/\\|?*]/;
    if (invalidChars.test(newItemName)) {
      alert('Item name contains invalid characters (<>:"/\\|?*).');
      return;
    }

    setFileTree((prevFileTree) => {
      const newFileTree = JSON.parse(JSON.stringify(prevFileTree));
      let target = newFileTree;

      if (createPath === "Root") {
        if (target[newItemName]) {
          alert("An item with this name already exists at the root level.");
          return prevFileTree;
        }
        if (newItemType === "folder") {
          target[newItemName] = { directory: {} };
        } else {
          target[newItemName] = { file: { contents: "" } };
        }
        return newFileTree;
      }

      const pathParts = createPath.split("/");
      for (let part of pathParts) {
        if (!target[part]) {
          target[part] = { directory: {} };
        }
        if (!target[part].directory) {
          alert(`Path ${part} is not a directory.`);
          return prevFileTree;
        }
        target = target[part].directory;
      }

      if (target[newItemName]) {
        alert("An item with this name already exists at this path.");
        return prevFileTree;
      }

      if (newItemType === "folder") {
        target[newItemName] = { directory: {} };
      } else {
        target[newItemName] = { file: { contents: "" } };
      }

      return newFileTree;
    });

    handleCreateModalClose();
  };

  const handleDeleteItem = async (path, isDirectory) => {
    try {
      const newFileTree = await new Promise((resolve) => {
        setFileTree((prevFileTree) => {
          const newFileTree = JSON.parse(JSON.stringify(prevFileTree));
          let target = newFileTree;
          const pathParts = path.split("/");
          const itemName = pathParts.pop();

          for (let part of pathParts) {
            if (!target[part] || !target[part].directory) {
              console.error(`Path ${part} does not exist or is not a directory.`);
              return prevFileTree;
            }
            target = target[part].directory;
          }

          if (target[itemName]) {
            if (isDirectory && !target[itemName].directory) {
              console.error(`Item at ${path} is not a directory.`);
              return prevFileTree;
            }
            if (!isDirectory && !target[itemName].file) {
              console.error(`Item at ${path} is not a file.`);
              return prevFileTree;
            }
            delete target[itemName];
          } else {
            console.error(`Item at ${path} does not exist.`);
            return prevFileTree;
          }

          resolve(newFileTree);
          return newFileTree;
        });
      });

      if (!lastfiletreeid) {
        console.error("No previous fileTree message ID found");
        return;
      }

      await axios.patch("/api/messages", {
        content: JSON.stringify({ fileTree: newFileTree }),
        messageId: lastfiletreeid,
      });

      setNotification({
        open: true,
        message: `Successfully deleted ${isDirectory ? "folder" : "file"}`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      setNotification({
        open: true,
        message: `Failed to delete ${isDirectory ? "folder" : "file"}`,
        severity: "error",
      });
    }
  }

  return (
    <StyledCard className="h-full flex flex-col">
      <Typography
        className="flex flex-row justify-between items-center px-4 py-2"
        variant="h6"
        sx={{ color: "#d4d4d4", fontSize: "16px", fontWeight: 500 }}
      >
        File Tree
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <FormControlLabel
            control={
              <Switch
                checked={isLiveMode}
                onChange={(e) => setIsLiveMode(e.target.checked)}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "#4fc1ff",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#4fc1ff",
                  },
                }}
              />
            }
            label="Live Room"
            sx={{ color: "#d4d4d4", mr: 1 }}
          />
          <FormControl sx={{ minWidth: 120, mr: 1 }}>
            <InputLabel sx={{ color: "#888" }}>Project Type</InputLabel>
            <Select
              value={projectType}
              onChange={handleProjectTypeChange}
              sx={{
                color: "#d4d4d4",
                backgroundColor: "#1e1e1e",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#444",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#666",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#4fc1ff",
                },
              }}
            >
              <MenuItem value="react">React.js</MenuItem>
              <MenuItem value="next">Next.js</MenuItem>
              <MenuItem value="express">Express.js</MenuItem>
            </Select>
          </FormControl>
          <Button
            onClick={handleRunProject}
            sx={{
              color: "#4fc1ff",
              textTransform: "none",
              fontSize: "14px",
              "&:hover": {
                backgroundColor: "#2a2d2e",
              },
            }}
          >
            {clickCount === 0 ? "Install" : clickCount === 1 ? "Installing..." : "Run"}
          </Button>
        </Box>
        <Modal
          open={createModalOpen}
          onClose={handleCreateModalClose}
          aria-labelledby="create-modal-title"
          aria-describedby="create-modal-description"
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
              borderRadius: "4px",
              color: "#d4d4d4",
            }}
          >
            <Typography
              id="create-modal-title"
              variant="h6"
              component="h2"
              gutterBottom
              sx={{ fontSize: "18px" }}
            >
              Create New {newItemType === "file" ? "File" : "Folder"}
            </Typography>
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
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
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                onClick={handleCreateItem}
                variant="contained"
                sx={{
                  backgroundColor: "#4caf50",
                  color: "#ffffff",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#388e3c",
                  },
                }}
              >
                Create
              </Button>
              <Button
                onClick={handleCreateModalClose}
                variant="contained"
                sx={{
                  backgroundColor: "#3c3c3c",
                  color: "#d4d4d4",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#444",
                  },
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Modal>
      </Typography>
      <Divider
        sx={{ margin: "0 16px", bgcolor: "rgba(255, 255, 255, 0.1)" }}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          overflowX: "auto",
          overflowY: "auto",
          flex: "0 1 auto",
          margin: "8px 0",
          backgroundColor: "#252526",
          padding: "8px",
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
        <FileTree
          tree={fileTree}
          selectedFileName={selectedFileName}
          expandedDirs={expandedDirs}
          handleSelectFile={handleSelectFile}
          toggleDirectory={toggleDirectory}
          handleCreateModalOpen={handleCreateModalOpen}
          handleDeleteItem={handleDeleteItem}
        />
      </Box>
      <Box
        sx={{
          flex: "1 1 auto",
          padding: "12px",
          backgroundColor: "#1e1e1e",
          borderRadius: "4px",
          color: "#d4d4d4",
          overflow: "auto",
          margin: "0 16px 16px 16px",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          fontFamily: '"Fira Code", monospace',
          fontSize: "14px",
          lineHeight: "1.5",
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
        {/* Apply Updates banner — always visible in Live Room when updates are pending,
            regardless of which file is open. Lives outside CollaborativeEditor so it
            doesn't disappear when the file is closed by handleUpdatedFileTree. */}
        {isLiveMode && showUpdateBanner && (
          <div style={{
            background: 'linear-gradient(90deg, #1d4ed8, #2563eb)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '13px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            <span>&#x1F4E6; New updates available for all files.</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={handleApplyUpdates}
                style={{
                  background: 'white', color: '#1d4ed8',
                  border: 'none', borderRadius: '6px',
                  padding: '4px 12px', fontSize: '12px',
                  fontWeight: 700, cursor: 'pointer',
                }}
              >
                Apply Updates
              </button>
              <button
                onClick={() => setShowUpdateBanner(false)}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>
          </div>
        )}
        {selectedFileName ? (
          <>
            {isLiveMode ? (
              <LiveRoomWrapper roomId={`room-${projectId}`}>
                <CollaborativeEditor
                  key={selectedFileName}
                  fileId={selectedFileName}
                  language={getLanguage(selectedFileName)}
                  theme="vs-dark"
                  initialContent={selectedFileContent}
                  onChange={setLiveRoomContent}
                  pendingFileTree={pendingFileTree}
                  onApplyReady={(fn) => { applyUpdatesRef.current = fn; }}
                  onApplied={() => setShowUpdateBanner(false)}
                />
              </LiveRoomWrapper>
            ) : (
              <AceEditor
                mode={getLanguage(selectedFileName)}
                theme="monokai"
                value={selectedFileContent}
                onChange={handleFileContentChange}
                name="code-editor"
                editorProps={{ $blockScrolling: true }}
                setOptions={{
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: true,
                  enableSnippets: true,
                  showLineNumbers: true,
                  tabSize: 2,
                  useWorker: false,
                }}
                style={{
                  width: "100%",
                  height: "900px",
                  borderRadius: "4px",
                  fontFamily: '"Fira Code", monospace',
                  fontSize: "18px",
                }}
              />
            )}
            <Button
              onClick={handleSaveClick}
              sx={{
                mt: 0.3,
                backgroundColor: "#0078d4",
                color: "#ffffff",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#005ea2",
                },
              }}
            >
              Save
            </Button>
          </>
        ) : (
          <Typography
            sx={{ color: "#888", textAlign: "center", padding: "20px" }}
          >
            Select a file to view its contents
          </Typography>
        )}
      </Box>
    </StyledCard>
  );
};

export default FileTreePanel;

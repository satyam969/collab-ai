import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DeleteIcon from "@mui/icons-material/Delete";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

const FileTree = ({
  tree,
  parentPath = "",
  selectedFileName,
  expandedDirs,
  handleSelectFile,
  toggleDirectory,
  handleCreateModalOpen,
  handleDeleteItem,
}) => {
  return (
    <>
      {/* Root-level actions */}
      {parentPath === "" && (
        <Box
          sx={{ display: "flex", alignItems: "center", padding: "4px 8px" }}
        >
          <Typography
            sx={{
              flexGrow: 1,
              color: "#d4d4d4",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Project Root
          </Typography>
          <IconButton
            onClick={() => handleCreateModalOpen("Root", "file")}
            sx={{ color: "#4fc1ff", padding: "2px" }}
            title="New File"
          >
            <NoteAddIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => handleCreateModalOpen("Root", "folder")}
            sx={{ color: "#4fc1ff", padding: "2px" }}
            title="New Folder"
          >
            <CreateNewFolderIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      {Object.keys(tree).map((key) => {
        const item = tree[key];
        const currentPath = parentPath ? `${parentPath}/${key}` : key;

        if (item.directory) {
          const isExpanded = expandedDirs[currentPath] || false;
          return (
            <Box
              key={currentPath}
              sx={{ marginLeft: parentPath ? "16px" : "0" }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  padding: "4px 8px",
                  backgroundColor: isExpanded ? "#2a2d2e" : "transparent",
                  borderRadius: "4px",
                  transition: "background-color 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#2a2d2e",
                  },
                }}
              >
                <IconButton
                  onClick={() => toggleDirectory(currentPath)}
                  size="small"
                  sx={{ color: "#d4d4d4", padding: "2px" }}
                >
                  {isExpanded ? (
                    <ExpandMoreIcon fontSize="small" />
                  ) : (
                    <ChevronRightIcon fontSize="small" />
                  )}
                </IconButton>
                <FolderIcon
                  sx={{
                    color: "#90a4ae",
                    marginRight: "8px",
                    fontSize: "18px",
                  }}
                />
                <Typography
                  onClick={() => toggleDirectory(currentPath)}
                  sx={{
                    flexGrow: 1,
                    color: "#d4d4d4",
                    fontSize: "14px",
                    cursor: "pointer",
                    "&:hover": {
                      color: "#ffffff",
                    },
                  }}
                >
                  {key}
                </Typography>
                <IconButton
                  onClick={() => handleCreateModalOpen(currentPath, "file")}
                  sx={{ color: "#4fc1ff", padding: "2px" }}
                  title="New File"
                >
                  <NoteAddIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={() => handleCreateModalOpen(currentPath, "folder")}
                  sx={{ color: "#4fc1ff", padding: "2px" }}
                  title="New Folder"
                >
                  <CreateNewFolderIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={() => handleDeleteItem(currentPath, true)}
                  sx={{ color: "#f44336", padding: "2px" }}
                  title="Delete Folder"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
              {isExpanded && (
                <FileTree
                  tree={item.directory}
                  parentPath={currentPath}
                  selectedFileName={selectedFileName}
                  expandedDirs={expandedDirs}
                  handleSelectFile={handleSelectFile}
                  toggleDirectory={toggleDirectory}
                  handleCreateModalOpen={handleCreateModalOpen}
                  handleDeleteItem={handleDeleteItem}
                />
              )}
            </Box>
          );
        }

        return (
          <Box
            key={currentPath}
            sx={{ marginLeft: parentPath ? "16px" : "0" }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                padding: "4px 8px",
                borderRadius: "4px",
                transition: "all 0.2s ease",
                backgroundColor:
                  selectedFileName === currentPath ? "#37373d" : "transparent",
                "&:hover": {
                  backgroundColor:
                    selectedFileName === currentPath ? "#37373d" : "#2a2d2e",
                },
              }}
            >
              <InsertDriveFileIcon
                sx={{
                  color:
                    selectedFileName === currentPath ? "#ffffff" : "#4fc1ff",
                  marginRight: "8px",
                  fontSize: "18px",
                }}
              />
              <Typography
                onClick={() => handleSelectFile(item, currentPath)}
                sx={{
                  flexGrow: 1,
                  color:
                    selectedFileName === currentPath ? "#ffffff" : "#d4d4d4",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontWeight: selectedFileName === currentPath ? 600 : 400,
                  "&:hover": {
                    color: "#ffffff",
                  },
                }}
              >
                {key}
              </Typography>
              <IconButton
                onClick={() => handleDeleteItem(currentPath, false)}
                sx={{ color: "#f44336", padding: "2px" }}
                title="Delete File"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        );
      })}
    </>
  );
};

export default FileTree;
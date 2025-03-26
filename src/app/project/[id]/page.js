"use client";  
import React, { useEffect, useState, useRef } from 'react';  
import { Container, Typography, Card, Divider, Box, TextField, Button, Modal, List, ListItem, ListItemText, IconButton, Paper, FormControlLabel, Checkbox, Select, MenuItem, FormControl, InputLabel } from '@mui/material';  
import { styled } from '@mui/system';  
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getWebContainer } from '@/lib/webconatiner';
import { pusherClient } from '@/lib/pusherClient';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteIcon from '@mui/icons-material/Delete';
import NoteAddIcon from '@mui/icons-material/NoteAdd'; // Icon for new file
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder'; // Icon for new folder
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import AceEditor from 'react-ace';

// Import Ace Editor themes and modes
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-typescript';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#1e1e1e',
  borderRadius: '8px',
  border: '1px solid #333',
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.5)',
  },
}));  

const MessageContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
  flex: 1,
  padding: '12px',
  backgroundColor: '#252526',
});  

const MessageBubble = styled(Card)(({ isuser }) => ({
  maxWidth: '70%',
  margin: isuser === 'true' ? '8px 0 8px auto' : '8px auto 8px 0',
  background: isuser === 'true' ? '#0078d4' : '#3c3c3c',
  color: 'white',
  borderRadius: '12px',
  padding: '10px 14px',
  overflowWrap: 'break-word',
  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'flex-start',
  minHeight: '40px',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));  

const Projects = () => {  
  const [runProcess, setRunProcess] = useState(null);
  const [open, setOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createPath, setCreatePath] = useState('Root'); // Track the path where the new item will be created
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState('file');
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleCreateModalOpen = (path, type = 'file') => {
    setCreatePath(path);
    setNewItemType(type);
    setCreateModalOpen(true);
  };
  const handleCreateModalClose = () => {
    setCreateModalOpen(false);
    setNewItemName('');
    setNewItemType('file');
    setCreatePath('Root');
  };
  const [chats, setChats] = useState([]);  
  const [fileTree, setFileTree] = useState({});  
  const [selectedFiles, setSelectedFiles] = useState(new Set());  
  const [include, setInclude] = useState(false);
  const [newMessage, setNewMessage] = useState('');  
  const [selectedFileContent, setSelectedFileContent] = useState('');  
  const [selectedFileName, setSelectedFileName] = useState(''); 
  const router = useRouter(); 
  const [lastfiletreeid, setLastFileTreeId] = useState(null);
  const [webContainer, setWebContainer] = useState(null);
  const [url, setUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [addedUsers, setAddedUsers] = useState([]);
  const [searchuser, setSearchUser] = useState([]);
  const { data: session, status } = useSession();
  const { id } = useParams();
  const [clickCount, setClickCount] = useState(1);  
  const messageContainerRef = useRef(null);
  const [expandedDirs, setExpandedDirs] = useState({});

  const handleClickbuton = () => {  
    if (clickCount == 1) {
      setTimeout(() => {  
        setClickCount((prevCount) => (prevCount + 1) % 2);  
      }, 6000);     
    }
  }; 

  const projectid = id;

  if (!projectid) {
    return <div>Loading...</div>;
  }

  const addusers = async (usersearch) => {
    try {
      const response = await axios.get(`/api/user`, { params: usersearch });
      const addedUserIdsSet = new Set(addedUsers?.map(user => user._id)); 
      const filteredUsers = response.data.data.filter(user => {  
        return !addedUserIdsSet.has(user._id);  
      });  
      setSearchUser(filteredUsers);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    pusherClient.subscribe(`${projectid}`);
    addusers();

    const handleMessage = (message) => {
      if (message.sender && message.sender._id === process.env.NEXT_PUBLIC_AI) {
        try {
          const parsedContent = JSON.parse(message.content);
          if (parsedContent?.fileTree) {
            setLastFileTreeId(message._id); 
            setFileTree(parsedContent.fileTree);
          }
          if (parsedContent?.text) {
            const newmess = {
              ...message, 
              content: parsedContent.text, 
            };
            setChats((prev) => [...prev, newmess]);
            allMessages();
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        setChats((prev) => [...prev, message]);
      }
    };

    const handleUpdatedFileTree = (message) => {
      setSelectedFiles(new Set());
      setSelectedFileContent('');
      setSelectedFileName('');
      setFileTree(message);
    };

    pusherClient.bind('incoming-message', handleMessage);
    pusherClient.bind('updatedfiletree', handleUpdatedFileTree);

    return () => {
      pusherClient.unsubscribe(`chat:${projectid}`);
      pusherClient.unbind('incoming-message', handleMessage);
    };
  }, [projectid, chats]);

  const allMessages = async () => {
    try {
      const response = await axios.get('/api/messages', {
        params: {
          chatId: projectid,  
        }
      });
      const ALLMESSAGE = [];
      response.data.forEach((message) => {
        if (message.sender && message.sender._id === process.env.NEXT_PUBLIC_AI) {
          try {
            const parsedContent = JSON.parse(message.content);
            if (parsedContent?.fileTree) {
              setLastFileTreeId(message._id); 
              setFileTree(parsedContent.fileTree);
            }
            const newmess = {
              ...message, 
              content: parsedContent.text, 
            };
            ALLMESSAGE.push(newmess);
          } catch (error) {
            console.error("Failed to parse AI message content:", error);
          }
        } else {
          ALLMESSAGE.push(message);
        }
      });
      setChats(ALLMESSAGE);
    } catch (error) {
      console.log(error);
    }
  };

  const Chat = async () => {
    try {
      const response = await axios.post(`/api/chats`, { projectid });
      setAddedUsers(response.data.result.users);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    Chat();
    if (!webContainer) {
      getWebContainer().then(container => {
        setWebContainer(container);
        console.log("container started");
      });
    }
    allMessages();
  }, []);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chats]);

  const handleSelectFile = (file, filePath) => {  
    if (!file) {
      return;
    }
    setSelectedFiles((prev) => new Set(prev).add(filePath)); 
    setSelectedFileContent(file.file.contents);  
    setSelectedFileName(filePath);
  };  

  const handleRemoveFile = (fileId) => {  
    setSelectedFiles((prev) => {  
      const newSet = new Set(prev);  
      newSet.delete(fileId);  
      return newSet;  
    });  
    setSelectedFileContent('');  
    setSelectedFileName('');
  };  

  const handleSendMessage = async (e) => {
    try {    
      e.preventDefault();
      const inc = include && lastfiletreeid;
      const response = await axios.post('/api/messages', {
        content: newMessage,
        ...(inc && { filetree: JSON.stringify(fileTree) }),
        projectid,
        sender: session?.user._id
      });
      setChats([...chats, response.data.result]);  
      setNewMessage('');  
    } catch (error) {
      console.error(error);
    }
  };  

  const handleAddUser = async (user) => {
    const response = await axios.post('/api/chats', {
      projectid,
      userId: user._id
    });
    setSearchUser(searchuser.filter((item) => item.id !== user.id));
    setAddedUsers([...addedUsers, user]);
  };

  const handleRemoveUser = async (user) => {
    const response = await axios.delete('/api/chats', {
      params: { projectid, userId: user._id }
    });
    setAddedUsers(addedUsers.filter((item) => item.id !== user.id));
    setSearchUser([...searchuser, user]);
  };

  const filteredSearchUsers = searchuser.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    try {
      if (!lastfiletreeid) {
        console.log('No Prev Prompt Generated fileTree ');
        return;
      }
      const response = await axios.patch('/api/messages', {
        content: JSON.stringify({ fileTree }),
        messageId: lastfiletreeid
      });
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const toggleDirectory = (path) => {
    setExpandedDirs((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const handleCreateItem = () => {
    if (!newItemName) {
      alert('Please enter a name for the new item.');
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

      if (createPath === 'Root') {
        if (target[newItemName]) {
          alert('An item with this name already exists at the root level.');
          return prevFileTree;
        }
        if (newItemType === 'folder') {
          target[newItemName] = { directory: {} };
        } else {
          target[newItemName] = { file: { contents: '' } };
        }
        return newFileTree;
      }

      const pathParts = createPath.split('/');
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
        alert('An item with this name already exists at this path.');
        return prevFileTree;
      }

      if (newItemType === 'folder') {
        target[newItemName] = { directory: {} };
      } else {
        target[newItemName] = { file: { contents: '' } };
      }

      return newFileTree;
    });

    handleCreateModalClose();
  };

  const handleDeleteItem = (path, isDirectory) => {
    setFileTree((prevFileTree) => {
      const newFileTree = JSON.parse(JSON.stringify(prevFileTree));
      let target = newFileTree;
      const pathParts = path.split('/');
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
        if (!isDirectory && selectedFileName === path) {
          setSelectedFileContent('');
          setSelectedFileName('');
          setSelectedFiles((prev) => {
            const newSet = new Set(prev);
            newSet.delete(path);
            return newSet;
          });
        }
        if (isDirectory && selectedFileName.startsWith(path)) {
          setSelectedFileContent('');
          setSelectedFileName('');
          setSelectedFiles((prev) => {
            const newSet = new Set(prev);
            newSet.forEach((filePath) => {
              if (filePath.startsWith(path)) {
                newSet.delete(filePath);
              }
            });
            return newSet;
          });
        }
      } else {
        console.error(`Item at ${path} does not exist.`);
        return prevFileTree;
      }

      return newFileTree;
    });

    handleSave();
  };

  const RenderFileTree = ({ tree, parentPath = '' }) => {
    return (
      <>
        {/* Root-level actions */}
        {parentPath === '' && (
          <Box sx={{ display: 'flex', alignItems: 'center', padding: '4px 8px' }}>
            <Typography
              sx={{
                flexGrow: 1,
                color: '#d4d4d4',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Project Root
            </Typography>
            <IconButton
              onClick={() => handleCreateModalOpen('Root', 'file')}
              sx={{ color: '#4fc1ff', padding: '2px' }}
              title="New File"
            >
              <NoteAddIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => handleCreateModalOpen('Root', 'folder')}
              sx={{ color: '#4fc1ff', padding: '2px' }}
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
              <Box key={currentPath} sx={{ marginLeft: parentPath ? '16px' : '0' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px 8px',
                    backgroundColor: isExpanded ? '#2a2d2e' : 'transparent',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#2a2d2e',
                    },
                  }}
                >
                  <IconButton
                    onClick={() => toggleDirectory(currentPath)}
                    size="small"
                    sx={{ color: '#d4d4d4', padding: '2px' }}
                  >
                    {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                  </IconButton>
                  <FolderIcon sx={{ color: '#90a4ae', marginRight: '8px', fontSize: '18px' }} />
                  <Typography
                    onClick={() => toggleDirectory(currentPath)}
                    sx={{
                      flexGrow: 1,
                      color: '#d4d4d4',
                      fontSize: '14px',
                      cursor: 'pointer',
                      '&:hover': {
                        color: '#ffffff',
                      },
                    }}
                  >
                    {key}
                  </Typography>
                  <IconButton
                    onClick={() => handleCreateModalOpen(currentPath, 'file')}
                    sx={{ color: '#4fc1ff', padding: '2px' }}
                    title="New File"
                  >
                    <NoteAddIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleCreateModalOpen(currentPath, 'folder')}
                    sx={{ color: '#4fc1ff', padding: '2px' }}
                    title="New Folder"
                  >
                    <CreateNewFolderIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteItem(currentPath, true)}
                    sx={{ color: '#f44336', padding: '2px' }}
                    title="Delete Folder"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
                {isExpanded && (
                  <RenderFileTree tree={item.directory} parentPath={currentPath} />
                )}
              </Box>
            );
          }

          return (
            <Box key={currentPath} sx={{ marginLeft: parentPath ? '16px' : '0' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#2a2d2e',
                  },
                }}
              >
                <InsertDriveFileIcon sx={{ color: '#4fc1ff', marginRight: '8px', fontSize: '18px' }} />
                <Typography
                  onClick={() => handleSelectFile(item, currentPath)}
                  sx={{
                    flexGrow: 1,
                    color: '#d4d4d4',
                    fontSize: '14px',
                    cursor: 'pointer',
                    '&:hover': {
                      color: '#ffffff',
                    },
                  }}
                >
                  {key}
                </Typography>
                <IconButton
                  onClick={() => handleDeleteItem(currentPath, false)}
                  sx={{ color: '#f44336', padding: '2px' }}
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

  const getLanguage = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'json':
        return 'json';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'py':
        return 'python';
      default:
        return 'text';
    }
  };

  const handleFileContentChange = (newContent) => {
    setSelectedFileContent(newContent);
    setFileTree((prevFileTree) => {
      const newFileTree = JSON.parse(JSON.stringify(prevFileTree));
      let target = newFileTree;
      const pathParts = selectedFileName.split('/');
      for (let i = 0; i < pathParts.length - 1; i++) {
        target = target[pathParts[i]].directory;
      }
      target[pathParts[pathParts.length - 1]].file.contents = newContent;
      return newFileTree;
    });
  };

  return (  
    <Container
      maxWidth={false}
      className="my-container flex flex-row h-screen w-screen bg-[#1e1e1e] p-0"
      sx={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: '8px',
        gap: '8px',
      }}
    >  
      <Box  
        className="w-[20vw] rounded-lg"
        sx={{  
          '&::-webkit-scrollbar': {  
            width: '6px',   
            height: '6px',  
          },  
          '&::-webkit-scrollbar-thumb': {  
            background: 'rgba(255, 255, 255, 0.2)',  
            borderRadius: '10px',  
          },  
          '&::-webkit-scrollbar-track': {  
            background: 'transparent',   
          },  
        }}  
      >   
        <StyledCard className="h-full flex flex-col">  
          <Typography
            className='flex flex-row justify-between items-center px-4 py-2'
            variant="h6"
            sx={{ color: '#d4d4d4', fontSize: '16px', fontWeight: 500 }}
          >
            Chats  
            <Button
              onClick={handleOpen}
              sx={{
                color: '#4fc1ff',
                textTransform: 'none',
                fontSize: '14px',
                '&:hover': {
                  backgroundColor: '#2a2d2e',
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
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 400,
                  backgroundColor: '#252526',
                  border: '1px solid #333',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                  p: 3,
                  borderRadius: 2,
                  color: '#d4d4d4',
                }}
              >
                <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom sx={{ fontSize: '18px' }}>
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
                    backgroundColor: '#1e1e1e',
                    borderRadius: '4px',
                    input: { color: '#d4d4d4' },
                    label: { color: '#888' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#444' },
                      '&:hover fieldset': { borderColor: '#666' },
                      '&.Mui-focused fieldset': { borderColor: '#4fc1ff' },
                    },
                  }}
                />
                <Typography variant="h6" component="h2" gutterBottom sx={{ fontSize: '16px' }}>
                  Users in this Project
                </Typography>
                {addedUsers.length > 0 ? (
                  <List>
                    {addedUsers.map((user) => (
                      <ListItem
                        key={user._id}
                        sx={{
                          backgroundColor: '#2a2d2e',
                          marginBottom: '8px',
                          borderRadius: '4px',
                          position: 'relative',
                          transition: 'background-color 0.2s ease',
                          '&:hover': {
                            backgroundColor: '#323232',
                          },
                        }}
                      >
                        <ListItemText primary={user.name} sx={{ color: '#d4d4d4' }} />
                        <IconButton
                          onClick={() => handleRemoveUser(user)}
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            right: '10px',
                            transform: 'translateY(-50%)',
                            color: '#f44336',
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body1" sx={{ color: '#888' }}>
                    No users in this project.
                  </Typography>
                )}
                <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 3, fontSize: '16px' }}>
                  Add Users to Project
                </Typography>
                {filteredSearchUsers.length > 0 ? (
                  <List>
                    {filteredSearchUsers.map((user) => (
                      <ListItem
                        key={user._id}
                        sx={{
                          backgroundColor: '#2a2d2e',
                          marginBottom: '8px',
                          borderRadius: '4px',
                          position: 'relative',
                          transition: 'background-color 0.2s ease',
                          '&:hover': {
                            backgroundColor: '#323232',
                          },
                        }}
                      >
                        <ListItemText primary={user.name} sx={{ color: '#d4d4d4' }} />
                        <IconButton
                          onClick={() => handleAddUser(user)}
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            right: '10px',
                            transform: 'translateY(-50%)',
                            color: '#4caf50',
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body1" sx={{ color: '#888' }}>
                    No users available to add.
                  </Typography>
                )}
                <Button
                  onClick={handleClose}
                  variant="contained"
                  sx={{
                    mt: 2,
                    backgroundColor: '#3c3c3c',
                    color: '#d4d4d4',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#444',
                    },
                  }}
                >
                  Close
                </Button>
              </Box>
            </Modal>
          </Typography>  
          <Divider sx={{ margin: '0 16px', bgcolor: 'rgba(255, 255, 255, 0.1)' }} />  
          <MessageContainer ref={messageContainerRef}>
            {chats?.map((chat) => (
              <MessageBubble key={chat?._id} isuser={(chat?.sender?._id === session?.user._id).toString()}>   
                <Typography sx={{ fontSize: '14px', color: '#d4d4d4' }}>{chat?.content}</Typography>
              </MessageBubble>  
            ))}  
          </MessageContainer>  
          <Box sx={{ padding: '12px', backgroundColor: '#252526' }}>  
            <TextField  
              fullWidth  
              variant="outlined"  
              placeholder="Type a message..."  
              value={newMessage}  
              onChange={(e) => setNewMessage(e.target.value)}  
              onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage(e);}}
              sx={{
                backgroundColor: '#1e1e1e',
                borderRadius: '4px',
                input: { color: '#d4d4d4' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#444' },
                  '&:hover fieldset': { borderColor: '#666' },
                  '&.Mui-focused fieldset': { borderColor: '#4fc1ff' },
                },
              }}
            />  
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={include}
                    onChange={(e) => setInclude(e.target.checked)}
                    sx={{
                      color: '#888',
                      '&.Mui-checked': {
                        color: '#4fc1ff',
                      },
                    }}
                  />
                }
                label="Files"
                sx={{ color: '#d4d4d4', margin: 0 }}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                sx={{
                  backgroundColor: '#0078d4',
                  color: '#ffffff',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#005ea2',
                  },
                }}
              >  
                Send  
              </Button>  
            </Box>
          </Box>  
        </StyledCard>  
      </Box>  

      <Box className="w-[40vw] rounded-lg flex flex-col">  
        <StyledCard className="h-full flex flex-col">  
          <Typography
            className='flex flex-row justify-between items-center px-4 py-2'
            variant="h6"
            sx={{ color: '#d4d4d4', fontSize: '16px', fontWeight: 500 }}
          >
            File Tree  
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                onClick={async () => {
                  await webContainer.mount(fileTree);
                  const installProcess = await webContainer.spawn("npm", ["install"]);
                  installProcess.output.pipeTo(new WritableStream({
                    write(chunk) {
                      console.log(chunk);
                    }
                  }));
                  if (runProcess) {
                    runProcess.kill();
                  }
                  let tempRunProcess = await webContainer.spawn("npm", ["start"]);
                  tempRunProcess.output.pipeTo(new WritableStream({
                    write(chunk) {
                      console.log(chunk);
                    }
                  }));
                  setRunProcess(tempRunProcess);
                  webContainer.on('server-ready', (port, url) => {
                    console.log(port, url);
                    setUrl(url);
                  });
                  handleClickbuton();
                }}
                sx={{
                  color: '#4fc1ff',
                  textTransform: 'none',
                  fontSize: '14px',
                  '&:hover': {
                    backgroundColor: '#2a2d2e',
                  },
                }}
              >
                {clickCount === 0 ? 'Run' : 'Install'}
              </Button>
            </Box>
            <Modal
              open={createModalOpen}
              onClose={handleCreateModalClose}
              aria-labelledby="create-modal-title"
              aria-describedby="create-modal-description"
              sx={{
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 400,
                  backgroundColor: '#252526',
                  border: '1px solid #333',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                  p: 3,
                  borderRadius: '4px',
                  color: '#d4d4d4',
                }}
              >
                <Typography id="create-modal-title" variant="h6" component="h2" gutterBottom sx={{ fontSize: '18px' }}>
                  Create New {newItemType === 'file' ? 'File' : 'Folder'}
                </Typography>
                <TextField
                  label="Name"
                  variant="outlined"
                  fullWidth
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  sx={{
                    mb: 2,
                    backgroundColor: '#1e1e1e',
                    borderRadius: '4px',
                    input: { color: '#d4d4d4' },
                    label: { color: '#888' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#444' },
                      '&:hover fieldset': { borderColor: '#666' },
                      '&.Mui-focused fieldset': { borderColor: '#4fc1ff' },
                    },
                  }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    onClick={handleCreateItem}
                    variant="contained"
                    sx={{
                      backgroundColor: '#4caf50',
                      color: '#ffffff',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: '#388e3c',
                      },
                    }}
                  >
                    Create
                  </Button>
                  <Button
                    onClick={handleCreateModalClose}
                    variant="contained"
                    sx={{
                      backgroundColor: '#3c3c3c',
                      color: '#d4d4d4',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: '#444',
                      },
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Modal>
          </Typography>  
          <Divider sx={{ margin: '0 16px', bgcolor: 'rgba(255, 255, 255, 0.1)' }} />  
          <Box  
            sx={{  
              display: 'flex',  
              flexDirection: 'column',
              overflowX: 'auto',  
              overflowY: 'auto',
              maxHeight: '200px',
              margin: '8px 0',
              backgroundColor: '#252526',
              padding: '8px',
              '&::-webkit-scrollbar': {  
                width: '6px',  
                height: '6px',  
              },  
              '&::-webkit-scrollbar-thumb': {  
                background: 'rgba(255, 255, 255, 0.2)',  
                borderRadius: '10px',  
              },  
              '&::-webkit-scrollbar-track': {  
                background: 'transparent',  
              },  
            }}  
          >  
            <RenderFileTree tree={fileTree} />
          </Box>  
          <Box
            sx={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#1e1e1e',
              borderRadius: '4px',
              color: '#d4d4d4',
              overflow: 'auto',
              margin: '0 16px 16px 16px',
              fontFamily: '"Fira Code", monospace',
              fontSize: '14px',
              lineHeight: '1.5',
              '&::-webkit-scrollbar': {  
                width: '6px',  
                height: '6px',  
              },  
              '&::-webkit-scrollbar-thumb': {  
                background: 'rgba(255, 255, 255, 0.2)',  
                borderRadius: '10px',  
              },  
              '&::-webkit-scrollbar-track': {  
                background: 'transparent',  
              },  
            }}
          >  
            {selectedFileName ? (
              <>
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
                    useWorker: false, // Disable Web Workers to fix 404 errors
                  }}
                  style={{
                    width: '100%',
                    height: '400px',
                    borderRadius: '4px',
                    fontFamily: '"Fira Code", monospace',
                    fontSize: '14px',
                  }}
                />
                <Button
                  onClick={handleSave}
                  sx={{
                    mt: 1,
                    backgroundColor: '#0078d4',
                    color: '#ffffff',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#005ea2',
                    },
                  }}
                >
                  Save
                </Button>
              </>
            ) : (
              <Typography sx={{ color: '#888', textAlign: 'center', padding: '20px' }}>
                Select a file to view its contents
              </Typography>
            )}
          </Box>  
        </StyledCard>  
      </Box>

      <Box className="w-[40vw] rounded-lg flex flex-col">  
        <StyledCard className="h-full flex flex-col">  
          <Typography
            variant="h5"
            sx={{
              color: '#d4d4d4',
              fontSize: '16px',
              fontWeight: 500,
              px: 4,
              py: 2,
            }}
          >
            Project View
          </Typography>
          <Divider sx={{ margin: '0 16px', bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
          <TextField
            value={url} 
            onChange={(e) => setUrl(e.target.value)} 
            label="Project URL"
            variant="outlined"
            fullWidth
            sx={{
              m: 2,
              backgroundColor: '#1e1e1e',
              borderRadius: '4px',
              input: { color: '#d4d4d4' },
              label: { color: '#888' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#444' },
                '&:hover fieldset': { borderColor: '#666' },
                '&.Mui-focused fieldset': { borderColor: '#4fc1ff' },
              },
            }}
          />
          {url && webContainer && (
            <Paper
              sx={{
                flex: 1,
                m: 2,
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid #333',
              }}
            >
              <iframe
                src={url}
                title="Dynamic Content"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
              />
            </Paper>
          )}
        </StyledCard>  
      </Box>
    </Container>  
  );  
};  

export default Projects;
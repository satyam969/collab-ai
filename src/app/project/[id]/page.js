"use client";
import React, { useEffect, useState, useRef } from "react";
import { Container, Box, Snackbar, Alert } from "@mui/material";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getWebContainer } from "@/lib/webconatiner";
import { pusherClient } from "@/lib/pusherClient";

// Components
import ChatPanel from "@/components/ChatPanel";
import dynamic from 'next/dynamic';

const FileTreePanel = dynamic(
  () => import('@/components/FileTreePanel'),
  { ssr: false }
);
import ProjectViewPanel from "@/components/ProjectViewPanel";

const Projects = () => {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const messageContainerRef = useRef(null);

  // State management
  const [runProcess, setRunProcess] = useState(null);
  const [projectType, setProjectType] = useState("react");
  const [isClient, setIsClient] = useState(false);
  const [chats, setChats] = useState([]);
  const [fileTree, setFileTree] = useState({});
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [include, setInclude] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFileContent, setSelectedFileContent] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [lastfiletreeid, setLastFileTreeId] = useState(null);
  const [webContainer, setWebContainer] = useState(null);
  const [url, setUrl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [addedUsers, setAddedUsers] = useState([]);
  const [searchuser, setSearchUser] = useState([]);
  const [clickCount, setClickCount] = useState(0);
  const [expandedDirs, setExpandedDirs] = useState({});
  const [externalUpdateCount, setExternalUpdateCount] = useState(0);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const projectid = id;

  if (!projectid) {
    return <div>Loading...</div>;
  }

  // API Functions
  const addusers = async (usersearch) => {
    try {
      const response = await axios.get(`/api/user`, { params: usersearch });
      const addedUserIdsSet = new Set(addedUsers?.map((user) => user._id));
      const filteredUsers = response.data.data.filter((user) => {
        return !addedUserIdsSet.has(user._id);
      });
      setSearchUser(filteredUsers);
    } catch (error) {
      console.log(error);
    }
  };

  const allMessages = async () => {
    try {
      const response = await axios.get("/api/messages", {
        params: {
          chatId: projectid,
        },
      });
      const ALLMESSAGE = [];
      response.data.forEach((message) => {
        if (
          message.sender &&
          message.sender._id === process.env.NEXT_PUBLIC_AI
        ) {
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

  const handleSave = async (overrideContent = null, overrideFileName = null) => {
    try {
      if (!lastfiletreeid) {
        console.log("No Prev Prompt Generated fileTree ");
        return;
      }

      console.log("project id ", projectid);

      let finalTree = fileTree;
      if (overrideContent !== null && overrideFileName !== null) {
        finalTree = JSON.parse(JSON.stringify(fileTree));
        let target = finalTree;
        const pathParts = overrideFileName.split("/");
        for (let i = 0; i < pathParts.length - 1; i++) {
          target = target[pathParts[i]].directory;
        }
        target[pathParts[pathParts.length - 1]].file.contents = overrideContent;
        setFileTree(finalTree); // Also update state locally
      }

      const response = await axios.patch("/api/messages", {
        content: JSON.stringify({ fileTree: finalTree }),
        messageId: lastfiletreeid,
      });
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  // Event Handlers
  const handleSendMessage = async (e) => {
    try {
      e.preventDefault();
      const inc = include && lastfiletreeid;
      const response = await axios.post("/api/messages", {
        content: newMessage,
        ...(inc && { filetree: JSON.stringify(fileTree) }),
        projectid,
        sender: session?.user._id,
      });
      setChats([...chats, response.data.result]);
      setNewMessage("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddUser = async (user) => {
    try {
      const response = await axios.post("/api/invitations", {
        projectId: projectid,
        invitedUserId: user._id,
        invitedByUserId: session?.user._id,
      });

      setNotification({
        open: true,
        message: `Invitation sent to ${user.name}`,
        severity: "success",
      });

      setSearchUser(searchuser.filter((item) => item._id !== user._id));
    } catch (error) {
      console.error("Error sending invitation:", error);
      setNotification({
        open: true,
        message: error.response?.data?.error || "Failed to send invitation",
        severity: "error",
      });
    }
  };

  const handleRemoveUser = async (user) => {
    try {
      const response = await axios.delete("/api/chats", {
        params: {
          projectid,
          userId: user._id,
          removedBy: session?.user._id,
        },
      });

      setAddedUsers(addedUsers.filter((item) => item._id !== user._id));

      if (!searchuser.some((item) => item._id === user._id)) {
        setSearchUser([...searchuser, user]);
      }

      setNotification({
        open: true,
        message: `${user.name} has been removed from the project`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error removing user:", error);
      setNotification({
        open: true,
        message: error.response?.data?.error || "Failed to remove user",
        severity: "error",
      });
    }
  };

  const handleSelectFile = (file, filePath) => {
    if (!file) {
      return;
    }
    if (selectedFileName === filePath) {
      setSelectedFiles(new Set());
      setSelectedFileContent("");
      setSelectedFileName("");
      return;
    }
    setSelectedFiles(new Set([filePath]));
    setSelectedFileContent(file.file.contents);
    setSelectedFileName(filePath);
  };

  const handleRemoveFile = (fileId) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      newSet.delete(fileId);
      return newSet;
    });
    setSelectedFileContent("");
    setSelectedFileName("");
  };

  const toggleDirectory = (path) => {
    setExpandedDirs((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const handleFileContentChange = (newContent) => {
    setSelectedFileContent(newContent);
    setFileTree((prevFileTree) => {
      const newFileTree = JSON.parse(JSON.stringify(prevFileTree));
      let target = newFileTree;
      const pathParts = selectedFileName.split("/");
      for (let i = 0; i < pathParts.length - 1; i++) {
        target = target[pathParts[i]].directory;
      }
      target[pathParts[pathParts.length - 1]].file.contents = newContent;
      return newFileTree;
    });
  };

  const handleProjectTypeChange = (e) => {
    const newType = e.target.value;
    setProjectType(newType);
    if (isClient) {
      localStorage.setItem(`projectType_${id}`, newType);
    }
  };

  const handleRunProject = async () => {
    if (!webContainer) {
      console.error("WebContainer is not ready.");
      return;
    }

    setClickCount(1);

    await webContainer.mount(fileTree);

    const installProcess = await webContainer.spawn("npm", ["install"]);
    installProcess.output.pipeTo(
      new WritableStream({
        write(chunk) {
          console.log(chunk);
        },
      })
    );

    const exitCode = await installProcess.exit;
    if (exitCode !== 0) {
      console.error("❌ Install failed.");
      setClickCount(0); // Reset button state on failure
      return;
    }

    setClickCount(2);

    if (runProcess) {
      runProcess.kill();
    }

    let tempRunProcess;
    switch (projectType) {
      case "react":
      case "next":
        tempRunProcess = await webContainer.spawn("npm", ["run", "dev"]);
        break;
      case "express":
        tempRunProcess = await webContainer.spawn("npm", ["start"]);
        break;
      default:
        tempRunProcess = await webContainer.spawn("npm", ["run", "dev"]);
    }

    tempRunProcess.output.pipeTo(
      new WritableStream({
        write(chunk) {
          console.log(chunk);
        },
      })
    );

    setRunProcess(tempRunProcess);

    webContainer.on("server-ready", (port, url) => {
      console.log(port, url);
      setUrl(url);
    });
  };

  // Effects
  useEffect(() => {
    pusherClient.subscribe(`${projectid}`);
    pusherClient.subscribe(`project-${projectid}`);

    addusers();

    const handleMessage = (message) => {
      if (message.sender && message.sender._id === process.env.NEXT_PUBLIC_AI) {
        try {
          allMessages();
        } catch (error) {
          console.log(error);
        }
      } else {
        setChats((prev) => [...prev, message]);
      }
    };

    const handleUpdatedFileTree = (message) => {
      setNotification({
        open: true,
        message: "FileTree Updated",
        severity: "success",
      });

      console.log("message ", message);
      console.log("FileTree Updated", message.fileTree);
      setSelectedFiles(new Set());
      setSelectedFileContent("");
      setSelectedFileName("");
      setFileTree(message.fileTree);
      setExternalUpdateCount(prev => prev + 1);
    };

    const handleProjectDeleted = (data) => {
      setNotification({
        open: true,
        message: data.message,
        severity: "info",
      });
      router.push("/");
    };

    const handleNewMember = (data) => {
      setNotification({
        open: true,
        message: data.message,
        severity: "info",
      });
      Chat();
    };

    const handleMemberRemoved = (data) => {
      setNotification({
        open: true,
        message: data.message,
        severity: "info",
      });

      if (data.removedUserId === session?.user._id) {
        router.push("/");
      } else {
        Chat();
      }
    };

    pusherClient.bind("incoming-message", handleMessage);
    pusherClient.bind("updatedfiletree", handleUpdatedFileTree);
    pusherClient.bind("project-deleted", handleProjectDeleted);
    pusherClient.bind("new-member", handleNewMember);
    pusherClient.bind("member-removed", handleMemberRemoved);

    return () => {
      pusherClient.unsubscribe(`chat:${projectid}`);
      pusherClient.unsubscribe(`project-${projectid}`);
      pusherClient.unbind("incoming-message", handleMessage);
      pusherClient.unbind("updatedfiletree", handleUpdatedFileTree);
      pusherClient.unbind("project-deleted", handleProjectDeleted);
      pusherClient.unbind("new-member", handleNewMember);
      pusherClient.unbind("member-removed", handleMemberRemoved);
    };
  }, [projectid, chats]);

  useEffect(() => {
    Chat();
    if (!webContainer) {
      getWebContainer()
        .then((container) => {
          setWebContainer(container);
          console.log("✅ WebContainer is ready.");
        })
        .catch(error => {
          console.error("❌ Failed to initialize WebContainer:", error);
        });
    }
    allMessages();
  }, []);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chats]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const storedType = localStorage.getItem(`projectType_${id}`);
      if (storedType) {
        setProjectType(storedType);
      }

      const handleStorageChange = () => {
        localStorage.setItem(`projectType_${id}`, projectType);
      };

      window.addEventListener('storage', handleStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [projectType, id, isClient]);

  return (
    <Container
      maxWidth={false}
      className="my-container flex flex-row h-screen w-screen bg-[#1e1e1e] p-0"
      sx={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: "8px",
        gap: "8px",
      }}
    >
      <Box className={`${url ? 'w-[20vw]' : 'w-[40vw]'}  rounded-lg`}>
        <ChatPanel
          chats={chats}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          include={include}
          setInclude={setInclude}
          handleSendMessage={handleSendMessage}
          addedUsers={addedUsers}
          searchuser={searchuser}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleAddUser={handleAddUser}
          handleRemoveUser={handleRemoveUser}
          session={session}
          messageContainerRef={messageContainerRef}
        />
      </Box>

      {/* --- MODIFICATION 1: DYNAMIC WIDTH --- */}
      {/* The width of this Box changes based on whether the URL exists */}
      <Box className={`${url ? 'w-[40vw]' : 'w-[60vw]'} rounded-lg flex flex-col transition-all duration-300 ease-in-out`}>
        <FileTreePanel
          fileTree={fileTree}
          setFileTree={setFileTree}
          selectedFileName={selectedFileName}
          selectedFileContent={selectedFileContent}
          expandedDirs={expandedDirs}
          projectType={projectType}
          clickCount={clickCount}
          lastfiletreeid={lastfiletreeid}
          webContainer={webContainer} // Pass webContainer to disable button
          handleSelectFile={handleSelectFile}
          toggleDirectory={toggleDirectory}
          handleFileContentChange={handleFileContentChange}
          handleSave={handleSave}
          handleProjectTypeChange={handleProjectTypeChange}
          handleRunProject={handleRunProject}
          setNotification={setNotification}
          projectId={projectid}
          externalUpdateCount={externalUpdateCount}
        />
      </Box>

      {/* --- MODIFICATION 2: CONDITIONAL RENDERING --- */}
      {/* This entire Box is only rendered when the URL exists */}
      {url && (
        <Box className="w-[40vw] rounded-lg flex flex-col">
          <ProjectViewPanel
            url={url}
            setUrl={setUrl}
            webContainer={webContainer}
          />
        </Box>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Projects;
"use client";  
import React, { useEffect, useState } from 'react';  
import { Container, Typography, Card, Divider, Box, TextField, Button, Modal, List, ListItem, ListItemText,IconButton,Paper } from '@mui/material';  
import { styled } from '@mui/system';  
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getWebContainer } from '@/lib/webconatiner';
import { pusherClient } from '@/lib/pusherClient';
import CloseIcon from '@mui/icons-material/Close';


const StyledCard = styled(Card)({  
  backgroundColor: '#222',  
  borderRadius: '16px',
  border: '1px solid transparent',  
  position: 'relative',  
  width: '100%',  
  height: '100%',  
  overflow: 'hidden',  
  boxShadow: '0 0 15px rgba(0, 0, 0, 0.5)',  
});  

const MessageContainer = styled(Box)({  
  display: 'flex',  
  flexDirection: 'column',  
  overflowY: 'auto',  
  flex: 1,  
  padding: '10px',  
});  

const MessageBubble = styled(Card)(({ isuser }) => ({  
  maxWidth: '60%',  
  margin: isuser === 'true' ? '8px 0 8px auto' : '8px auto 8px 0',  
  background: isuser === 'true' ? '#0078ff' : '#3b3b3b',  
  color: 'white',  
  borderRadius: '16px',  
  padding: '10px',  
  overflowWrap: 'break-word',  
  wordBreak: 'break-word',      
  whiteSpace: 'pre-wrap',      
  flexShrink: 0,                
  display: 'flex',             
  alignItems: 'flex-start',     
  minHeight: '40px',            
}));  



const Projects = () => {  
  const [ runProcess, setRunProcess ] = useState(null)
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [chats, setChats] = useState([]);  
  const [fileTree, setFileTree] = useState({});  
  const [selectedFiles, setSelectedFiles] = useState(new Set());  
  const [newMessage, setNewMessage] = useState('');  
  const [selectedFileContent, setSelectedFileContent] = useState('');  
  const [selectedFileName, setSelectedFileName] = useState(''); 
  const router=useRouter(); 
  const [lastfiletreeid,setLastFileTreeId] = useState(null);
  const [webContainer,setWebContainer] = useState(null);
  const[url,setUrl]=useState('');

  const [searchTerm, setSearchTerm] = useState('');

  const[addedUsers,setAddedUsers] = useState([]);

  const[searchuser,setSearchUser]=useState([]);

  const { data: session,status } = useSession();

  const { id } = useParams();

  const [clickCount, setClickCount] = useState(1);  

  const handleClickbuton = () => {  
    if(clickCount==1){
      setTimeout(() => {  
        setClickCount((prevCount) => (prevCount + 1) % 2);  
      }, 4000);      }
  }; 


  const projectid=id;



  if (!projectid) {
    return <div>Loading...</div>;
  }


const addusers=async(usersearch)=>{
  try {


    const response = await axios.get(`/api/user`, {params: usersearch});

    console.log(addedUsers);

    const addedUserIdsSet = new Set(addedUsers?.map(user => user._id)); 

    console.log(addedUserIdsSet)

   
    const filteredUsers = response.data.data.filter(user => {  
        
        return !addedUserIdsSet.has(user._id);  
    });  

    console.log(filteredUsers);
    
  
    setSearchUser(filteredUsers);
    
  } catch (error) {
    console.log(error);
  }
}

useEffect(() => {

pusherClient.subscribe(`${projectid}`)


addusers();

const handleMessage = (message) => {
  if(message.sender && message.sender._id === process.env.NEXT_PUBLIC_AI){
    
      try {
        const parsedContent = JSON.parse(message.content);
        console.log("AI Message Content:", parsedContent);
        if(parsedContent?.fileTree){
      

          setLastFileTreeId(message._id); 

          setFileTree(parsedContent.fileTree);

        }
        if(parsedContent?.text)
        {const newmess = {
          ...message, 
          content: parsedContent.text, 
        };
        setChats((prev) => [...prev,newmess]);
      
        console.log(chats);
      
      }
        
      }        

        catch(error){
          console.log(error);
        }
  }
  else{
  setChats((prev) => [...prev, message]);}



};

const handleUpdatedFileTree = (message) => {
  setFileTree(message);
};

pusherClient.bind('incoming-message',handleMessage);

pusherClient.bind('updatedfiletree',handleUpdatedFileTree);

return () => {
  pusherClient.unsubscribe(`chat:${projectid}`);
  pusherClient.unbind('incoming-message', handleMessage);
};

},[projectid])


  const allMessages =async()=>{
    try {

      const response = await axios.get('/api/messages', {
        params: {
          chatId: projectid,  
        }
      });
      

      const ALLMESSAGE=[];

      response.data.forEach((message) => {
        if (message.sender && message.sender._id === process.env.NEXT_PUBLIC_AI) {
         
          try {
            const parsedContent = JSON.parse(message.content);
          
            if(parsedContent?.fileTree){
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
  }

  const Chat=async()=>{
   try {
    
     
    const response=await axios.post(`/api/chats`,{
      projectid
    });


    setAddedUsers(response.data.result.users);
    

   } catch (error) {
     console.error(error);
   }
  }

  

  useEffect(() => {

    Chat();

    if (!webContainer) {
            getWebContainer().then(container => {
                setWebContainer(container)
                console.log("container started")
            })
        }

    allMessages();

  }, []);


  const handleSelectFile = (file) => {  
    if(!file){
      return;
    }

    setSelectedFiles((prev) => new Set(prev).add(file.file)); 

    
    
    
    setSelectedFileContent(file.file.contents);  
    
    
    console.log(fileTree);
    


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
try {    e.preventDefault();

    const response= await axios.post('/api/messages',
      {
        content: newMessage,
        projectid,
        sender:session?.user._id
      }
    );


      setChats([  
        ...chats,
        response.data.result  
      ]);  
      
      setNewMessage('');  
 
   } 
    catch(error){
      console.error(error);
    }
  };  




  const handleAddUser = async (user) => {
   
    const response = await axios.post('/api/chats',{
      projectid,
      userId:user._id
    });


  
    setSearchUser(searchuser.filter((item) => item.id !== user.id));

   
    setAddedUsers([...addedUsers, user]);
  };

  const handleRemoveUser = async (user) => {
   
    const response = await axios.delete('/api/chats',{
     params:{ projectid,
      userId:user._id}
    });

    // console.log(response);

   
    setAddedUsers(addedUsers.filter((item) => item.id !== user.id));

   
    setSearchUser([...searchuser, user]);
    
  };

  const filteredSearchUsers = searchuser.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleSave=async()=>{
    try {

      // pusher se update hone ke bad sirf filetree aaega wpis jiski wjas se koi change nhi hoga waise

      // console.log(fileTree);

      // console.log(fileTree[selectedFileName]);

      // fileTree[selectedFileName].file.contents=selectedFileContent;


      if(!lastfiletreeid){
        console.log('No Prev Prompt Generated fileTree ');
        return;
      }

      // console.log(fileTree);

      
      const response=await axios.patch('/api/messages',{
        content: JSON.stringify({fileTree}),
        messageId:lastfiletreeid
      })
      console.log(response);

    } catch (error) {
      console.log(error);
    }
  }

  return (  
    <Container
    
    className="my-container flex flex-row h-screen w-screen bg-gray-900 p-0">  
    
    <Box  
  className="w-[30vw] m-1 p-2 rounded-lg"  
  sx={{  
    '&::-webkit-scrollbar': {  
      width: '8px',   
      height: '8px',  
    },  
    '&::-webkit-scrollbar-thumb': {  
      background: 'rgba(255, 255, 255, 0.4)',  
      borderRadius: '10px',  
    },  
    '&::-webkit-scrollbar-track': {  
      background: 'transparent',   
    },  
  }}  
>   
        <StyledCard className="h-full flex flex-col">  
          <Typography className='flex flex-row justify-between' variant="h6" color="white">Chats  <Button onClick={handleOpen}>Add Users</Button>
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
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            boxShadow: 24,
            p: 3,
            borderRadius: 2,
            color: 'white',
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom>
            Available Users
          </Typography>

          <TextField
            label="Search Users"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
            sx={{ mb: 2, backgroundColor: 'white', borderRadius: '4px' }}
          />

          <Typography variant="h6" component="h2" gutterBottom>
            Users in this Project
          </Typography>

          {addedUsers.length > 0 ? (
            <List>
              {addedUsers.map((user) => (
                <ListItem
                  key={user._id}
                  sx={{
                    backgroundColor: '#333',
                    marginBottom: '8px',
                    borderRadius: '8px',
                    position: 'relative',
                  }}
                >
                  <ListItemText primary={user.name} sx={{ color: 'white' }} />
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
                    <CloseIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" sx={{ color: '#bbb' }}>
              No users in this project.
            </Typography>
          )}

          <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 3 }}>
            Add Users to Project
          </Typography>

          {filteredSearchUsers.length > 0 ? (
            <List>
              {filteredSearchUsers.map((user) => (
                <ListItem
                  key={user._id}
                  sx={{
                    backgroundColor: '#333',
                    marginBottom: '8px',
                    borderRadius: '8px',
                    position: 'relative',
                  }}
                >
                  <ListItemText primary={user.name} sx={{ color: 'white' }} />
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
                    <CloseIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" sx={{ color: '#bbb' }}>
              No users available to add.
            </Typography>
          )}

          <Button onClick={handleClose} variant="contained" sx={{ mt: 2, backgroundColor: '#555', color: 'white' }}>
            Close
          </Button>
        </Box>
      </Modal></Typography>  
          <Divider sx={{ margin: '16px 0', bgcolor: 'rgba(255, 255, 255, 0.3)' }} />  
          <MessageContainer>  
            {chats.map((chat) => (
             <MessageBubble key={chat._id} isuser={(chat.sender._id === session?.user._id).toString()}>   
                <Typography sx={{ fontSize: '0.875rem' }}>{chat.content}</Typography>
              </MessageBubble>  
            ))}  
          </MessageContainer>  
          <Box sx={{ padding: 1 }}>  
            <TextField  
              className='bg-white border rounded'  
              fullWidth  
              variant="outlined"  
              placeholder="Type a message..."  
              value={newMessage}  
              onChange={(e) => setNewMessage(e.target.value)}  
              onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage();}}  
            />  
            <Button variant="contained" color="primary" onClick={handleSendMessage} sx={{ marginTop: '8px' }}>  
              Send  
            </Button>  
          </Box>  
        </StyledCard>  
      </Box>  

<Box className="w-[40vw] m-2 p-2 rounded-lg flex flex-col">  
  <StyledCard className="h-full flex flex-col">  
    
    <Typography className=' p-1 flex flex-row justify-between' variant="h6" color="white">File Tree  <Button onClick={
      async()=>{
      await webContainer.mount(fileTree)

      const installProcess = await webContainer.spawn("npm", [ "install" ])

      installProcess.output.pipeTo(new WritableStream({
        write(chunk) {
            console.log(chunk)
        }
    }))


    if (runProcess) {
      runProcess.kill()
  }

  let tempRunProcess = await webContainer.spawn("npm", [ "start" ]);

  tempRunProcess.output.pipeTo(new WritableStream({
      write(chunk) {
          console.log(chunk)
      }
  }))


  setRunProcess(tempRunProcess)

  webContainer.on('server-ready', (port, url) => {
      console.log(port, url)
      setUrl(url)
  })


  handleClickbuton()
  // console.log(clickCount);
      }
    }>{clickCount===0?' run ':' install '}</Button> </Typography>  
    
    <Divider sx={{ margin: '16px 0', bgcolor: 'rgba(255, 255, 255, 0.3)' }} />  
    <Box  
      sx={{  
        display: 'flex',  
        flexDirection: 'row',  
        overflowX: 'auto',  
        marginBottom: 2,  
        '&::-webkit-scrollbar': {  
          height: '8px', 
        },  
        '&::-webkit-scrollbar-thumb': {  
          background: 'rgba(255, 255, 255, 0.4)',  
          borderRadius: '10px',  
        },  
        '&::-webkit-scrollbar-track': {  
          background: 'transparent', 
        },  
      }}  
    >  
      { Object.keys(fileTree).map((file,index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                    
                                        handleSelectFile(fileTree[file]);
                                        setSelectedFileName(file);
                                     
                                    }}
                                    className="tree-element cursor-pointer p-2 px-4 flex items-center gap-2 bg-slate-300 w-full">
                                    <p
                                        className='font-semibold text-lg'
                                    >{file}</p>
                                </button>))}  
    </Box>  
    <Box sx={{  
      padding: '16px',  
      backgroundColor: 'rgba(40, 40, 40, 0.9)',  
      borderRadius: '8px',  
      color: 'white',  
      whiteSpace: 'pre-wrap',  
      overflow: 'auto',  
      marginTop: '16px',  
      fontFamily: 'monospace',  
      fontSize: '14px',  
      lineHeight: '1.5',  
      '&::-webkit-scrollbar': {  
        height: '8px', 
      },  
      '&::-webkit-scrollbar-thumb': {  
        background: 'rgba(255, 255, 255, 0.4)',  
        borderRadius: '10px',  
      },  
      '&::-webkit-scrollbar-track': {  
        background: 'transparent', 
      },  
    }}>  
     <TextField
  multiline
  fullWidth
  rows={15}
  variant="outlined"
  value={selectedFileContent}
  onChange={(e) => {
    
    setSelectedFileContent(e.target.value)
    fileTree[selectedFileName].file.contents=selectedFileContent;
    // console.log(selectedFileContent)
    // console.log(fileTree[selectedFileName])
  }} 
  InputProps={{
    style: { color: 'white', backgroundColor: '#2c2c2c' }, 
  }}
/>
<Button onClick={handleSave}>Save</Button>
    </Box>  
  </StyledCard>  
</Box>

<Box className="w-[60vw] m-4 p-4 rounded-lg shadow-lg bg-gray-800">
  <StyledCard className="h-full">
    <Typography variant="h5" color="white" className="mb-2">
      Project View
    </Typography>
    <Divider sx={{ margin: '16px 0', bgcolor: 'rgba(255, 255, 255, 0.5)' }} />

    <TextField
      value={url} 
      onChange={(e) => setUrl(e.target.value)} 
      label="Project URL"
      variant="outlined"
      fullWidth
      className="mb-4"
      inputProps={{ style: { color: 'white' } }} 
    />
 {url && webContainer && (<Paper
          sx={{
            width: '100%',
            height: '80vh',
            borderRadius: 2,
            overflow: 'hidden',
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
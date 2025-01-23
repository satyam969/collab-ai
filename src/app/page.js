"use client";
// pages/index.js  
import React, { useEffect, useState } from 'react';  
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
} from '@mui/material';  
import Navbar from '../components/Navbar';  
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';


// Shared Styled Card Component  
const StyledCard = styled(MuiCard)(({ theme }) => ({  
  backgroundColor: '#222',  
  borderRadius: '16px',  
  border: '1px solid transparent',  
  display: 'flex',  
  alignItems: 'center',  
  justifyContent: 'center',  
  height: '150px',  
  position: 'relative',  
  overflow: 'hidden',  
  boxShadow: '0 0 15px rgba(0, 0, 0, 0.5)',  
  '&:before': {  
    // content: '""',  
    position: 'absolute',  
    top: 0,  
    left: 0,  
    right: 0,  
    bottom: 0,  
    zIndex: 1,  
    background: 'linear-gradient(145deg, rgba(255, 0, 0, 0.3), rgba(0, 0, 255, 0.3))',  
    filter: 'blur(30px)',  
  },  
  '&:hover': {  
    borderColor: 'rgba(255, 0, 255, 0.8)',  
  },  
}));  

// Styled Add Button to Match Card Style  
const StyledAddButton = styled(Button)(({ theme }) => ({  
  backgroundColor: '#222',  
  borderRadius: '16px',  
  border: '1px solid transparent',  
  color: 'white',  
  display: 'flex',  
  alignItems: 'center',  
  justifyContent: 'center',  
  height: '150px',  
  width: '100%',  
  fontSize: '2rem',  
  boxShadow: '0 0 15px rgba(0, 0, 0, 0.5)',  
  position: 'relative',  
  overflow: 'hidden',  
  '&:before': {  
    content: '""',  
    position: 'absolute',  
    top: 0,  
    left: 0,  
    right: 0,  
    bottom: 0,  
    zIndex: 1,  
    background: 'linear-gradient(145deg, rgba(255, 0, 0, 0.3), rgba(0, 0, 255, 0.3))',  
    filter: 'blur(30px)',  
  },  
  '&:hover': {  
    backgroundColor: 'rgba(255, 0, 255, 0.1)',  
  },  
}));  



const Home = () => {  
  const [projects, setProjects] = useState([]);  
  const [showDialog, setShowDialog] = useState(false);  
  const [newProjectName, setNewProjectName] = useState('');  
  const [visibleCount, setVisibleCount] = useState(9);  
  const [error, setError] = useState('');
  const router=useRouter();  

  const {data: session,status} = useSession();


//   useEffect(() => {  
//     if (status === 'unauthenticated') {  
//         router.push('/login'); 
//     }  
// }, [status, router]); 


  const fetchProjects=async()=>{
    try {

      const response = await axios.get('/api/chats', {
        params: {
          userId: session?.user._id  
        }
      });

      setProjects(response.data.projects);
      // console.log(response.data.projects)
      
    } catch (error) {
      console.error(error);
    }
  }
  

  useEffect(() => {  
    if (status !== 'unauthenticated' && session?.user) {
      fetchProjects();  
    }
  }, [session, status]);   

  const handleAddProject = async() => {  
try{    if (!newProjectName) {  
      setError('Project name is required.');  
      return;  
    }  

    // Logic for Adding a New Project  

    const response=await axios.post('/api/chats',{
      projectname: newProjectName,
      userId:session?.user?._id
    });

    console.log(response); 
    
    console.log('Adding project:', newProjectName);  
    setNewProjectName('');  
    setShowDialog(false);  
    setError('');  }
    catch(error){ console.log(error); }
  };  

  const handleLoadMore = () => {  
    setVisibleCount((prevCount) => prevCount + 3);  
  };  

  return (  
    <>  
      <Navbar />  
      <Box  
        sx={{  
          padding: 2,  
          backgroundColor: '#000',  
          minHeight: 'calc(100vh - 64px)', // Adjust based on navbar height  
        }}  
      >  
        <Grid container spacing={2}>  
          <Grid item xs={12} sm={6} md={3}>  
            <StyledAddButton variant="contained" onClick={() => setShowDialog(true)}>  
              +  
            </StyledAddButton>  
          </Grid>  
          {projects.map((project) => (  
            <Grid item xs={12} sm={6} md={3} key={project.projectid}>  
              <StyledCard onClick={() => router.push(`/project/${project.projectid}`)}>  
                <Typography variant="h6" color="white">  
                  {project.projectname}  
                </Typography>  
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

        {visibleCount < projects.length && (  
          <Button variant="outlined" onClick={handleLoadMore} sx={{ marginTop: 2 }}>  
            Load More  
          </Button>  
        )}  
      </Box>  
    </>  
  );  
};  

export default Home;
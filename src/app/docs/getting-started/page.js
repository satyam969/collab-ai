"use client";

import { Box, Container, Typography, Paper, Grid } from '@mui/material';
import Image from 'next/image';

export default function GettingStarted() {
  const projectTypes = [
    {
      title: "React.js Project",
      description: "Create a modern React application with Vite",
      image: "/createabasicreact.png",
      color: "#61dafb",
      instructions: [
        "Click the '+' button to create a new project",
        "Select 'React.js' from the project type dropdown",
        "Use the command '@ai create a basic react.js project' in the chat",
        "Wait for the AI to generate the project structure",
        "Click 'Install' to install dependencies",
        "Click 'Run' to start the development server"
      ]
    },
    {
      title: "Next.js Project",
      description: "Set up a Next.js project with full features",
      image: "/createabasicnextproject2.png",
      color: "#ffffff",
      instructions: [
        "Click the '+' button to create a new project",
        "Select 'Next.js' from the project type dropdown",
        "Use the command '@ai create a basic next.js project' in the chat",
        "Wait for the AI to generate the project structure",
        "Click 'Install' to install dependencies",
        "Click 'Run' to start the development server"
      ]
    },
    {
      title: "Express.js Project",
      description: "Create a backend API with Express.js",
      image: "/createabasicexpressproject.png",
      color: "#259dff",
      instructions: [
        "Click the '+' button to create a new project",
        "Select 'Express.js' from the project type dropdown",
        "Use the command '@ai create a basic express.js project' in the chat",
        "Wait for the AI to generate the project structure",
        "Click 'Install' to install dependencies",
        "Click 'Run' to start the server"
      ]
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center">
        Getting Started with Collab-AI
      </Typography>
      
      <Typography variant="h5" color="text.secondary" align="center" paragraph>
        Learn how to create your first project and use basic commands
      </Typography>

      <Box sx={{ mt: 6 }}>
        <Grid container spacing={4}>
          {projectTypes.map((type, index) => (
            <Grid item xs={12} key={index}>
              <Paper 
                sx={{ 
                  p: 4,
                  backgroundColor: '#1e1e1e',
                  color: '#fff',
                  height: '100%',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  },
                  position: 'relative',
                  overflow: 'hidden',
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: type.color
                  }
                }}
              >
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12}>
                    <Box sx={{ position: 'relative', width: '100%', height: '500px', mb: 2 }}>
                      <Image
                        src={type.image}
                        alt={type.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography 
                      variant="h4" 
                      gutterBottom
                      sx={{ 
                        color: type.color,
                        fontWeight: 600
                      }}
                    >
                      {type.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '1.1rem',
                        mb: 3
                      }}
                    >
                      {type.description}
                    </Typography>
                    <Typography variant="h6" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      Instructions:
                    </Typography>
                    <Box component="ol" sx={{ pl: 2 }}>
                      {type.instructions.map((instruction, i) => (
                        <li key={i}>
                          <Typography 
                            sx={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '1rem',
                              mb: 1
                            }}
                          >
                            {instruction}
                          </Typography>
                        </li>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Paper 
          sx={{ 
            p: 4, 
            mt: 6,
            backgroundColor: '#1e1e1e',
            color: '#fff',
            position: 'relative',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: 'linear-gradient(90deg, #61dafb, #000000, #259dff)'
            }
          }}
        >
          <Typography variant="h4" gutterBottom>
            Basic Commands
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                AI Commands
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <li>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    <code>@ai create a basic [type] project</code> - Generate a new project structure
                  </Typography>
                </li>
                <li>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    <code>@ai how can I [your question]</code> - Ask AI for help
                  </Typography>
                </li>
                <li>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    <code>@ai add [feature] to my project</code> - Request new features
                  </Typography>
                </li>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Project Management
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <li>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    Click the "Add Users" button to invite team members
                  </Typography>
                </li>
                <li>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    Use the file tree to manage project files
                  </Typography>
                </li>
                <li>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    Click "Run" to start the development server
                  </Typography>
                </li>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
}
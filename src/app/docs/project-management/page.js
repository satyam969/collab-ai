"use client";

import { Box, Container, Typography, Paper, Grid } from '@mui/material';
import Image from 'next/image';

export default function ProjectManagement() {
  const sections = [
    {
      title: "File Management",
      description: "Manage your project files efficiently",
      image: "/managefiles.png",
      color: "#4caf50",
      features: [
        "Create new files and folders",
        "Delete existing files",
        "Edit file contents in real-time",
        "Organize files in a tree structure",
        "Preview changes instantly"
      ]
    },
    {
      title: "Team Collaboration",
      description: "Work together with your team members",
      image: "/CollaborateWithOthers.png",
      color: "#ff9800",
      features: [
        "Invite team members to your project",
        "Real-time collaboration on files",
        "See who's working on what",
        "Chat with team members",
        "Share project updates"
      ]
    },
    {
      title: "Project Settings",
      description: "Configure your project settings",
      image: "/Multipleprojecttype.png",
      color: "#2196f3",
      features: [
        "Switch between project types",
        "Configure build settings",
        "Manage dependencies",
        "Set up environment variables",
        "Control project access"
      ]
    },
    {
      title: "Real-Time Updates",
      description: "Stay informed about project changes",
      image: "/RealTimeUpdates.png",
      color: "#e91e63",
      features: [
        "Receive notifications for file changes",
        "Get alerts for team member actions",
        "Track project modifications",
        "Monitor build status",
        "View deployment updates"
      ]
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center">
        Project Management
      </Typography>
      
      <Typography variant="h5" color="text.secondary" align="center" paragraph>
        Learn how to manage your projects effectively
      </Typography>

      <Box sx={{ mt: 6 }}>
        <Grid container spacing={4}>
          {sections.map((section, index) => (
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
                    background: section.color
                  }
                }}
              >
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12}>
                    <Box sx={{ position: 'relative', width: '100%', height: '500px', mb: 2 }}>
                      <Image
                        src={section.image}
                        alt={section.title}
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
                        color: section.color,
                        fontWeight: 600
                      }}
                    >
                      {section.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '1.1rem',
                        mb: 3
                      }}
                    >
                      {section.description}
                    </Typography>
                    <Typography variant="h6" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      Features:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2 }}>
                      {section.features.map((feature, i) => (
                        <li key={i}>
                          <Typography 
                            sx={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '1rem',
                              mb: 1
                            }}
                          >
                            {feature}
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
              background: 'linear-gradient(90deg, #4caf50, #ff9800, #2196f3, #e91e63)'
            }
          }}
        >
          <Typography variant="h4" gutterBottom>
            Best Practices
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                File Organization
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <li>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    Keep related files in dedicated folders
                  </Typography>
                </li>
                <li>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    Use consistent naming conventions
                  </Typography>
                </li>
                <li>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    Regularly clean up unused files
                  </Typography>
                </li>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Team Collaboration
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <li>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    Communicate changes with team members
                  </Typography>
                </li>
                <li>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    Review changes before deployment
                  </Typography>
                </li>
                <li>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    Keep project documentation updated
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
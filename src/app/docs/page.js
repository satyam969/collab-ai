"use client";

import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';

export default function Documentation() {
  const sections = [
    {
      title: "Getting Started",
      description: "Learn how to create your first project and basic commands",
      image: "/codeeditor.png",
      link: "/docs/getting-started",
      color: "#2196f3"
    },
    {
      title: "Project Management",
      description: "Manage files, collaborate with team members, and handle project settings",
      image: "/ManageProject.png",
      link: "/docs/project-management",
      color: "#4caf50"
    },
    {
      title: "AI Integration",
      description: "Leverage AI capabilities for code generation and assistance",
      image: "/aiintegration.png",
      link: "/docs/ai-integration",
      color: "#9c27b0"
    },
    {
      title: "Real-Time Collaboration",
      description: "Work together with your team in real-time",
      image: "/RealTimeCollaboration.png",
      link: "/docs/collaboration",
      color: "#ff9800"
    },
    {
      title: "For Teams",
      description: "How teams can benefit from Collab-AI",
      image: "/teamscanbenefit.png",
      link: "/docs/for-teams",
      color: "#e91e63"
    },
    {
      title: "For Individual Developers",
      description: "How individual developers can leverage Collab-AI",
      image: "/singledevelopercanbenefit.png",
      link: "/docs/for-developers",
      color: "#00bcd4"
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center">
        Documentation
      </Typography>
      
      <Typography variant="h5" color="text.secondary" align="center" paragraph>
        Learn how to use Collab-AI effectively and discover all its powerful features
      </Typography>

      <Box sx={{ mt: 6 }}>
        <Grid container spacing={4}>
          {sections.map((section, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Link href={section.link} style={{ textDecoration: 'none' }}>
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
                      <Box sx={{ position: 'relative', width: '100%', height: '200px', mb: 2 }}>
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
                          fontSize: '1.1rem'
                        }}
                      >
                        {section.description}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Link>
            </Grid>
          ))}
        </Grid>

        <Paper 
          sx={{ 
            p: 4, 
            mt: 6,
            backgroundColor: '#1e1e1e',
            color: '#fff'
          }}
        >
          <Typography variant="h4" gutterBottom align="center">
            Quick Access
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={4}>
              <Paper 
                sx={{ 
                  p: 3, 
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  border: '1px solid #2196f3',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)'
                  }
                }}
                component={Link}
                href="/docs/getting-started"
              >
                <Typography variant="h6" sx={{ color: '#2196f3' }}>
                  Get Started
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper 
                sx={{ 
                  p: 3, 
                  backgroundColor: 'rgba(156, 39, 176, 0.1)',
                  border: '1px solid #9c27b0',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)'
                  }
                }}
                component={Link}
                href="/docs/ai-integration"
              >
                <Typography variant="h6" sx={{ color: '#9c27b0' }}>
                  AI Features
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper 
                sx={{ 
                  p: 3, 
                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                  border: '1px solid #ff9800',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)'
                  }
                }}
                component={Link}
                href="/docs/collaboration"
              >
                <Typography variant="h6" sx={{ color: '#ff9800' }}>
                  Collaboration
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
} 
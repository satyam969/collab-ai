"use client";

import { Box, Container, Typography, Paper, Grid } from '@mui/material';
import Image from 'next/image';

export default function Collaboration() {
  const features = [
    {
      title: "Real-Time Code Editing",
      description: "Edit code together in real-time with team members",
      image: "/RealTimeCollaboration.png",
      color: "#ff9800",
      benefits: [
        "See changes as they happen",
        "Multiple developers can work simultaneously",
        "Built-in conflict resolution",
        "Instant feedback and review",
        "No need to manually sync or merge changes"
      ]
    },
    {
      title: "Team Communication",
      description: "Built-in chat and notification system",
      image: "/Notifications.png",
      color: "#2196f3",
      benefits: [
        "Integrated chat system",
        "Real-time notifications",
        "File change alerts",
        "Team member activity updates",
        "Project status notifications"
      ]
    },
    {
      title: "Project Sharing",
      description: "Invite and manage team members",
      image: "/InviteToProject.png",
      color: "#4caf50",
      benefits: [
        "Easy team member invitation",
        "Role-based access control",
        "Project visibility settings",
        "Secure collaboration",
        "Team member management"
      ]
    },
    {
      title: "Real-Time Updates",
      description: "Stay synchronized with your team",
      image: "/RealTimeUpdates.png",
      color: "#e91e63",
      benefits: [
        "Live file tree updates",
        "Real-time code preview",
        "Instant deployment status",
        "Collaborative debugging",
        "Synchronized project state"
      ]
    }
  ];

  const bestPractices = [
    {
      title: "Communication Guidelines",
      color: "#9c27b0",
      practices: [
        "Use clear and descriptive commit messages",
        "Document major changes in the chat",
        "Notify team members of critical updates",
        "Maintain regular communication",
        "Use appropriate channels for different types of communication"
      ]
    },
    {
      title: "Collaboration Workflow",
      color: "#00bcd4",
      practices: [
        "Define clear roles and responsibilities",
        "Establish coding standards",
        "Review changes regularly",
        "Coordinate on major changes",
        "Keep documentation up to date"
      ]
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center">
        Real-Time Collaboration
      </Typography>
      
      <Typography variant="h5" color="text.secondary" align="center" paragraph>
        Work together seamlessly with your team in real-time
      </Typography>

      <Box sx={{ mt: 6 }}>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
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
                    background: feature.color
                  }
                }}
              >
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12}>
                    <Box sx={{ position: 'relative', width: '100%', height: '500px', mb: 2 }}>
                      <Image
                        src={feature.image}
                        alt={feature.title}
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
                        color: feature.color,
                        fontWeight: 600
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '1.1rem',
                        mb: 3
                      }}
                    >
                      {feature.description}
                    </Typography>
                    <Typography variant="h6" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      Key Benefits:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2 }}>
                      {feature.benefits.map((benefit, i) => (
                        <li key={i}>
                          <Typography 
                            sx={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '1rem',
                              mb: 1
                            }}
                          >
                            {benefit}
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
              background: 'linear-gradient(90deg, #9c27b0, #00bcd4)'
            }
          }}
        >
          <Typography variant="h4" gutterBottom>
            Collaboration Best Practices
          </Typography>
          <Grid container spacing={4}>
            {bestPractices.map((section, index) => (
              <Grid item xs={12} key={index}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    color: section.color,
                    fontWeight: 600
                  }}
                >
                  {section.title}
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  {section.practices.map((practice, i) => (
                    <li key={i}>
                      <Typography 
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '1rem',
                          mb: 1
                        }}
                      >
                        {practice}
                      </Typography>
                    </li>
                  ))}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
}
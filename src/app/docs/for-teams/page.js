"use client";

import { Box, Container, Typography, Paper, Grid } from '@mui/material';
import Image from 'next/image';

export default function ForTeams() {
  const benefits = [
    {
      title: "Streamlined Collaboration",
      description: "Enhance team productivity with real-time collaboration tools",
      image: "/CollaborateWithOthers.png",
      color: "#4caf50",
      points: [
        "Real-time code editing with multiple team members",
        "Built-in chat and communication tools",
        "Instant file sharing and synchronization",
        "Collaborative debugging sessions",
        "Team-wide notifications and updates"
      ]
    },
    {
      title: "AI-Powered Development",
      description: "Leverage AI to accelerate your team's development process",
      image: "/aiintegration.png",
      color: "#2196f3",
      points: [
        "Intelligent code suggestions and completions",
        "Automated code review and optimization",
        "Smart documentation generation",
        "AI-assisted debugging and problem solving",
        "Context-aware development assistance"
      ]
    },
    {
      title: "Project Management",
      description: "Comprehensive tools for managing team projects",
      image: "/ManageProject.png",
      color: "#ff9800",
      points: [
        "Role-based access control",
        "Project progress tracking",
        "Resource allocation and management",
        "Milestone and deadline monitoring",
        "Team performance analytics"
      ]
    },
    {
      title: "Security & Compliance",
      description: "Enterprise-grade security for your team's projects",
      image: "/InviteToProject.png",
      color: "#e91e63",
      points: [
        "Secure code storage and version control",
        "Encrypted team communications",
        "Access control and authentication",
        "Audit logs and compliance tracking",
        "Data backup and recovery"
      ]
    }
  ];

  const teamFeatures = [
    {
      title: "Team Workflows",
      color: "#9c27b0",
      features: [
        "Customizable development workflows",
        "Code review and approval processes",
        "Automated testing and deployment",
        "Team-wide coding standards enforcement",
        "Integration with existing tools"
      ]
    },
    {
      title: "Team Success",
      color: "#00bcd4",
      features: [
        "Onboarding resources and documentation",
        "Team performance metrics and insights",
        "Knowledge sharing and documentation",
        "Training and skill development tools",
        "24/7 team support and resources"
      ]
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center">
        For Teams
      </Typography>
      
      <Typography variant="h5" color="text.secondary" align="center" paragraph>
        Empower your team with collaborative development tools and AI assistance
      </Typography>

      <Box sx={{ mt: 6 }}>
        <Grid container spacing={4}>
          {benefits.map((benefit, index) => (
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
                    background: benefit.color
                  }
                }}
              >
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12}>
                    <Box sx={{ position: 'relative', width: '100%', height: '500px', mb: 2 }}>
                      <Image
                        src={benefit.image}
                        alt={benefit.title}
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
                        color: benefit.color,
                        fontWeight: 600
                      }}
                    >
                      {benefit.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '1.1rem',
                        mb: 3
                      }}
                    >
                      {benefit.description}
                    </Typography>
                    <Typography variant="h6" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      Key Features:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2 }}>
                      {benefit.points.map((point, i) => (
                        <li key={i}>
                          <Typography 
                            sx={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '1rem',
                              mb: 1
                            }}
                          >
                            {point}
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
            Getting Started with Team Projects
          </Typography>
          <Grid container spacing={4}>
            {teamFeatures.map((section, index) => (
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
            ))}
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
} 
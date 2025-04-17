"use client";

import { Box, Container, Typography, Paper, Grid } from '@mui/material';
import Image from 'next/image';

export default function ForDevelopers() {
  const benefits = [
    {
      title: "AI-Powered Coding",
      description: "Supercharge your development with intelligent AI assistance",
      image: "/aiintegration.png",
      color: "#4caf50",
      points: [
        "Smart code completion and suggestions",
        "Automated code review and optimization",
        "Intelligent debugging assistance",
        "Natural language code generation",
        "Context-aware documentation help"
      ]
    },
    {
      title: "Development Environment",
      description: "A powerful, cloud-based development environment",
      image: "/next.jsproject.png",
      color: "#2196f3",
      points: [
        "Instant project setup and configuration",
        "Multiple framework support",
        "Integrated terminal and debugging tools",
        "Real-time preview and hot reload",
        "Version control integration"
      ]
    },
    {
      title: "Productivity Tools",
      description: "Tools and features to boost your productivity",
      image: "/codeeditor.png",
      color: "#ff9800",
      points: [
        "Quick project templates and scaffolding",
        "Customizable shortcuts and snippets",
        "Integrated testing tools",
        "Performance monitoring",
        "Task automation capabilities"
      ]
    },
    {
      title: "Learning & Growth",
      description: "Resources to enhance your development skills",
      image: "/singledevelopercanbenefit.png",
      color: "#e91e63",
      points: [
        "Interactive coding tutorials",
        "Best practices recommendations",
        "Code analysis and feedback",
        "Skill development tracking",
        "Community knowledge sharing"
      ]
    }
  ];

  const developerFeatures = [
    {
      title: "Developer Workflow",
      color: "#9c27b0",
      features: [
        "Customizable workspace settings",
        "Git integration and version control",
        "Integrated package management",
        "Command palette and shortcuts",
        "Multiple terminal support"
      ]
    },
    {
      title: "Developer Success",
      color: "#00bcd4",
      features: [
        "Comprehensive documentation",
        "Community support and forums",
        "Regular feature updates",
        "Performance optimization tools",
        "Cross-platform compatibility"
      ]
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center">
        For Developers
      </Typography>
      
      <Typography variant="h5" color="text.secondary" align="center" paragraph>
        Enhance your development experience with AI-powered tools and features
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
            Developer Tools & Resources
          </Typography>
          <Grid container spacing={4}>
            {developerFeatures.map((section, index) => (
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
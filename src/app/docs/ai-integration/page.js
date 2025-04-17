"use client";

import { Box, Container, Typography, Paper, Grid } from '@mui/material';
import Image from 'next/image';

export default function AIIntegration() {
  const features = [
    {
      title: "AI-Powered Code Generation",
      description: "Generate code and project structures with AI assistance",
      image: "/integrateai.png",
      color: "#9c27b0",
      commands: [
        "@ai create a basic [framework] project - Generate a new project",
        "@ai add [feature] to my project - Add new functionality",
        "@ai help me with [problem] - Get assistance with issues",
        "@ai optimize my code - Get suggestions for improvements"
      ]
    },
    {
      title: "Real-Time AI Assistance",
      description: "Get instant help and suggestions while coding",
      image: "/aiintegration.png",
      color: "#2196f3",
      commands: [
        "@ai explain this code - Get explanations for code snippets",
        "@ai suggest improvements - Get optimization suggestions",
        "@ai debug this issue - Get help with debugging",
        "@ai how do I [task] - Get guidance on specific tasks"
      ]
    }
  ];

  const useCases = [
    {
      title: "Project Setup",
      color: "#4caf50",
      steps: [
        "Create a new project using AI commands",
        "Get recommended project structure",
        "Set up configuration files",
        "Add necessary dependencies"
      ]
    },
    {
      title: "Code Development",
      color: "#ff9800",
      steps: [
        "Generate boilerplate code",
        "Get real-time coding suggestions",
        "Implement new features with AI assistance",
        "Debug issues with AI help"
      ]
    },
    {
      title: "Code Optimization",
      color: "#e91e63",
      steps: [
        "Get performance improvement suggestions",
        "Identify potential issues",
        "Receive best practice recommendations",
        "Optimize code structure"
      ]
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center">
        AI Integration
      </Typography>
      
      <Typography variant="h5" color="text.secondary" align="center" paragraph>
        Learn how to leverage AI capabilities in your development workflow
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
                      Common Commands:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2 }}>
                      {feature.commands.map((command, i) => (
                        <li key={i}>
                          <Typography 
                            sx={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '1rem',
                              mb: 1
                            }}
                          >
                            <code>{command}</code>
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
              background: 'linear-gradient(90deg, #4caf50, #ff9800, #e91e63)'
            }
          }}
        >
          <Typography variant="h4" gutterBottom>
            Common Use Cases
          </Typography>
          <Grid container spacing={4}>
            {useCases.map((useCase, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    color: useCase.color,
                    fontWeight: 600
                  }}
                >
                  {useCase.title}
                </Typography>
                <Box component="ol" sx={{ pl: 2 }}>
                  {useCase.steps.map((step, i) => (
                    <li key={i}>
                      <Typography 
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '1rem',
                          mb: 1
                        }}
                      >
                        {step}
                      </Typography>
                    </li>
                  ))}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Paper 
          sx={{ 
            p: 4, 
            mt: 4,
            backgroundColor: '#1e1e1e',
            color: '#fff'
          }}
        >
          <Typography variant="h4" gutterBottom>
            Best Practices for AI Usage
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Writing Effective Prompts
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <li>
                  <Typography paragraph>
                    Be specific in your requests
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Provide context when needed
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Break down complex tasks
                  </Typography>
                </li>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Working with AI
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <li>
                  <Typography paragraph>
                    Review AI-generated code
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Test functionality thoroughly
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Iterate on AI suggestions
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
"use client";  
import React, { useState } from 'react';  
import Box from '@mui/material/Box';  
import Button from '@mui/material/Button';  
import MuiCard from '@mui/material/Card';  
import Divider from '@mui/material/Divider';  
import FormLabel from '@mui/material/FormLabel';  
import FormControl from '@mui/material/FormControl';  
import TextField from '@mui/material/TextField';  
import Typography from '@mui/material/Typography';  
import { Link } from '@mui/material';  
import { styled } from '@mui/system';  
import { useRouter } from 'next/navigation';
import { signIn } from "next-auth/react";


const StyledCard = styled(MuiCard)({  
    backgroundColor: '#222',
    borderRadius: '16px',  
    border: '1px solid transparent',  
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
        background: 'linear-gradient(145deg, rgba(255, 0, 0, 0.2), rgba(0, 0, 255, 0.2))',  
        filter: 'blur(30px)',  
    },  
    '&:hover': {  
        borderColor: 'rgba(255, 0, 255, 0.8)',  
        transition: 'border-color 0.5s ease',  
    },  
});  

const LoginPage = () => {  
    const [email, setEmail] = useState('');  
    const [password, setPassword] = useState('');  
    const [error, setError] = useState('');  
    const router = useRouter();

    const handleSubmit = async(e) => {  
        e.preventDefault();  
        if (!email || !password) {  
            setError('Email and password are required.');  
            return;  
        }  
        const res = await signIn("credentials", {
            email: email,
            password: password,
            redirect: false,
          });
          if (res?.error) {
            setError(res.error);
          }

        // console.log('Logging In:', { email, password });  
        // console.log(res);
        setError('');  
        if (res?.ok) {
            return router?.push("/");
          }
    };  

    return (  
        <Box   
            sx={{   
                height: '100vh',   
                display: 'flex',   
                alignItems: 'center',   
                justifyContent: 'center',   
                backgroundColor: '#000',  
            }}   
        >  
            <Box sx={{ maxWidth: 400, width: '100%' }}>  
                <StyledCard variant="outlined" sx={{ padding: 2, position: 'relative', zIndex: 2 }}>  
                    <Typography variant="h5" component="h2" textAlign="center" color="white">  
                        Log In  
                    </Typography>  
                    <Divider sx={{ margin: '16px 0', bgcolor: 'rgba(255, 255, 255, 0.3)' }} />  
                    {error && <Typography color="error" variant="body2">{error}</Typography>}  
                    <form onSubmit={handleSubmit}>  
                        <FormControl fullWidth margin="normal">  
                            <FormLabel sx={{ color: 'white' }}>Email</FormLabel>  
                            <TextField   
                                type="email"   
                                value={email}   
                                onChange={(e) => setEmail(e.target.value)}   
                                required  
                                placeholder="Enter your email"  
                                sx={{ input: { backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' } }}   
                            />  
                        </FormControl>  
                        <FormControl fullWidth margin="normal">  
                            <FormLabel sx={{ color: 'white' }}>Password</FormLabel>  
                            <TextField   
                                type="password"   
                                value={password}   
                                onChange={(e) => setPassword(e.target.value)}   
                                required  
                                placeholder="Enter your password"  
                                sx={{ input: { backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' } }} 
                            />  
                        </FormControl>  
                        <Button type="submit" variant="contained" color="primary" fullWidth>  
                            Log In  
                        </Button>  
                    </form>  
                    <Divider sx={{ margin: '16px 0', bgcolor: 'rgba(255, 255, 255, 0.3)' }} />  
                    <Typography textAlign="center" color="white">  
                        Don’t have an account? <Link href="/signup" sx={{ color: 'cyan' }}>Sign up</Link>  
                    </Typography>  
                </StyledCard>  
            </Box>  
        </Box>  
    );  
}  

export default LoginPage;
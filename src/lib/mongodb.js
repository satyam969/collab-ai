const mongoose = require('mongoose');  

const URL = process.env.MONGODB_URL; 

if (!URL) {  
    throw new Error("Please define the MONGODB_URL environment variable");  
}  

let isConnected;  

const connectDb = async () => {  
  
    if (isConnected) {  
        console.log('Already connected to MongoDB');  
        return;  
    }  

    try {  
        await mongoose.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true });  
        isConnected = true;   
        console.log('Connected to MongoDB');  
    } catch (error) {  
        console.error('Error connecting to MongoDB:', error);  
        throw error;  
    }  
};  

module.exports = connectDb; 
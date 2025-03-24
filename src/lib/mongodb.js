import mongoose from 'mongoose';

const URL = process.env.MONGODB_URL;

if (!URL) {
    throw new Error('Please define the MONGODB_URL environment variable');
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDb = async () => {
    if (cached.conn) {
        console.log('Already connected to MongoDB');
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(URL, {
            dbName: 'collab-ai',  
            serverSelectionTimeoutMS: 30000, 
            socketTimeoutMS: 45000,         
        });
    }

    cached.conn = await cached.promise;
    console.log('Connected to MongoDB');
    return cached.conn;
};

export default connectDb;

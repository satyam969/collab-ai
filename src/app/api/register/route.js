"use server";
const connectDb =require("../../../lib/mongodb");
const User=require("../../../models/user-model");
const bcrypt = require("bcryptjs");

export async function POST(req) {  
    const { email, password, name } = await req.json();  

    try {  
        await connectDb();  
        const userFound = await User.findOne({ email });  
        if (userFound) {  
            return new Response(JSON.stringify({ error: "User already exists" }), { status: 400 });  
        }  

        const hashedPassword = await bcrypt.hash(password, 10);  
        const newUser = new User({ email, password: hashedPassword, name });  
        await newUser.save();  

        return new Response(JSON.stringify({ success: true }), { status: 200 });  
        
    } catch (error) {  
        console.error(error);  
        return new Response(JSON.stringify({ error: "Internal server error while registering" }), { status: 500 });  
    }  
}  
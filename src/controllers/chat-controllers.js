const User = require('@/models/user-model');
const Chat = require('../models/chat-model');
const mongoose = require('mongoose');

// Access Chat
const accessChat = async (body) => {
    try {
        const { projectid, projectname, userId } = body;

        if (!projectid && !projectname) {
            throw new Error('Either projectid or projectname is required.');
        }

        let chat;
        if (projectid) {
            chat = await Chat.findOne({ projectid }).populate('users', '-password').populate('latestMessage');
            if (!chat) {
                throw new Error('Chat not found for the given projectid.');
            }
        } else if (projectname) {
          
            const newChat = new Chat({
                projectname,
                users: [userId],
            });
            chat = await newChat.save();
        }

     
        chat = await User.populate(chat, {
            path: 'latestMessage.sender',
            select: 'name email',
        });

        return chat;
    } catch (error) {
        console.error('Error in accessChat:', error.message);  
        throw new Error('Failed to access chat: ' + error.message);  
    }
};

// Fetch Projects
const fetchProjects = async (userId) => {
    try {

        // const userObjectId = new mongoose.Types.ObjectId(userId);

        // const chatdata= await Chat.find()
        // .populate("users", "-password") 
        // .populate("latestMessage")
        // .sort({ updatedAt: -1 });

        // // console.log(chatdata);

        // // console.log(userId);
        
        // const chatDaata = chatdata.filter((chat) => chat.users.includes(userId));

        // console.log(chatDaata);

        const chatData = await Chat.find({ users: { $elemMatch: { $eq: userId } } })
            .populate("users", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 });

            console.log(`${chatData}`);

        const populatedData = await User.populate(chatData, {
            path: "latestMessage.sender",
            select: "name email"
        });

        return populatedData;
    } catch (error) {
        console.error('Error in fetchProjects:', error.message);
        throw new Error(error.message);
    }
};

// Add User
const addUser = async (body) => {
    try {
        const { projectid, userId } = body;

        // console.log(projectid);

        if (!projectid) {
            throw new Error('Projectid is required.');
        }
        const chat=await Chat.findOne({projectid});

        if (!chat) {
            throw new Error('Chat not found.');
        }

        // console.log(chat.users);

        // if (chat.users.includes(userId)) {
        //     throw new Error('User already exists in the chat.');
        // }

        const updatedChat = await Chat.findOneAndUpdate(
            { projectid },
            { $push: { users: userId } }, 
            { new: true }
        ).populate("users", "-password");

        if (!updatedChat) {
            throw new Error('Chat not found.');
        }

        return updatedChat;
    } catch (error) {
        console.error('Error in addUser:', error.message);
        throw new Error(error.message);
    }
};

// Remove User
const removeUser = async (body) => {
    try {
        const { projectid, userId } = body;

        const updatedChat = await Chat.findOneAndUpdate(
            { projectid },
            { $pull: { users: userId } }, 
            { new: true }
        ).populate("users", "-password");

        if (!updatedChat) {
            throw new Error('Chat not found.');
        }

        return updatedChat;
    } catch (error) {
        console.error('Error in removeUser:', error.message);
        throw new Error(error.message);
    }
};

module.exports = { addUser, accessChat, fetchProjects, removeUser };

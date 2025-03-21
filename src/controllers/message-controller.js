const Message = require('../models/message-model');
const Chat = require('../models/chat-model');
const User = require('../models/user-model'); // Ensure you have this model imported if used
const  mongoose  = require('mongoose');
const { generateResult } = require('@/services/ai-services');
const { pusherServer } = require('@/lib/pusherServer');

// Send Message
const sendMessage = async (body) => {
    try {
        const { content, projectid ,sender,filetree } = body;
        console.log(content);

        const isAIMessage= content.includes("@ai");


        

       


        if (!content || !projectid) {
            throw new Error("Invalid Data: 'content' and 'projectid' are required.");
        }

        let newMessage = {
            sender, 
            content,
            chat:projectid
        };

       
        let message = await Message.create(newMessage);

       
        message = await message.populate("sender", "name email");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name email"
        });

        
        await Chat.findByIdAndUpdate(message.chat, { latestMessage: message });

        await pusherServer.trigger(`${projectid}`, 'incoming-message', message);

        if(isAIMessage) {

            const prompt = content.replace('@ai', '') + (filetree ? ` filetree : ${filetree}` : '');
            const response= await generateResult(prompt);
            const aiUserId = new mongoose.Types.ObjectId(process.env.AI_USER_ID);

            // console.log(response);
            const jsonData = JSON.parse(response); 
            console.log("json ",jsonData);
           

            const airesponse= {
                sender: aiUserId,
                content:response,
                chat:projectid
            }

            let message= await Message.create(airesponse);
            message = await message.populate("sender", "name email");
            message = await message.populate("chat");

            message = await User.populate(message, {
                path: "chat.users",
                select: "name email"
            }
        );

            await Chat.findByIdAndUpdate(message.chat, { latestMessage: message });

            await pusherServer.trigger(`${projectid}`,'incoming-message', message);

        }

        return message; 
    } catch (error) {
        console.error('Error in sendMessage:', error.message);
        throw new Error(error.message);
    }
};

// All Messages
const allMessages = async ({ chatId }) => {
    try {
        if (!chatId) {
            throw new Error("Invalid Data: 'chatId' is required.");
        }


        // console.log(`chat id :${chatId}`);

        const allmesage=await Message.find();

        // console.log(allmesage);
       
        const messages = await Message.find({ chat: chatId  })
            .populate("sender", "name")
            .populate("chat");

            // console.log("getting ",messages);

        return messages; 
    } catch (error) {
        console.error('Error in allMessages:', error.message);
        throw new Error(error.message);
    }
};

// update mesage

const updateMessage = async (body) => {
    try {
        const { messageId, content } = body;

        if (!messageId) {
            throw new Error("Invalid Data: 'id' is required.");
        }

        if (!content) {
            throw new Error("Invalid Data: 'content' is required.");
        }


        const messageai = await Message.findOne({ _id: messageId });

        if(!messageai){
            throw new Error("Invalid Data: No message found with this id.");
        }

        if(messageai.sender===process.env.AI_USER_ID){

            const data=JSON.parse(messageai.content);
            if(!data.fileTree){
                throw new Error("Invalid Data: No file tree found in AI response.");
            }

            const nfiletree=JSON.parse(content);

            if(nfiletree.fileTree!==data.fileTree){
               
                data.fileTree=nfiletree.fileTree;

                await pusherServer.trigger(`${messageai.chat}`,'updatedfiletree',nfiletree );

            }

            messageai.content=JSON.stringify(data);

            await messageai.save();

            return messageai;

        }

      

    
        let message = await Message.findByIdAndUpdate(messageId, { content }, { new: true });

        message = await message.populate("sender", "name email");
        message = await message.populate("chat");

        return message;
    } catch (error) {
        console.error('Error in updateMessage:', error.message);
        throw new Error(error.message);
    }
};

module.exports = { sendMessage, allMessages,updateMessage};

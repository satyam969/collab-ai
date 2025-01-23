const mongoose = require('mongoose');

const chatSchema=mongoose.Schema({
    projectid: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
        trim: true,
        required: true,
      },
    projectname:{
        type: String,
        trim: true,
        required: true
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
},{timestamps:true, _id: false,})



const Chat=mongoose.models.Chat || mongoose.model('Chat',chatSchema);

module.exports=Chat;
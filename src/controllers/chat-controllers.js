const User = require("@/models/user-model");
const Chat = require("../models/chat-model");
const mongoose = require("mongoose");
const Message = require("../models/message-model");

// Access Chat
const accessChat = async (body) => {
  try {
    const { projectid, projectname, userId } = body;

    if (!projectid && !projectname) {
      throw new Error("Either projectid or projectname is required.");
    }

    let chat;
    if (projectid) {
      chat = await Chat.findOne({ projectid })
        .populate("users", "-password")
        .populate("latestMessage");
      if (!chat) {
        throw new Error("Chat not found for the given projectid.");
      }
    } else if (projectname) {
      const newChat = new Chat({
        projectname,
        users: [userId],
      });
      chat = await newChat.save();
    }

    chat = await User.populate(chat, {
      path: "latestMessage.sender",
      select: "name email",
    });

    return chat;
  } catch (error) {
    console.error("Error in accessChat:", error.message);
    throw new Error("Failed to access chat: " + error.message);
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

    // console.log(`${chatData}`);

    const populatedData = await User.populate(chatData, {
      path: "latestMessage.sender",
      select: "name email",
    });

    return populatedData;
  } catch (error) {
    console.error("Error in fetchProjects:", error.message);
    throw new Error(error.message);
  }
};

// Add User
const addUser = async (body) => {
  try {
    const { projectid, userId } = body;

    // console.log(projectid);

    if (!projectid) {
      throw new Error("Projectid is required.");
    }
    const chat = await Chat.findOne({ projectid });

    if (!chat) {
      throw new Error("Chat not found.");
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
      throw new Error("Chat not found.");
    }

    return updatedChat;
  } catch (error) {
    console.error("Error in addUser:", error.message);
    throw new Error(error.message);
  }
};

// Remove User
const removeUser = async (body) => {
  try {
    const { projectid, userId, removedBy } = body;

    // First get the project and user details before removal
    const project = await Chat.findOne({ projectid }).populate(
      "users",
      "-password"
    );

    if (!project) {
      throw new Error("Chat not found.");
    }

    const userToRemove = await User.findById(userId, "name email");

    if (!userToRemove) {
      throw new Error("User to remove not found.");
    }

    // Get the user who is removing (if provided)
    let remover = null;
    if (removedBy) {
      remover = await User.findById(removedBy, "name email");
    }

    const updatedChat = await Chat.findOneAndUpdate(
      { projectid },
      { $pull: { users: userId } },
      { new: true }
    ).populate("users", "-password");

    if (!updatedChat) {
      throw new Error("Chat not found.");
    }

    return {
      updatedChat,
      projectDetails: {
        projectid: project.projectid,
        projectname: project.projectname,
      },
      removedUser: userToRemove,
      removedBy: remover,
    };
  } catch (error) {
    console.error("Error in removeUser:", error.message);
    throw new Error(error.message);
  }
};

// Delete Project
const deleteProject = async (projectid) => {
  try {
    // First get the project to find all users who need to be notified
    const project = await Chat.findOne({ projectid }).populate(
      "users",
      "-password"
    );

    if (!project) {
      throw new Error("Project not found");
    }

    // Store project info before deletion for notifications
    const projectInfo = {
      projectid: project.projectid,
      projectname: project.projectname,
      users: project.users.map((user) => user._id.toString()),
    };

    // Delete all messages associated with the project
    await Message.deleteMany({ chat: projectid });

    // Delete the project
    await Chat.findOneAndDelete({ projectid });

    return {
      success: true,
      message: "Project and associated messages deleted successfully",
      projectInfo,
    };
  } catch (error) {
    console.error("Error in deleteProject:", error.message);
    throw new Error(error.message);
  }
};

module.exports = {
  addUser,
  accessChat,
  fetchProjects,
  removeUser,
  deleteProject,
};

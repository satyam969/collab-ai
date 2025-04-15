const User = require("@/models/user-model");
const Chat = require("../models/chat-model");
const Invitation = require("../models/invitation-model");
const mongoose = require("mongoose");

// Send invitation to a user
const sendInvitation = async (body) => {
  try {
    const { projectId, invitedUserId, invitedByUserId } = body;

    console.log("projectId", projectId);

    // Check if project exists
    const project = await Chat.findOne({ projectid: projectId });
    if (!project) {
      throw new Error("Project not found");
    }

    // Check if user exists
    const invitedUser = await User.findById(invitedUserId);
    if (!invitedUser) {
      throw new Error("Invited user not found");
    }

    // Check if invitation already exists
    const existingInvitation = await Invitation.findOne({
      projectIdStr: projectId.toString(),
      invitedUser: invitedUserId,
      status: "pending",
    });

    if (existingInvitation) {
      throw new Error("Invitation already sent to this user");
    }

    // Check if user is already in the project
    const isUserInProject = project.users.some(
      (userId) => userId.toString() === invitedUserId.toString()
    );

    if (isUserInProject) {
      throw new Error("User is already in this project");
    }

    // Create new invitation
    const newInvitation = new Invitation({
      projectId: project._id,
      projectIdStr: projectId.toString(),
      projectName: project.projectname,
      invitedBy: invitedByUserId,
      invitedUser: invitedUserId,
      status: "pending",
    });

    const savedInvitation = await newInvitation.save();
    console.log("Saved invitation:", savedInvitation);

    // Populate invitation with user details
    const populatedInvitation = await Invitation.findById(savedInvitation._id)
      .populate("invitedBy", "name email")
      .populate("invitedUser", "name email");

    return populatedInvitation;
  } catch (error) {
    console.error("Error in sendInvitation:", error.message);
    throw new Error(error.message);
  }
};

// Get invitations for a user
const getUserInvitations = async (userId) => {
  try {
    const invitations = await Invitation.find({
      invitedUser: userId,
      status: "pending",
    })
      .populate("invitedBy", "name email")
      .populate("projectId", "projectname");

    return invitations;
  } catch (error) {
    console.error("Error in getUserInvitations:", error.message);
    throw new Error(error.message);
  }
};

// Respond to invitation (accept/reject)
const respondToInvitation = async (body) => {
  try {
    const { invitationId, response, userId } = body;

    if (!["accepted", "rejected"].includes(response)) {
      throw new Error("Invalid response. Must be 'accepted' or 'rejected'");
    }

    // Find invitation
    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    console.log("Found invitation:", invitation);

    if (invitation.invitedUser.toString() !== userId) {
      throw new Error("Not authorized to respond to this invitation");
    }

    // Check if projectIdStr exists, if not log and fix
    if (!invitation.projectIdStr) {
      console.log("Missing projectIdStr, attempting to fix with projectId");
      if (invitation.projectId) {
        invitation.projectIdStr = invitation.projectId.toString();
        await invitation.save();
        console.log("Fixed invitation:", invitation);
      } else {
        throw new Error("Missing both projectId and projectIdStr");
      }
    }

    // Get project details
    const project = await Chat.findOne({ projectid: invitation.projectIdStr });
    if (!project) {
      // Try looking up by _id as fallback
      const projectById = await Chat.findById(invitation.projectId);
      if (!projectById) {
        throw new Error("Project not found");
      }
      // Use the projectById instead
      console.log("Found project by _id instead of projectid");

      // Update invitation with correct projectIdStr
      invitation.projectIdStr = projectById.projectid.toString();
      await invitation.save();
      console.log("Updated invitation with correct projectIdStr:", invitation);
    }

    // Update invitation status
    invitation.status = response;
    await invitation.save();
    console.log("Updated invitation status:", invitation);

    // If accepted, add user to project
    if (response === "accepted") {
      const updatedProject = await Chat.findOneAndUpdate(
        { projectid: invitation.projectIdStr },
        { $addToSet: { users: userId } },
        { new: true }
      );
      console.log("Updated project users:", updatedProject);
    }

    // Populate user data for notifications
    const invitedByUser = await User.findById(invitation.invitedBy);
    const invitedUser = await User.findById(invitation.invitedUser);

    // Get latest project data
    const freshProject = await Chat.findOne({
      projectid: invitation.projectIdStr,
    });

    // Return populated data for notifications
    return {
      _id: invitation._id,
      status: invitation.status,
      projectId: {
        _id: freshProject._id,
        projectid: freshProject.projectid,
        projectname: freshProject.projectname,
      },
      projectIdStr: invitation.projectIdStr,
      projectName: invitation.projectName,
      invitedBy: invitedByUser,
      invitedUser: invitedUser,
    };
  } catch (error) {
    console.error("Error in respondToInvitation:", error.message);
    throw new Error(error.message);
  }
};

module.exports = { sendInvitation, getUserInvitations, respondToInvitation };

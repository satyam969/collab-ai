import { NextResponse } from "next/server";
import {
  sendInvitation,
  getUserInvitations,
  respondToInvitation,
} from "@/controllers/invitation-controllers";
import connectDb from "@/lib/mongodb";
import { pusherServer } from "@/lib/pusherServer";

await connectDb();

// Create a new invitation
export const POST = async (req) => {
  try {
    const body = await req.json();
    const { projectId, invitedUserId, invitedByUserId } = body;

    if (!projectId || !invitedUserId || !invitedByUserId) {
      return NextResponse.json(
        { error: "Project ID, invited user ID, and inviter ID are required" },
        { status: 400 }
      );
    }


    const invitation = await sendInvitation(body);

    // Notify the invited user about the invitation
    await pusherServer.trigger(`user-${invitedUserId}`, "new-invitation", {
      invitation,
      message: `You have been invited to join project "${invitation.projectName}" by ${invitation.invitedBy.name}`,
    });

    return NextResponse.json(
      { message: "Invitation sent successfully", invitation },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST invitation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send invitation" },
      { status: 500 }
    );
  }
};

// Get invitations for a user
export const GET = async (req) => {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const invitations = await getUserInvitations(userId);
    return NextResponse.json({ invitations }, { status: 200 });
  } catch (error) {
    console.error("Error in GET invitations:", error);
    return NextResponse.json(
      { error: "Failed to get invitations" },
      { status: 500 }
    );
  }
};

// Respond to an invitation
export const PATCH = async (req) => {
  try {
    const body = await req.json();
    const { invitationId, response, userId } = body;

    if (!invitationId || !response || !userId) {
      return NextResponse.json(
        { error: "Invitation ID, response, and user ID are required" },
        { status: 400 }
      );
    }

    const invitation = await respondToInvitation(body);

    // Make sure we have all the data needed for notifications
    if (
      !invitation ||
      !invitation.invitedUser ||
      !invitation.invitedBy ||
      !invitation.projectId
    ) {
      throw new Error("Missing data in the processed invitation");
    }

    // Notify the project creator about the response
    await pusherServer.trigger(
      `user-${invitation.invitedBy._id}`,
      "invitation-response",
      {
        invitation,
        message: `${invitation.invitedUser.name} ${response} your invitation to project "${invitation.projectName}"`,
      }
    );

    // If accepted, notify all project users about the new member
    if (response === "accepted") {
      // Create a channel for the project
      const channelName = `project-${invitation.projectIdStr}`;

      await pusherServer.trigger(channelName, "new-member", {
        user: invitation.invitedUser,
        message: `${invitation.invitedUser.name} has joined the project`,
      });
    }

    return NextResponse.json(
      { message: `Invitation ${response} successfully`, invitation },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PATCH invitation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to respond to invitation" },
      { status: 500 }
    );
  }
};

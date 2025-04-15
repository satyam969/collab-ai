import { NextResponse } from "next/server";
import {
  addUser,
  accessChat,
  fetchProjects,
  removeUser,
  deleteProject,
} from "../../../controllers/chat-controllers";
import connectDb from "@/lib/mongodb";
import { pusherServer } from "@/lib/pusherServer";
import { createNotification } from "@/controllers/notification-controllers";

await connectDb();

export const POST = async (req) => {
  try {
    const body = await req.json();
    if (body.projectname) {
      const result = await accessChat(body);
      return NextResponse.json(
        { message: "Chat created successfully", result },
        { status: 200 }
      );
    } else if (body.projectid && !body.userId) {
      const result = await accessChat(body);
      return NextResponse.json(
        { message: "Chat accessed successfully", result },
        { status: 200 }
      );
    } else if (body.userId) {
      const result = await addUser(body);
      return NextResponse.json(
        { message: "User added successfully", result },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Invalid request. Provide either projectid or userId." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const GET = async (req) => {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    // console.log(userId);
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid request. User ID is required." },
        { status: 400 }
      );
    }
    const result = await fetchProjects(userId);
    return NextResponse.json({ projects: result }, { status: 200 });
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
};

export const DELETE = async (req) => {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const projectid = req.nextUrl.searchParams.get("projectid");
    const action = req.nextUrl.searchParams.get("action");
    const removedBy = req.nextUrl.searchParams.get("removedBy");

    if (!userId || !projectid) {
      return NextResponse.json(
        { error: "Invalid request. User ID and project ID are required." },
        { status: 400 }
      );
    }

    if (action === "deleteProject") {
      const result = await deleteProject(projectid);

      // Get all users from the project to notify them
      const { projectInfo } = result;

      // Create a channel for the project
      const channelName = `project-${projectid}`;

      // Notify all users in the project about deletion through the project channel (real-time)
      await pusherServer.trigger(channelName, "project-deleted", {
        message: `Project "${projectInfo.projectname}" has been deleted by the creator.`,
        projectid: projectid,
        deletedBy: userId,
      });

      // Also send individual notifications to each user's personal channel (real-time)
      // And create persistent notifications for offline users
      for (const userIdToNotify of projectInfo.users) {
        if (userIdToNotify !== userId) {
          // Don't notify the user who deleted the project
          // Real-time notification
          await pusherServer.trigger(
            `user-${userIdToNotify}`,
            "project-deleted",
            {
              message: `Project "${projectInfo.projectname}" has been deleted.`,
              projectid: projectid,
              deletedBy: userId,
              projectname: projectInfo.projectname,
            }
          );

          // Persistent notification for offline users
          await createNotification({
            userId: userIdToNotify,
            message: `Project "${projectInfo.projectname}" has been deleted by the owner.`,
            type: "project-deleted",
            metadata: {
              projectId: projectid,
              projectName: projectInfo.projectname,
              deletedBy: userId,
              deletedAt: new Date(),
            },
          });
        }
      }

      return NextResponse.json(
        { message: "Project deleted successfully", result },
        { status: 200 }
      );
    } else {
      // This is the user removal functionality
      const body = { projectid, userId, removedBy };
      const result = await removeUser(body);

      // Notify the removed user through their personal channel (real-time)
      await pusherServer.trigger(`user-${userId}`, "user-removed", {
        message: `You have been removed from project "${result.projectDetails.projectname}".`,
        projectid: projectid,
        projectname: result.projectDetails.projectname,
        removedBy: result.removedBy?.name || "A project admin",
      });

      // Also store a persistent notification for offline users
      await createNotification({
        userId: userId,
        message: `You have been removed from project "${result.projectDetails.projectname}".`,
        type: "project-removed",
        metadata: {
          projectId: projectid,
          projectName: result.projectDetails.projectname,
          removedBy: removedBy,
          removedAt: new Date(),
        },
      });

      // Also notify all active project users through the project channel (real-time)
      const channelName = `project-${projectid}`;
      await pusherServer.trigger(channelName, "member-removed", {
        message: `${result.removedUser.name} has been removed from the project.`,
        removedUserId: userId,
        projectid: projectid,
      });

      return NextResponse.json(
        { message: "User removed successfully", result },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error in DELETE request:", error);
    return NextResponse.json(
      { error: "Failed to process delete request" },
      { status: 500 }
    );
  }
};

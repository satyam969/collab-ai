import { NextResponse } from "next/server";
import {
  createNotification,
  getUserNotifications,
  markNotificationsAsRead,
  deleteNotifications,
} from "@/controllers/notification-controllers";
import connectDb from "@/lib/mongodb";

await connectDb();

// Get notifications for a user
export const GET = async (req) => {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const limit = req.nextUrl.searchParams.get("limit") || 20;
    const skip = req.nextUrl.searchParams.get("skip") || 0;
    const onlyUnread = req.nextUrl.searchParams.get("onlyUnread") === "true";

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const result = await getUserNotifications(userId, {
      limit,
      skip,
      onlyUnread,
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error in GET notifications:", error);
    return NextResponse.json(
      { error: "Failed to get notifications" },
      { status: 500 }
    );
  }
};

// Create a new notification
export const POST = async (req) => {
  try {
    const body = await req.json();
    const { userId, message, type, metadata } = body;

    if (!userId || !message) {
      return NextResponse.json(
        { error: "User ID and message are required" },
        { status: 400 }
      );
    }

    const result = await createNotification({
      userId,
      message,
      type,
      metadata,
    });

    return NextResponse.json(
      { message: "Notification created successfully", notification: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
};

// Mark notifications as read
export const PATCH = async (req) => {
  try {
    const body = await req.json();
    const { userId, notificationIds, all } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!all && (!notificationIds || notificationIds.length === 0)) {
      return NextResponse.json(
        { error: "Either notification IDs or 'all' flag must be provided" },
        { status: 400 }
      );
    }

    const result = await markNotificationsAsRead({
      userId,
      notificationIds,
      all,
    });

    return NextResponse.json(
      { message: "Notifications marked as read", result },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PATCH notifications:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
};

// Delete notifications
export const DELETE = async (req) => {
  try {
    const body = await req.json();
    const { userId, notificationIds, all } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!all && (!notificationIds || notificationIds.length === 0)) {
      return NextResponse.json(
        { error: "Either notification IDs or 'all' flag must be provided" },
        { status: 400 }
      );
    }

    const result = await deleteNotifications({
      userId,
      notificationIds,
      all,
    });

    return NextResponse.json(
      { message: "Notifications deleted successfully", result },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE notifications:", error);
    return NextResponse.json(
      { error: "Failed to delete notifications" },
      { status: 500 }
    );
  }
};

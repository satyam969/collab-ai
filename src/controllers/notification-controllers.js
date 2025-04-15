const Notification = require("../models/notification-model");
const mongoose = require("mongoose");

// Create a new notification
const createNotification = async (notification) => {
  try {
    const { userId, message, type, metadata } = notification;

    // Validate required fields
    if (!userId || !message) {
      throw new Error("User ID and message are required");
    }

    // Create the notification
    const newNotification = new Notification({
      userId,
      message,
      type: type || "other",
      metadata: metadata || {},
      isRead: false,
    });

    await newNotification.save();
    return newNotification;
  } catch (error) {
    console.error("Error creating notification:", error.message);
    throw new Error(error.message);
  }
};

// Get notifications for a user
const getUserNotifications = async (userId, params = {}) => {
  try {
    const { limit = 20, skip = 0, onlyUnread = false } = params;

    // Build the query
    const query = { userId };
    if (onlyUnread) {
      query.isRead = false;
    }

    // Get notifications with pagination
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Notification.countDocuments(query);

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    return {
      notifications,
      pagination: {
        total,
        unreadCount,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    };
  } catch (error) {
    console.error("Error getting user notifications:", error.message);
    throw new Error(error.message);
  }
};

// Mark notifications as read
const markNotificationsAsRead = async (params) => {
  try {
    const { userId, notificationIds, all = false } = params;

    // Validate required fields
    if (!userId) {
      throw new Error("User ID is required");
    }

    let updateResult;

    if (all) {
      // Mark all notifications as read
      updateResult = await Notification.updateMany(
        { userId },
        { $set: { isRead: true } }
      );
    } else if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      updateResult = await Notification.updateMany(
        {
          userId,
          _id: {
            $in: notificationIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
        },
        { $set: { isRead: true } }
      );
    } else {
      throw new Error("Either notification IDs or 'all' flag must be provided");
    }

    return {
      success: true,
      modifiedCount: updateResult.modifiedCount,
    };
  } catch (error) {
    console.error("Error marking notifications as read:", error.message);
    throw new Error(error.message);
  }
};

// Delete notifications
const deleteNotifications = async (params) => {
  try {
    const { userId, notificationIds, all = false } = params;

    // Validate required fields
    if (!userId) {
      throw new Error("User ID is required");
    }

    let deleteResult;

    if (all) {
      // Delete all notifications
      deleteResult = await Notification.deleteMany({ userId });
    } else if (notificationIds && notificationIds.length > 0) {
      // Delete specific notifications
      deleteResult = await Notification.deleteMany({
        userId,
        _id: {
          $in: notificationIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
      });
    } else {
      throw new Error("Either notification IDs or 'all' flag must be provided");
    }

    return {
      success: true,
      deletedCount: deleteResult.deletedCount,
    };
  } catch (error) {
    console.error("Error deleting notifications:", error.message);
    throw new Error(error.message);
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationsAsRead,
  deleteNotifications,
};

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { withAuth } from '@/lib/auth';
import Notification from '@/models/Notification';

// GET /api/notifications - Get user's notifications
export const GET = withAuth(async (request: Request, user: any) => {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    
    const query: any = { user: user.userId };
    if (unreadOnly) {
      query.read = false;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    const unreadCount = await Notification.countDocuments({ 
      user: user.userId, 
      read: false 
    });
    
    const transformedNotifications = notifications.map((notification: any) => ({
      id: notification._id.toString(),
      type: notification.type,
      message: notification.message,
      data: notification.data,
      read: notification.read,
      createdAt: notification.createdAt
    }));
    
    return NextResponse.json({
      notifications: transformedNotifications,
      unreadCount
    });
    
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, ['user', 'owner', 'admin']);

// PUT /api/notifications - Mark notifications as read
export const PUT = withAuth(async (request: Request, user: any) => {
  try {
    await dbConnect();
    
    const { notificationIds, markAllAsRead } = await request.json();
    
    let updateQuery: any = { user: user.userId };
    
    if (markAllAsRead) {
      // Mark all notifications as read
      updateQuery = { user: user.userId, read: false };
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      updateQuery = { 
        user: user.userId, 
        _id: { $in: notificationIds } 
      };
    } else {
      return NextResponse.json(
        { error: 'Invalid request - provide notificationIds or markAllAsRead' },
        { status: 400 }
      );
    }
    
    const result = await Notification.updateMany(
      updateQuery,
      { read: true }
    );
    
    return NextResponse.json({
      message: `Marked ${result.modifiedCount} notifications as read`,
      modifiedCount: result.modifiedCount
    });
    
  } catch (error: any) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, ['user', 'owner', 'admin']);

import { getApperClient } from "@/services/apperClient";
import { showToast } from "@/utils/toast";

// Mock user preferences (in real app, would be stored in database)
let userPreferences = {
  email_frequency_c: 'instant',
  push_notifications_c: true,
  sound_enabled_c: true,
  priority_based_notifications_c: false,
  quiet_hours_enabled_c: false,
  quiet_hours_start_c: '22:00',
  quiet_hours_end_c: '08:00',
  notification_types_c: [
    'task_assigned', 'task_completed', 'task_due', 'task_overdue',
    'task_mentioned', 'task_comment', 'reminder', 'comment_reply', 'comment_mention'
  ]
};

export const notificationService = {
  // Get all notifications
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('notification_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "message_c"}},
          {"field": {"Name": "task_id_c"}},
          {"field": {"Name": "user_id_c"}},
          {"field": {"Name": "metadata_c"}},
          {"field": {"Name": "is_read_c"}},
          {"field": {"Name": "read_at_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(notification => ({
        Id: notification.Id,
        type: notification.type_c,
        title: notification.title_c,
        message: notification.message_c,
        taskId: notification.task_id_c?.Id || notification.task_id_c,
        userId: notification.user_id_c?.Id || notification.user_id_c,
        metadata: notification.metadata_c || {},
        isRead: notification.is_read_c || false,
        readAt: notification.read_at_c,
        createdAt: notification.CreatedOn,
        updatedAt: notification.ModifiedOn
      }));
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  },

  // Get recent notifications (for bell dropdown)
  async getRecent(limit = 10) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('notification_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "message_c"}},
          {"field": {"Name": "task_id_c"}},
          {"field": {"Name": "user_id_c"}},
          {"field": {"Name": "metadata_c"}},
          {"field": {"Name": "is_read_c"}},
          {"field": {"Name": "read_at_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}],
        pagingInfo: {
          limit: limit,
          offset: 0
        }
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(notification => ({
        Id: notification.Id,
        type: notification.type_c,
        title: notification.title_c,
        message: notification.message_c,
        taskId: notification.task_id_c?.Id || notification.task_id_c,
        userId: notification.user_id_c?.Id || notification.user_id_c,
        metadata: notification.metadata_c || {},
        isRead: notification.is_read_c || false,
        readAt: notification.read_at_c,
        createdAt: notification.CreatedOn
      }));
    } catch (error) {
      console.error("Error fetching recent notifications:", error);
      return [];
    }
  },

  // Get unread count
  async getUnreadCount() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('notification_c', {
        fields: [{"field": {"Name": "Id"}}],
        where: [{
          "FieldName": "is_read_c",
          "Operator": "EqualTo",
          "Values": [false]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return 0;
      }

      return response.data.length;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  },

  // Mark notification as read
  async markAsRead(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Id: parseInt(id),
          is_read_c: true,
          read_at_c: new Date().toISOString()
        }]
      };

      const response = await apperClient.updateRecord('notification_c', params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      return { Id: id, isRead: true, readAt: new Date().toISOString() };
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return null;
    }
  },

  // Mark notification as unread
  async markAsUnread(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Id: parseInt(id),
          is_read_c: false,
          read_at_c: null
        }]
      };

      const response = await apperClient.updateRecord('notification_c', params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      return { Id: id, isRead: false, readAt: null };
    } catch (error) {
      console.error("Error marking notification as unread:", error);
      return null;
    }
  },

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Get all unread notifications first
      const unreadResponse = await apperClient.fetchRecords('notification_c', {
        fields: [{"field": {"Name": "Id"}}],
        where: [{
          "FieldName": "is_read_c",
          "Operator": "EqualTo",
          "Values": [false]
        }]
      });

      if (!unreadResponse.success || !unreadResponse.data.length) {
        return [];
      }

      const now = new Date().toISOString();
      const params = {
        records: unreadResponse.data.map(notification => ({
          Id: notification.Id,
          is_read_c: true,
          read_at_c: now
        }))
      };

      const response = await apperClient.updateRecord('notification_c', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      showToast.success('All notifications marked as read');
      return unreadResponse.data;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return [];
    }
  },

  // Delete notification
  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.deleteRecord('notification_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        return false;
      }

      showToast.success('Notification deleted');
      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      return false;
    }
  },

  // Create new notification
  async create(notificationData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          type_c: notificationData.type,
          title_c: notificationData.title,
          message_c: notificationData.message,
          task_id_c: notificationData.taskId || null,
          user_id_c: notificationData.userId || null,
          metadata_c: JSON.stringify(notificationData.metadata || {}),
          is_read_c: false,
          read_at_c: null
        }]
      };

      const response = await apperClient.createRecord('notification_c', params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      if (response.results && response.results.length > 0 && response.results[0].success) {
        const newNotification = response.results[0].data;
        return {
          Id: newNotification.Id,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          taskId: notificationData.taskId,
          userId: notificationData.userId,
          metadata: notificationData.metadata || {},
          isRead: false,
          readAt: null,
          createdAt: new Date().toISOString()
        };
      }

      return null;
    } catch (error) {
      console.error("Error creating notification:", error);
      return null;
    }
  },

  // Get user notification preferences
  async getPreferences() {
    return { ...userPreferences };
  },

  // Update user notification preferences
  async updatePreferences(preferences) {
    userPreferences = { ...preferences };
    return userPreferences;
  },

  // Create task-related notification
  async createTaskNotification(type, taskId, taskTitle, message, userId = null) {
    const typeMessages = {
      task_assigned: 'You have been assigned to a task',
      task_completed: 'Task has been completed',
      task_due: 'Task is due soon',
      task_overdue: 'Task is overdue',
      task_mentioned: 'You were mentioned in a task',
      task_comment: 'New comment on your task',
      task_updated: 'Task has been updated',
      reminder: 'Task reminder'
    };

    const notification = {
      type,
      title: typeMessages[type] || 'Task notification',
      message: message || `${taskTitle}`,
      taskId,
      userId,
      metadata: {
        taskTitle,
        taskId
      }
    };

    return this.create(notification);
  },

  // Create comment-related notification
  async createCommentNotification(type, commentId, taskId, taskTitle, message, userId, authorName, commentContent = null) {
    const typeMessages = {
      comment_reply: 'Someone replied to your comment',
      comment_mention: 'You were mentioned in a comment'
    };

    const notification = {
      type,
      title: typeMessages[type] || 'Comment notification',
      message: message || typeMessages[type],
      taskId,
      userId,
      metadata: {
        taskTitle,
        taskId,
        commentId,
        authorName,
        commentContent: commentContent ? (commentContent.length > 100 ? commentContent.substring(0, 97) + '...' : commentContent) : null
      }
    };

    return this.create(notification);
  },

  // Email notification functionality (using edge function)
  async sendEmailNotification(emailData) {
    try {
      // Check if email notifications are enabled
      if (!userPreferences.email_frequency_c || userPreferences.email_frequency_c === 'never') {
        return { success: false, reason: 'Email notifications disabled' };
      }

      // Respect quiet hours for non-urgent emails
      if (!this.shouldSendNotification() && emailData.priority !== 'High') {
        return { success: false, reason: 'Quiet hours active' };
      }

      // Create email from template
      const emailContent = await this.createEmailFromTemplate(emailData);
      
      // Initialize ApperClient for edge function call
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const result = await apperClient.functions.invoke(import.meta.env.VITE_SEND_EMAIL_NOTIFICATION, {
        body: JSON.stringify({
          to: emailData.assignedTo || emailData.recipientEmail,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
          taskId: emailData.taskId,
          type: emailData.type
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (result.success === false) {
        console.info(`apper_info: Got an error in this function: ${import.meta.env.VITE_SEND_EMAIL_NOTIFICATION}. The response body is: ${JSON.stringify(result)}.`);
        return { success: false, error: result.error || 'Email sending failed' };
      }

      // Create notification record
      const notification = await this.create({
        type: 'email_sent',
        title: 'Email notification sent',
        message: `Email sent: ${emailContent.subject}`,
        taskId: emailData.taskId,
        metadata: {
          emailType: emailData.type,
          recipient: emailData.assignedTo,
          subject: emailContent.subject
        }
      });

      return { success: true, notificationId: notification?.Id, messageId: result.messageId };
    } catch (error) {
      console.info(`apper_info: Got this error an this function: ${import.meta.env.VITE_SEND_EMAIL_NOTIFICATION}. The error is: ${error.message}`);
      throw new Error(`Email notification failed: ${error.message}`);
    }
  },

  // Create email content from template
  async createEmailFromTemplate(emailData) {
    const templates = {
      task_assigned: {
        subject: `New task assigned: ${emailData.taskTitle}`,
        htmlTemplate: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Task Assignment</h2>
            <p>You have been assigned a new task:</p>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #1f2937;">${emailData.taskTitle}</h3>
              ${emailData.description ? `<p style="color: #6b7280;">${emailData.description}</p>` : ''}
              ${emailData.dueDate ? `<p><strong>Due Date:</strong> ${new Date(emailData.dueDate).toLocaleDateString()}</p>` : ''}
              ${emailData.priority ? `<p><strong>Priority:</strong> ${emailData.priority}</p>` : ''}
            </div>
            <p>Click here to view the task in your dashboard.</p>
          </div>
        `,
        textTemplate: `New Task Assignment\n\nYou have been assigned: ${emailData.taskTitle}\n\n${emailData.description || ''}\n\nDue Date: ${emailData.dueDate ? new Date(emailData.dueDate).toLocaleDateString() : 'Not set'}\nPriority: ${emailData.priority || 'Not set'}`
      },
      task_comment: {
        subject: `New comment on ${emailData.taskTitle}`,
        htmlTemplate: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1;">New Comment</h2>
            <p>A new comment has been added to your task:</p>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
              <h3 style="margin: 0 0 10px 0; color: #1f2937;">${emailData.taskTitle}</h3>
              <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;"><strong>Comment by:</strong> ${emailData.commentAuthor || 'Unknown User'}</p>
                <div style="color: #374151; line-height: 1.5;">
                  ${emailData.commentSnippet || 'No comment content available'}
                </div>
              </div>
              <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">
                <strong>Posted:</strong> ${new Date().toLocaleString()}
              </p>
            </div>
            <p>Click here to view the full conversation and respond.</p>
          </div>
        `,
        textTemplate: `New Comment on ${emailData.taskTitle}\n\nA new comment has been added to your task:\n\nTask: ${emailData.taskTitle}\nComment by: ${emailData.commentAuthor || 'Unknown User'}\nComment: ${emailData.commentSnippet || 'No comment content available'}\nPosted: ${new Date().toLocaleString()}\n\nView the full conversation in your dashboard.`
      }
    };

    const template = templates[emailData.type] || templates.task_assigned;
    
    return {
      subject: template.subject,
      html: template.htmlTemplate,
      text: template.textTemplate
    };
  },

  // Check if notifications should be sent (respects quiet hours)
  shouldSendNotification(preferences = userPreferences) {
    if (!preferences.quiet_hours_enabled_c) return true;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = preferences.quiet_hours_start_c.split(':').map(Number);
    const [endHour, endMin] = preferences.quiet_hours_end_c.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    if (startTime <= endTime) {
      // Same day quiet hours (e.g., 22:00 - 08:00 next day)
      return !(currentTime >= startTime && currentTime <= endTime);
    } else {
      // Overnight quiet hours (e.g., 08:00 - 22:00)
      return currentTime >= endTime && currentTime <= startTime;
    }
  }
};
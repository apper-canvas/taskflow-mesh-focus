import { getApperClient } from "@/services/apperClient";
import { showToast } from "@/utils/toast";

// Mock team members for mentions (in real app, would come from user management)
const mockTeamMembers = [
  { Id: 1, name: "John Doe", email: "john@example.com", avatar: null },
  { Id: 2, name: "Sarah Wilson", email: "sarah@example.com", avatar: null },
  { Id: 3, name: "Mike Chen", email: "mike@example.com", avatar: null },
  { Id: 4, name: "Emily Davis", email: "emily@example.com", avatar: null },
  { Id: 5, name: "Alex Johnson", email: "alex@example.com", avatar: null }
];

// Helper function to get user by ID
const getUserById = (userId) => {
  const user = mockTeamMembers.find(member => member.Id === userId);
  return user || { Id: userId, name: `User ${userId}`, email: `user${userId}@example.com`, avatar: null };
};

// Get comment topics for a task
export const getCommentTopics = async (taskId) => {
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error("ApperClient not initialized");
    }

    const response = await apperClient.fetchRecords('comment_c', {
      fields: [{"field": {"Name": "topic_c"}}],
      where: [{
        "FieldName": "task_id_c",
        "Operator": "EqualTo",
        "Values": [parseInt(taskId)]
      }]
    });

    if (!response.success) {
      console.error(response.message);
      return [];
    }

    const topics = [...new Set(response.data.map(c => c.topic_c).filter(Boolean))];
    return topics.sort();
  } catch (error) {
    console.error("Error fetching comment topics:", error);
    return [];
  }
};

// Get all comments for a specific task
export const getCommentsByTaskId = async (taskId) => {
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error("ApperClient not initialized");
    }

    const response = await apperClient.fetchRecords('comment_c', {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "task_id_c"}},
        {"field": {"Name": "parent_id_c"}},
        {"field": {"Name": "topic_c"}},
        {"field": {"Name": "content_c"}},
        {"field": {"Name": "content_type_c"}},
        {"field": {"Name": "author_id_c"}},
        {"field": {"Name": "author_name_c"}},
        {"field": {"Name": "author_email_c"}},
        {"field": {"Name": "mentions_c"}},
        {"field": {"Name": "reactions_c"}},
        {"field": {"Name": "likes_c"}},
        {"field": {"Name": "liked_by_c"}},
        {"field": {"Name": "is_pinned_c"}},
        {"field": {"Name": "is_resolved_c"}},
        {"field": {"Name": "is_edited_c"}},
        {"field": {"Name": "edit_history_c"}},
        {"field": {"Name": "is_unread_c"}},
        {"field": {"Name": "quoted_comment_id_c"}},
        {"field": {"Name": "edit_window_minutes_c"}},
        {"field": {"Name": "CreatedOn"}},
        {"field": {"Name": "ModifiedOn"}}
      ],
      where: [{
        "FieldName": "task_id_c",
        "Operator": "EqualTo",
        "Values": [parseInt(taskId)]
      }],
      orderBy: [{"fieldName": "CreatedOn", "sorttype": "ASC"}]
    });

    if (!response.success) {
      console.error(response.message);
      return [];
    }

    return response.data.map(comment => ({
      Id: comment.Id,
      taskId: comment.task_id_c?.Id || comment.task_id_c,
      parentId: comment.parent_id_c?.Id || comment.parent_id_c,
      topic: comment.topic_c,
      content: comment.content_c,
      contentType: comment.content_type_c || "html",
      authorId: comment.author_id_c?.Id || comment.author_id_c || 1,
      authorName: comment.author_name_c || "Unknown User",
      authorEmail: comment.author_email_c || "",
      mentions: comment.mentions_c ? (typeof comment.mentions_c === 'string' ? comment.mentions_c.split(',') : comment.mentions_c) : [],
      reactions: comment.reactions_c || [],
      likes: comment.likes_c || 0,
      likedBy: comment.liked_by_c || [],
      isPinned: comment.is_pinned_c || false,
      isResolved: comment.is_resolved_c || false,
      isEdited: comment.is_edited_c || false,
      editHistory: comment.edit_history_c || [],
      isUnread: comment.is_unread_c || false,
      quotedCommentId: comment.quoted_comment_id_c,
      editWindowMinutes: comment.edit_window_minutes_c || 5,
      createdAt: comment.CreatedOn,
      updatedAt: comment.ModifiedOn
    }));
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

// Get a single comment by ID
export const getCommentById = async (id) => {
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error("ApperClient not initialized");
    }

    const response = await apperClient.getRecordById('comment_c', id, {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "task_id_c"}},
        {"field": {"Name": "parent_id_c"}},
        {"field": {"Name": "topic_c"}},
        {"field": {"Name": "content_c"}},
        {"field": {"Name": "content_type_c"}},
        {"field": {"Name": "author_id_c"}},
        {"field": {"Name": "author_name_c"}},
        {"field": {"Name": "author_email_c"}},
        {"field": {"Name": "CreatedOn"}},
        {"field": {"Name": "ModifiedOn"}}
      ]
    });

    if (!response.success || !response.data) {
      return null;
    }

    const comment = response.data;
    return {
      Id: comment.Id,
      taskId: comment.task_id_c?.Id || comment.task_id_c,
      parentId: comment.parent_id_c?.Id || comment.parent_id_c,
      topic: comment.topic_c,
      content: comment.content_c,
      contentType: comment.content_type_c || "html",
      authorId: comment.author_id_c?.Id || comment.author_id_c || 1,
      authorName: comment.author_name_c || "Unknown User",
      authorEmail: comment.author_email_c || "",
      createdAt: comment.CreatedOn,
      updatedAt: comment.ModifiedOn
    };
  } catch (error) {
    console.error("Error fetching comment:", error);
    return null;
  }
};

// Create a new comment
export const createComment = async (commentData) => {
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error("ApperClient not initialized");
    }

    // Validate required fields
    if (!commentData) {
      throw new Error('Comment data is required');
    }

    const content = commentData.content?.trim() || '';
    if (!content || content.length < 3) {
      throw new Error('Comment content must be at least 3 characters long');
    }

    if (!commentData.taskId) {
      throw new Error('Task ID is required for comments');
    }

    const params = {
      records: [{
        task_id_c: parseInt(commentData.taskId),
        parent_id_c: commentData.parentId ? parseInt(commentData.parentId) : null,
        topic_c: commentData.topic || null,
        content_c: content.trim(),
        content_type_c: commentData.contentType || "html",
        author_id_c: commentData.authorId || null,
        author_name_c: commentData.authorName || "Current User",
        author_email_c: commentData.authorEmail || "",
        mentions_c: Array.isArray(commentData.mentions) ? commentData.mentions.join(',') : "",
        reactions_c: "",
        likes_c: 0,
        liked_by_c: "",
        is_pinned_c: false,
        is_resolved_c: false,
        is_edited_c: false,
        edit_history_c: "",
        is_unread_c: false,
        quoted_comment_id_c: commentData.quotedCommentId || null,
        edit_window_minutes_c: 5
      }]
    };

    const response = await apperClient.createRecord('comment_c', params);

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message || 'Failed to create comment');
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to create ${failed.length} comments:`, failed);
        failed.forEach(record => {
          if (record.message) showToast.error(record.message);
        });
      }
      
      if (successful.length > 0) {
        const newComment = successful[0].data;
        showToast.success('Comment posted successfully!');
        
        // Generate notifications asynchronously
        setTimeout(async () => {
          try {
            const { notificationService } = await import('./notificationService.js');
            
            // Notification for reply to existing comment
            if (commentData.parentId) {
              const parentComment = await getCommentById(commentData.parentId);
              if (parentComment && parentComment.authorId !== (commentData.authorId || 1)) {
                await notificationService.createCommentNotification(
                  'comment_reply',
                  newComment.Id,
                  commentData.taskId,
                  `Task #${commentData.taskId}`,
                  `${commentData.authorName || 'Current User'} replied to your comment`,
                  parentComment.authorId,
                  commentData.authorName || 'Current User',
                  content.trim()
                );
              }
            }

            // Notifications for mentions
            if (commentData.mentions && Array.isArray(commentData.mentions)) {
              for (const mention of commentData.mentions) {
                if (mention.id && mention.id !== (commentData.authorId || 1)) {
                  await notificationService.createCommentNotification(
                    'comment_mention',
                    newComment.Id,
                    commentData.taskId,
                    `Task #${commentData.taskId}`,
                    `${commentData.authorName || 'Current User'} mentioned you in a comment`,
                    mention.id,
                    commentData.authorName || 'Current User',
                    content.trim()
                  );
                }
              }
            }
          } catch (error) {
            console.warn('Failed to send comment notifications:', error.message);
          }
        }, 50);

        return {
          Id: newComment.Id,
          taskId: parseInt(commentData.taskId),
          parentId: commentData.parentId || null,
          topic: commentData.topic || null,
          content: content.trim(),
          contentType: commentData.contentType || "html",
          authorId: commentData.authorId || 1,
          authorName: commentData.authorName || "Current User",
          authorEmail: commentData.authorEmail || "",
          mentions: Array.isArray(commentData.mentions) ? commentData.mentions : [],
          reactions: [],
          likes: 0,
          likedBy: [],
          isPinned: false,
          isResolved: false,
          isEdited: false,
          editHistory: [],
          isUnread: false,
          quotedCommentId: commentData.quotedCommentId || null,
          editWindowMinutes: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    }
  } catch (error) {
    console.error("Error creating comment:", error);
    showToast.error(error.message || 'Failed to create comment');
    throw error;
  }
};

// Update an existing comment
export const updateComment = async (id, updates) => {
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error("ApperClient not initialized");
    }

    // Get current comment to check edit window
    const currentComment = await getCommentById(id);
    if (!currentComment) {
      throw new Error('Comment not found');
    }

    // Check if edit window is still open
    const editWindowMinutes = currentComment.editWindowMinutes || 5;
    const createdAt = new Date(currentComment.createdAt);
    const now = new Date();
    const minutesSinceCreation = (now - createdAt) / (1000 * 60);
    
    if (minutesSinceCreation > editWindowMinutes) {
      throw new Error(`Edit window has expired. Comments can only be edited within ${editWindowMinutes} minutes of posting.`);
    }

    const params = {
      records: [{
        Id: parseInt(id),
        content_c: updates.content || currentComment.content,
        is_edited_c: updates.content ? true : currentComment.isEdited,
        topic_c: updates.topic !== undefined ? updates.topic : currentComment.topic
      }]
    };

    const response = await apperClient.updateRecord('comment_c', params);

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message || 'Failed to update comment');
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to update ${failed.length} comments:`, failed);
        failed.forEach(record => {
          if (record.message) showToast.error(record.message);
        });
      }
      
      if (successful.length > 0) {
        showToast.success('Comment updated successfully!');
        return {
          ...currentComment,
          ...updates,
          isEdited: updates.content ? true : currentComment.isEdited,
          updatedAt: new Date().toISOString()
        };
      }
    }
  } catch (error) {
    console.error("Error updating comment:", error);
    showToast.error(error.message || 'Failed to update comment');
    throw error;
  }
};

// Delete a comment
export const deleteComment = async (id) => {
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error("ApperClient not initialized");
    }

    const response = await apperClient.deleteRecord('comment_c', {
      RecordIds: [parseInt(id)]
    });

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message || 'Failed to delete comment');
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to delete ${failed.length} comments:`, failed);
        failed.forEach(record => {
          if (record.message) showToast.error(record.message);
        });
      }
      
      if (successful.length > 0) {
        showToast.success('Comment deleted successfully!');
        return true;
      }
    }
  } catch (error) {
    console.error("Error deleting comment:", error);
    showToast.error(error.message || 'Failed to delete comment');
    throw error;
  }
};

// Get team members for mentions
export const getTeamMembers = async () => {
  // In a real app, this would fetch from user management
  return mockTeamMembers;
};

// Helper function to check if comment is still editable
export const isCommentEditable = (comment, currentUserId = 1) => {
  if (!comment || comment.authorId !== currentUserId) {
    const author = getUserById(comment.authorId);
    return { canEdit: false, reason: `Not your comment (authored by ${author.name})` };
  }
  
  const editWindowMinutes = comment.editWindowMinutes || 5;
  const createdAt = new Date(comment.createdAt);
  const now = new Date();
  const minutesSinceCreation = (now - createdAt) / (1000 * 60);
  const remainingMinutes = Math.max(0, editWindowMinutes - minutesSinceCreation);
  
  return {
    canEdit: minutesSinceCreation <= editWindowMinutes,
    remainingMinutes: Math.ceil(remainingMinutes),
    remainingSeconds: Math.ceil((remainingMinutes * 60) % 60)
  };
};

// Build threaded comment structure
export const buildCommentThreads = (comments) => {
  const commentMap = {};
  const topicGroups = {};

  // First pass: create comment map and group by topic
  comments.forEach(comment => {
    commentMap[comment.Id] = { ...comment, replies: [], replyCount: 0 };
    
    const topic = comment.topic || 'General';
    if (!topicGroups[topic]) {
      topicGroups[topic] = [];
    }
  });

  // Second pass: build threads within topics and count replies
  comments.forEach(comment => {
    const topic = comment.topic || 'General';
    
    if (comment.parentId && commentMap[comment.parentId]) {
      commentMap[comment.parentId].replies.push(commentMap[comment.Id]);
      // Update reply count for parent
      commentMap[comment.parentId].replyCount = commentMap[comment.parentId].replies.length;
    } else {
      topicGroups[topic].push(commentMap[comment.Id]);
    }
  });

  // Third pass: recursively count all nested replies
  const countAllReplies = (comment) => {
    let totalReplies = comment.replies.length;
    comment.replies.forEach(reply => {
      totalReplies += countAllReplies(reply);
    });
    comment.totalReplyCount = totalReplies;
    return totalReplies;
  };

  // Apply recursive counting to all root comments
  Object.keys(topicGroups).forEach(topic => {
    topicGroups[topic].forEach(comment => {
      countAllReplies(comment);
    });
  });

  // Sort threads within each topic: pinned first, then by creation date
  Object.keys(topicGroups).forEach(topic => {
    topicGroups[topic].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  });

  // Return flattened structure with topic headers
  const result = [];
  Object.keys(topicGroups).sort().forEach(topic => {
    if (topicGroups[topic].length > 0) {
      result.push({
        Id: `topic-${topic}`,
        type: 'topic-header',
        topic: topic,
        commentCount: topicGroups[topic].length,
        comments: topicGroups[topic]
      });
      result.push(...topicGroups[topic]);
    }
  });

  return result;
};

// Export default object for compatibility
const commentService = {
  getCommentsByTaskId,
  createComment,
  updateComment,
  deleteComment,
  getCommentById,
  getCommentTopics,
  getTeamMembers,
  buildCommentThreads,
  isCommentEditable
};

export default commentService;
import { getApperClient } from "@/services/apperClient";
import { showToast } from "@/utils/toast";

export const taskService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('task_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "due_date_time_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "completed_at_c"}},
          {"field": {"Name": "is_recurring_c"}},
          {"field": {"Name": "recurrence_c"}},
          {"field": {"Name": "reminders_c"}},
          {"field": {"Name": "estimated_time_c"}},
          {"field": {"Name": "actual_time_c"}},
          {"field": {"Name": "time_spent_c"}},
          {"field": {"Name": "is_tracking_c"}},
          {"field": {"Name": "tracking_started_at_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "linked_tasks_c"}},
          {"field": {"Name": "external_links_c"}},
          {"field": {"Name": "comment_count_c"}},
          {"field": {"Name": "has_unread_comments_c"}},
          {"field": {"Name": "last_comment_at_c"}},
          {"field": {"Name": "is_followup_c"}},
          {"field": {"Name": "has_followup_c"}},
          {"field": {"Name": "followup_task_id_c"}},
          {"field": {"Name": "subtask_progress_c"}},
          {"field": {"Name": "subtask_count_c"}},
          {"field": {"Name": "completed_subtasks_c"}},
          {"field": {"Name": "project_id_c"}},
          {"field": {"Name": "parent_task_id_c"}},
          {"field": {"Name": "assigned_to_c"}},
          {"field": {"Name": "attachments_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "ModifiedOn", "sorttype": "DESC"}]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(task => this.mapTaskFromDatabase(task));
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.getRecordById('task_c', id, {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "due_date_time_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "completed_at_c"}},
          {"field": {"Name": "project_id_c"}},
          {"field": {"Name": "parent_task_id_c"}},
          {"field": {"Name": "assigned_to_c"}},
          {"field": {"Name": "attachments_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      });

      if (!response.success || !response.data) {
        throw new Error(`Task with Id ${id} not found`);
      }

      return this.mapTaskFromDatabase(response.data);
    } catch (error) {
      console.error("Error fetching task:", error);
      throw error;
    }
  },

  async create(taskData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Process file attachments if present
      let processedAttachments = null;
      if (taskData.attachments && Array.isArray(taskData.attachments)) {
        if (window.ApperSDK?.ApperFileUploader) {
          processedAttachments = window.ApperSDK.ApperFileUploader.toCreateFormat(taskData.attachments);
        } else {
          processedAttachments = taskData.attachments;
        }
      }

      const params = {
        records: [{
          Name: taskData.title || "",
          title_c: taskData.title || "",
          description_c: taskData.description || "",
          category_c: taskData.category || "Personal",
          priority_c: taskData.priority || "Medium",
          status_c: taskData.status || "Not Started",
          due_date_c: taskData.dueDate || null,
          due_date_time_c: taskData.dueDateTime || null,
          completed_c: taskData.status === "Completed" || false,
          completed_at_c: taskData.status === "Completed" ? new Date().toISOString() : null,
          is_recurring_c: taskData.isRecurring || false,
          recurrence_c: taskData.recurrence ? JSON.stringify(taskData.recurrence) : null,
          reminders_c: taskData.reminders ? JSON.stringify(taskData.reminders) : null,
          estimated_time_c: taskData.estimatedTime || null,
          actual_time_c: taskData.actualTime || 0,
          time_spent_c: taskData.timeSpent || 0,
          is_tracking_c: false,
          tracking_started_at_c: null,
          notes_c: taskData.notes || "",
          linked_tasks_c: taskData.linkedTasks ? JSON.stringify(taskData.linkedTasks) : null,
          external_links_c: taskData.externalLinks ? JSON.stringify(taskData.externalLinks) : null,
          comment_count_c: 0,
          has_unread_comments_c: false,
          last_comment_at_c: null,
          is_followup_c: taskData.isFollowup || false,
          has_followup_c: false,
          followup_task_id_c: null,
          subtask_progress_c: 0,
          subtask_count_c: 0,
          completed_subtasks_c: 0,
          project_id_c: taskData.projectId || null,
          parent_task_id_c: taskData.parentTaskId || null,
          assigned_to_c: taskData.assignedTo || null,
          attachments_c: processedAttachments
        }]
      };

      const response = await apperClient.createRecord('task_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || 'Failed to create task');
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} tasks:`, failed);
          failed.forEach(record => {
            if (record.message) showToast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const newTask = successful[0].data;
          showToast.success('Task created successfully! 🎉');
          
          return {
            Id: newTask.Id,
            projectId: taskData.projectId || null,
            title: taskData.title || "",
            description: taskData.description || "",
            category: taskData.category || "Personal",
            priority: taskData.priority || "Medium",
            status: taskData.status || "Not Started",
            dueDate: taskData.dueDate || null,
            dueDateTime: taskData.dueDateTime || null,
            parentTaskId: taskData.parentTaskId || null,
            tags: taskData.tags || [],
            completed: taskData.status === "Completed" || false,
            completedAt: taskData.status === "Completed" ? new Date().toISOString() : null,
            isRecurring: taskData.isRecurring || false,
            recurrence: taskData.recurrence || null,
            assignedTo: taskData.assignedTo || null,
            reminders: taskData.reminders || [],
            estimatedTime: taskData.estimatedTime || null,
            actualTime: taskData.actualTime || 0,
            timeSpent: taskData.timeSpent || 0,
            isTracking: false,
            trackingStartedAt: null,
            notes: taskData.notes || "",
            attachments: taskData.attachments || [],
            linkedTasks: taskData.linkedTasks || [],
            externalLinks: taskData.externalLinks || [],
            commentCount: 0,
            hasUnreadComments: false,
            lastCommentAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
      }
    } catch (error) {
      console.error("Error creating task:", error);
      showToast.error(error.message || 'Failed to create task');
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const updateData = {
        Id: parseInt(id)
      };

      // Map updates to database fields
      if (updates.title !== undefined) {
        updateData.Name = updates.title;
        updateData.title_c = updates.title;
      }
      if (updates.description !== undefined) updateData.description_c = updates.description;
      if (updates.category !== undefined) updateData.category_c = updates.category;
      if (updates.priority !== undefined) updateData.priority_c = updates.priority;
      if (updates.status !== undefined) {
        updateData.status_c = updates.status;
        updateData.completed_c = updates.status === "Completed";
        updateData.completed_at_c = updates.status === "Completed" ? new Date().toISOString() : null;
      }
      if (updates.completed !== undefined) {
        updateData.completed_c = updates.completed;
        updateData.status_c = updates.completed ? "Completed" : "Not Started";
        updateData.completed_at_c = updates.completed ? new Date().toISOString() : null;
      }
      if (updates.dueDate !== undefined) updateData.due_date_c = updates.dueDate;
      if (updates.dueDateTime !== undefined) updateData.due_date_time_c = updates.dueDateTime;
      if (updates.isRecurring !== undefined) updateData.is_recurring_c = updates.isRecurring;
      if (updates.recurrence !== undefined) updateData.recurrence_c = updates.recurrence ? JSON.stringify(updates.recurrence) : null;
      if (updates.assignedTo !== undefined) updateData.assigned_to_c = updates.assignedTo;
      if (updates.reminders !== undefined) updateData.reminders_c = updates.reminders ? JSON.stringify(updates.reminders) : null;
      if (updates.estimatedTime !== undefined) updateData.estimated_time_c = updates.estimatedTime;
      if (updates.actualTime !== undefined) updateData.actual_time_c = updates.actualTime;
      if (updates.timeSpent !== undefined) updateData.time_spent_c = updates.timeSpent;
      if (updates.isTracking !== undefined) updateData.is_tracking_c = updates.isTracking;
      if (updates.trackingStartedAt !== undefined) updateData.tracking_started_at_c = updates.trackingStartedAt;
      if (updates.notes !== undefined) updateData.notes_c = updates.notes;
      if (updates.linkedTasks !== undefined) updateData.linked_tasks_c = updates.linkedTasks ? JSON.stringify(updates.linkedTasks) : null;
      if (updates.externalLinks !== undefined) updateData.external_links_c = updates.externalLinks ? JSON.stringify(updates.externalLinks) : null;
      if (updates.commentCount !== undefined) updateData.comment_count_c = updates.commentCount;
      if (updates.hasUnreadComments !== undefined) updateData.has_unread_comments_c = updates.hasUnreadComments;
      if (updates.lastCommentAt !== undefined) updateData.last_comment_at_c = updates.lastCommentAt;
      if (updates.projectId !== undefined) updateData.project_id_c = updates.projectId;
      if (updates.parentTaskId !== undefined) updateData.parent_task_id_c = updates.parentTaskId;
      
      // Handle attachments with file upload processing
      if (updates.attachments !== undefined) {
        let processedAttachments = null;
        if (Array.isArray(updates.attachments) && updates.attachments.length > 0) {
          if (window.ApperSDK?.ApperFileUploader) {
            processedAttachments = window.ApperSDK.ApperFileUploader.toCreateFormat(updates.attachments);
          } else {
            processedAttachments = updates.attachments;
          }
        }
        updateData.attachments_c = processedAttachments;
      }

      const params = {
        records: [updateData]
      };

      const response = await apperClient.updateRecord('task_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || 'Failed to update task');
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} tasks:`, failed);
          failed.forEach(record => {
            if (record.message) showToast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          showToast.success('Task updated successfully!');
          return await this.getById(id);
        }
      }
    } catch (error) {
      console.error("Error updating task:", error);
      showToast.error(error.message || 'Failed to update task');
      throw error;
    }
  },

  // Get subtasks for a parent task
  async getSubtasks(parentTaskId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('task_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "parent_task_id_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        where: [{
          "FieldName": "parent_task_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(parentTaskId)]
        }],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(task => this.mapTaskFromDatabase(task));
    } catch (error) {
      console.error("Error fetching subtasks:", error);
      return [];
    }
  },

  // Create a subtask
  async createSubtask(parentTaskId, subtaskData) {
    const parentTask = await this.getById(parentTaskId);
    if (!parentTask) {
      throw new Error(`Parent task with Id ${parentTaskId} not found`);
    }
    
    const subtask = await this.create({
      ...subtaskData,
      parentTaskId: parseInt(parentTaskId),
      category: subtaskData.category || parentTask.category,
      priority: subtaskData.priority || parentTask.priority
    });
    
    // Update parent task progress
    await this.updateParentTaskProgress(parseInt(parentTaskId));
    
    return subtask;
  },

  // Update parent task progress based on subtasks
  async updateParentTaskProgress(parentTaskId) {
    try {
      const subtasks = await this.getSubtasks(parentTaskId);
      if (subtasks.length === 0) return;
      
      const completedSubtasks = subtasks.filter(task => task.completed).length;
      const progressPercentage = Math.round((completedSubtasks / subtasks.length) * 100);
      
      const updateData = {
        subtask_progress_c: progressPercentage,
        subtask_count_c: subtasks.length,
        completed_subtasks_c: completedSubtasks
      };
      
      // Auto-complete parent if all subtasks are done
      if (completedSubtasks === subtasks.length && subtasks.length > 0) {
        updateData.completed_c = true;
        updateData.completed_at_c = new Date().toISOString();
        updateData.status_c = "Completed";
      } else if (completedSubtasks < subtasks.length) {
        // Uncheck parent if not all subtasks are complete
        const parentTask = await this.getById(parentTaskId);
        if (parentTask.completed) {
          updateData.completed_c = false;
          updateData.completed_at_c = null;
          updateData.status_c = "In Progress";
        }
      }
      
      await this.update(parentTaskId, updateData);
    } catch (error) {
      console.error("Error updating parent task progress:", error);
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.deleteRecord('task_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || 'Failed to delete task');
      }

      showToast.success('Task deleted successfully!');
      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
      showToast.error(error.message || 'Failed to delete task');
      throw error;
    }
  },

  // Helper method to map database task to application format
  mapTaskFromDatabase(task) {
    return {
      Id: task.Id,
      projectId: task.project_id_c?.Id || task.project_id_c,
      title: task.title_c || task.Name || "",
      description: task.description_c || "",
      category: task.category_c || "Personal",
      priority: task.priority_c || "Medium",
      status: task.status_c || "Not Started",
      dueDate: task.due_date_c,
      dueDateTime: task.due_date_time_c,
      parentTaskId: task.parent_task_id_c?.Id || task.parent_task_id_c,
      tags: [], // Tags would need to be handled separately
      completed: task.completed_c || false,
      completedAt: task.completed_at_c,
      isRecurring: task.is_recurring_c || false,
      recurrence: task.recurrence_c ? this.parseJSON(task.recurrence_c) : null,
      assignedTo: task.assigned_to_c?.Name || task.assigned_to_c,
      reminders: task.reminders_c ? this.parseJSON(task.reminders_c) : [],
      estimatedTime: task.estimated_time_c,
      actualTime: task.actual_time_c || 0,
      timeSpent: task.time_spent_c || 0,
      isTracking: task.is_tracking_c || false,
      trackingStartedAt: task.tracking_started_at_c,
      notes: task.notes_c || "",
      attachments: task.attachments_c ? this.parseAttachments(task.attachments_c) : [],
      linkedTasks: task.linked_tasks_c ? this.parseJSON(task.linked_tasks_c) : [],
      externalLinks: task.external_links_c ? this.parseJSON(task.external_links_c) : [],
      commentCount: task.comment_count_c || 0,
      hasUnreadComments: task.has_unread_comments_c || false,
      lastCommentAt: task.last_comment_at_c,
      isFollowup: task.is_followup_c || false,
      hasFollowup: task.has_followup_c || false,
      followupTaskId: task.followup_task_id_c,
      subtaskProgress: task.subtask_progress_c || 0,
      subtaskCount: task.subtask_count_c || 0,
      completedSubtasks: task.completed_subtasks_c || 0,
      createdAt: task.CreatedOn,
      updatedAt: task.ModifiedOn
    };
  },

  // Helper method to safely parse JSON
  parseJSON(jsonString) {
    if (!jsonString) return null;
    try {
      return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    } catch {
      return null;
    }
  },

  // Helper method to parse attachments
  parseAttachments(attachmentsData) {
    if (!attachmentsData) return [];
    
    if (Array.isArray(attachmentsData)) {
      return attachmentsData;
    }
    
    if (typeof attachmentsData === 'string') {
      try {
        return JSON.parse(attachmentsData);
      } catch {
        return [];
      }
    }
    
    return [];
  }
};

// Update comment statistics for a task
export const updateTaskCommentStats = async (taskId, commentCount, hasUnread = false, lastCommentAt = null) => {
  try {
    await taskService.update(taskId, {
      commentCount: commentCount || 0,
      hasUnreadComments: hasUnread,
      lastCommentAt: lastCommentAt
    });
  } catch (error) {
    console.error('Error updating task comment stats:', error);
  }
};
// Service is ready to use - no initialization required
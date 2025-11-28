import React from "react";
import { getApperClient } from "@/services/apperClient";
import { create, getAll, getById, parseJSON, update } from "@/services/api/recurringTaskService";
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
reminders_c: taskData.reminders ? this.formatRemindersForDatabase(taskData.reminders) : null,
          estimated_time_c: taskData.estimatedTime || null,
          actual_time_c: taskData.actualTime || 0,
          time_spent_c: taskData.timeSpent || 0,
          is_tracking_c: false,
          tracking_started_at_c: null,
          notes_c: taskData.notes || "",
linked_tasks_c: taskData.linkedTasks ? this.formatLinkedTasksForDatabase(taskData.linkedTasks) : null,
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
          
          // Handle recurring task creation separately
// Recurring tasks are now created separately via RecurringTaskService
          // This decouples main task creation from recurring task creation
          
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
if (updates.reminders !== undefined) updateData.reminders_c = updates.reminders ? this.formatRemindersForDatabase(updates.reminders) : null;
      if (updates.estimatedTime !== undefined) updateData.estimated_time_c = updates.estimatedTime;
      if (updates.actualTime !== undefined) updateData.actual_time_c = updates.actualTime;
      if (updates.timeSpent !== undefined) updateData.time_spent_c = updates.timeSpent;
      if (updates.isTracking !== undefined) updateData.is_tracking_c = updates.isTracking;
      if (updates.trackingStartedAt !== undefined) updateData.tracking_started_at_c = updates.trackingStartedAt;
      if (updates.notes !== undefined) updateData.notes_c = updates.notes;
if (updates.linkedTasks !== undefined) updateData.linked_tasks_c = updates.linkedTasks ? this.formatLinkedTasksForDatabase(updates.linkedTasks) : null;
      if (updates.externalLinks !== undefined) updateData.external_links_c = updates.externalLinks ? JSON.stringify(updates.externalLinks) : null;
      if (updates.commentCount !== undefined) updateData.comment_count_c = updates.commentCount;
      if (updates.hasUnreadComments !== undefined) updateData.has_unread_comments_c = updates.hasUnreadComments;
      if (updates.lastCommentAt !== undefined) updateData.last_comment_at_c = updates.lastCommentAt;
      if (updates.projectId !== undefined) updateData.project_id_c = updates.projectId;
if (updates.parentTaskId !== undefined) updateData.parent_task_id_c = updates.parentTaskId;

      // Handle recurring task updates
// Recurring task management is now handled separately via RecurringTaskService
      // UI components make explicit calls for recurring task operations
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
      reminders: task.reminders_c ? this.parseRemindersFromDatabase(task.reminders_c) : [],
      estimatedTime: task.estimated_time_c,
      actualTime: task.actual_time_c || 0,
      timeSpent: task.time_spent_c || 0,
      isTracking: task.is_tracking_c || false,
      trackingStartedAt: task.tracking_started_at_c,
      notes: task.notes_c || "",
      attachments: task.attachments_c ? this.parseAttachments(task.attachments_c) : [],
linkedTasks: task.linked_tasks_c ? this.parseLinkedTasksFromDatabase(task.linked_tasks_c) : [],
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
  },

  // Helper method to format reminders for MultiPicklist field
  formatRemindersForDatabase(reminders) {
    if (!Array.isArray(reminders)) return null;
    
    // Convert reminders array to comma-separated string format
    // MultiPicklist expects: "enabled,minutes,type" format
    const reminderStrings = reminders
      .filter(reminder => reminder.enabled)
      .map(reminder => {
        if (reminder.type === 'custom') {
          return `${reminder.type},${reminder.minutes || 60}`;
        }
        return reminder.type;
      });
    
    return reminderStrings.length > 0 ? reminderStrings.join(',') : null;
  },

  // Helper method to format linked tasks for MultiPicklist field
  formatLinkedTasksForDatabase(linkedTasks) {
    if (!Array.isArray(linkedTasks)) return null;
    
    // Convert linked tasks array to comma-separated string format
    // MultiPicklist expects: "id,title,type" format
    const linkedTaskStrings = linkedTasks.map(task => {
      return `${task.Id || task.id},${task.title},${task.type || 'related'}`;
    });
    
    return linkedTaskStrings.length > 0 ? linkedTaskStrings.join(',') : null;
  },

  // Helper method to parse reminders from database format
  parseRemindersFromDatabase(remindersString) {
    if (!remindersString) return [];
    
    try {
      // If it's already an array (from previous JSON format), return it
      if (Array.isArray(remindersString)) return remindersString;
      
      // If it's JSON string (legacy format), parse it
      if (remindersString.startsWith('[') || remindersString.startsWith('{')) {
        return JSON.parse(remindersString);
      }
      
      // Parse comma-separated format from MultiPicklist
      const reminderTypes = remindersString.split(',');
      const defaultReminders = [
        { type: "on_due", enabled: false },
        { type: "1_day_before", enabled: false },
        { type: "1_hour_before", enabled: false },
        { type: "custom", enabled: false, minutes: 60 }
      ];
      
      return defaultReminders.map(reminder => {
        const isEnabled = reminderTypes.includes(reminder.type);
        if (reminder.type === 'custom' && isEnabled) {
          const customIndex = reminderTypes.indexOf('custom');
          const minutes = customIndex !== -1 && reminderTypes[customIndex + 1] 
            ? parseInt(reminderTypes[customIndex + 1]) || 60 
            : 60;
          return { ...reminder, enabled: true, minutes };
        }
        return { ...reminder, enabled: isEnabled };
      });
    } catch {
      return [];
    }
  },

  // Helper method to parse linked tasks from database format
  parseLinkedTasksFromDatabase(linkedTasksString) {
    if (!linkedTasksString) return [];
    
    try {
      // If it's already an array (from previous JSON format), return it
      if (Array.isArray(linkedTasksString)) return linkedTasksString;
      
      // If it's JSON string (legacy format), parse it
      if (linkedTasksString.startsWith('[') || linkedTasksString.startsWith('{')) {
        return JSON.parse(linkedTasksString);
      }
      
      // Parse comma-separated format from MultiPicklist
      const parts = linkedTasksString.split(',');
      const linkedTasks = [];
      
      // Process in groups of 3 (id,title,type)
      for (let i = 0; i < parts.length; i += 3) {
        if (i + 2 < parts.length) {
          linkedTasks.push({
            Id: parseInt(parts[i]) || parts[i],
            title: parts[i + 1],
            type: parts[i + 2] || 'related'
          });
        }
      }
      
      return linkedTasks;
} catch {
      return [];
    }
  },

  // Template-related methods
  async getTaskTemplates() {
    try {

const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('task_template_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "estimated_time_c"}},
          {"field": {"Name": "tags_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "is_public_c"}},
          {"field": {"Name": "created_by_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(template => ({
        Id: template.Id,
        name: template.Name || template.title_c || "",
        title: template.title_c || template.Name || "",
        description: template.description_c || "",
        category: template.category_c || "Personal",
        priority: template.priority_c || "Medium",
        estimatedTime: template.estimated_time_c || null,
        tags: template.tags_c ? template.tags_c.split(',').map(t => t.trim()) : [],
        icon: template.icon_c || "📋",
        isPublic: template.is_public_c || false,
        createdBy: template.created_by_c || null,
        createdAt: template.CreatedOn,
        updatedAt: template.ModifiedOn
      }));
    } catch (error) {
      console.error("Error fetching task templates:", error);
      return [];
    }
  },

  async getTemplateCategories() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('task_template_c', {
        fields: [{"field": {"Name": "category_c"}}],
        groupBy: ["category_c"]
      });

      if (!response.success) {
        console.error(response.message);
        return ["Personal", "Work", "Project", "Meeting", "Other"];
      }

      const categories = response.data
        .map(item => item.category_c)
        .filter(category => category && category.trim() !== "")
        .filter((category, index, array) => array.indexOf(category) === index);

      return categories.length > 0 ? categories : ["Personal", "Work", "Project", "Meeting", "Other"];
    } catch (error) {
      console.error("Error fetching template categories:", error);
      return ["Personal", "Work", "Project", "Meeting", "Other"];
    }
  },

  async createTemplate(templateData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Name: templateData.name || templateData.title || "",
          title_c: templateData.title || templateData.name || "",
          description_c: templateData.description || "",
          category_c: templateData.category || "Personal",
          priority_c: templateData.priority || "Medium",
          estimated_time_c: templateData.estimatedTime || null,
          tags_c: Array.isArray(templateData.tags) ? templateData.tags.join(', ') : templateData.tags || "",
          icon_c: templateData.icon || "📋",
          is_public_c: templateData.isPublic || false,
          created_by_c: templateData.createdBy || null
        }]
      };

      const response = await apperClient.createRecord('task_template_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || 'Failed to create template');
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} templates:`, failed);
          failed.forEach(record => {
            if (record.message) showToast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const newTemplate = successful[0].data;
          showToast.success('Template created successfully! 🎉');
          
          return {
            Id: newTemplate.Id,
            name: templateData.name || templateData.title || "",
            title: templateData.title || templateData.name || "",
            description: templateData.description || "",
            category: templateData.category || "Personal",
            priority: templateData.priority || "Medium",
            estimatedTime: templateData.estimatedTime || null,
            tags: Array.isArray(templateData.tags) ? templateData.tags : (templateData.tags ? templateData.tags.split(',').map(t => t.trim()) : []),
            icon: templateData.icon || "📋",
            isPublic: templateData.isPublic || false,
            createdBy: templateData.createdBy || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
      }
    } catch (error) {
      console.error("Error creating template:", error);
      showToast.error(error.message || 'Failed to create template');
      throw error;
    }
  },

  async deleteTemplate(templateId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.deleteRecord('task_template_c', {
        RecordIds: [parseInt(templateId)]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || 'Failed to delete template');
      }

      showToast.success('Template deleted successfully!');
      return true;
    } catch (error) {
      console.error("Error deleting template:", error);
      showToast.error(error.message || 'Failed to delete template');
      throw error;
    }
  },

  async exportTemplates() {
    try {
      const templates = await this.getTemplates();
      
      const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        templates: templates.map(template => ({
          name: template.name,
          title: template.title,
          description: template.description,
          category: template.category,
          priority: template.priority,
          estimatedTime: template.estimatedTime,
          tags: template.tags,
          icon: template.icon,
          isPublic: template.isPublic
        }))
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `task-templates-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast.success('Templates exported successfully!');
      return exportData;
    } catch (error) {
      console.error("Error exporting templates:", error);
      showToast.error('Failed to export templates');
      throw error;
    }
  },

  async importTemplates(importData) {
    try {
      if (!importData || !importData.templates || !Array.isArray(importData.templates)) {
        throw new Error('Invalid import data format');
      }

      let successCount = 0;
      let errorCount = 0;

      for (const templateData of importData.templates) {
        try {
          await this.createTemplate({
            ...templateData,
            createdBy: null // Reset creator for imported templates
          });
          successCount++;
        } catch (error) {
          console.error("Error importing template:", templateData.name, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        showToast.success(`Successfully imported ${successCount} templates!`);
      }
      
      if (errorCount > 0) {
        showToast.error(`Failed to import ${errorCount} templates`);
      }

      return {
        imported: successCount,
        failed: errorCount,
        total: importData.templates.length
      };
    } catch (error) {
      console.error("Error importing templates:", error);
      showToast.error(error.message || 'Failed to import templates');
      throw error;
    }
},

  // Alias method for backward compatibility
  async getTemplates() {
    return await this.getTaskTemplates();
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
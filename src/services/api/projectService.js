import { getApperClient } from "@/services/apperClient";
import { showToast } from "@/utils/toast";

const projectService = {
  // Get all projects
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('project_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "start_date_c"}},
          {"field": {"Name": "end_date_c"}},
          {"field": {"Name": "is_favorite_c"}},
          {"field": {"Name": "is_archived_c"}},
          {"field": {"Name": "archived_at_c"}},
          {"field": {"Name": "archived_by_c"}},
          {"field": {"Name": "members_c"}},
          {"field": {"Name": "settings_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "ModifiedOn", "sorttype": "DESC"}]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(project => ({
        Id: project.Id,
        name: project.Name,
        description: project.description_c || "",
        color: project.color_c || "#3b82f6",
        icon: project.icon_c || "📁",
        status: project.status_c || "Active",
        startDate: project.start_date_c,
        endDate: project.end_date_c,
        isFavorite: project.is_favorite_c || false,
        isArchived: project.is_archived_c || false,
        archivedAt: project.archived_at_c,
        archivedBy: project.archived_by_c,
        members: this.parseMembers(project.members_c),
        settings: this.parseSettings(project.settings_c),
        createdAt: project.CreatedOn,
        updatedAt: project.ModifiedOn,
        fileSettings: {
          allowedFileTypes: ['image/*', 'application/pdf', 'text/*', '.doc', '.docx', '.xls', '.xlsx'],
          maxFileSize: 10 * 1024 * 1024,
          maxFilesPerTask: 10,
          enableVersioning: true,
          autoArchiveOldVersions: false
        }
      }));
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  },

  // Get project by ID
  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.getRecordById('project_c', id, {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "start_date_c"}},
          {"field": {"Name": "end_date_c"}},
          {"field": {"Name": "is_favorite_c"}},
          {"field": {"Name": "is_archived_c"}},
          {"field": {"Name": "archived_at_c"}},
          {"field": {"Name": "archived_by_c"}},
          {"field": {"Name": "members_c"}},
          {"field": {"Name": "settings_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      });

      if (!response.success || !response.data) {
        throw new Error('Project not found');
      }

      const project = response.data;
      return {
        Id: project.Id,
        name: project.Name,
        description: project.description_c || "",
        color: project.color_c || "#3b82f6",
        icon: project.icon_c || "📁",
        status: project.status_c || "Active",
        startDate: project.start_date_c,
        endDate: project.end_date_c,
        isFavorite: project.is_favorite_c || false,
        isArchived: project.is_archived_c || false,
        archivedAt: project.archived_at_c,
        archivedBy: project.archived_by_c,
        members: this.parseMembers(project.members_c),
        settings: this.parseSettings(project.settings_c),
        createdAt: project.CreatedOn,
        updatedAt: project.ModifiedOn,
        fileSettings: {
          allowedFileTypes: ['image/*', 'application/pdf', 'text/*', '.doc', '.docx', '.xls', '.xlsx'],
          maxFileSize: 10 * 1024 * 1024,
          maxFilesPerTask: 10,
          enableVersioning: true,
          autoArchiveOldVersions: false
        }
      };
    } catch (error) {
      console.error("Error fetching project:", error);
      throw error;
    }
  },

  // Create new project
  async create(projectData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Name: projectData.name || "",
          description_c: projectData.description || "",
          color_c: projectData.color || "#3b82f6",
          icon_c: projectData.icon || "📁",
          status_c: projectData.status || "Active",
          start_date_c: projectData.startDate || null,
          end_date_c: projectData.endDate || null,
          is_favorite_c: false,
          is_archived_c: false,
          members_c: projectData.members ? JSON.stringify(projectData.members) : "",
          settings_c: projectData.settings ? JSON.stringify({
            isPublic: projectData.settings.isPublic || false,
            allowMemberInvites: projectData.settings.allowMemberInvites || true,
            requireApproval: projectData.settings.requireApproval || false,
            ...projectData.settings
          }) : ""
        }]
      };

      const response = await apperClient.createRecord('project_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || 'Failed to create project');
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} projects:`, failed);
          failed.forEach(record => {
            if (record.message) showToast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const newProject = successful[0].data;
          showToast.success('Project created successfully!');
          return {
            Id: newProject.Id,
            name: projectData.name || "",
            description: projectData.description || "",
            color: projectData.color || "#3b82f6",
            icon: projectData.icon || "📁",
            status: projectData.status || "Active",
            startDate: projectData.startDate,
            endDate: projectData.endDate,
            isFavorite: false,
            isArchived: false,
            members: projectData.members || [],
            settings: {
              isPublic: projectData.settings?.isPublic || false,
              allowMemberInvites: projectData.settings?.allowMemberInvites || true,
              requireApproval: projectData.settings?.requireApproval || false,
              ...projectData.settings
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            fileSettings: {
              allowedFileTypes: ['image/*', 'application/pdf', 'text/*', '.doc', '.docx', '.xls', '.xlsx'],
              maxFileSize: 10 * 1024 * 1024,
              maxFilesPerTask: 10,
              enableVersioning: true,
              autoArchiveOldVersions: false
            }
          };
        }
      }
    } catch (error) {
      console.error("Error creating project:", error);
      showToast.error(error.message || 'Failed to create project');
      throw error;
    }
  },

  // Update project
  async update(id, data) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const updateData = {
        Id: parseInt(id)
      };

      if (data.name !== undefined) updateData.Name = data.name;
      if (data.description !== undefined) updateData.description_c = data.description;
      if (data.color !== undefined) updateData.color_c = data.color;
      if (data.icon !== undefined) updateData.icon_c = data.icon;
      if (data.status !== undefined) updateData.status_c = data.status;
      if (data.startDate !== undefined) updateData.start_date_c = data.startDate;
      if (data.endDate !== undefined) updateData.end_date_c = data.endDate;
      if (data.isFavorite !== undefined) updateData.is_favorite_c = data.isFavorite;
      if (data.isArchived !== undefined) updateData.is_archived_c = data.isArchived;
      if (data.archivedAt !== undefined) updateData.archived_at_c = data.archivedAt;
      if (data.archivedBy !== undefined) updateData.archived_by_c = data.archivedBy;
      if (data.members !== undefined) updateData.members_c = JSON.stringify(data.members);
      if (data.settings !== undefined) updateData.settings_c = JSON.stringify(data.settings);

      const params = {
        records: [updateData]
      };

      const response = await apperClient.updateRecord('project_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || 'Failed to update project');
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} projects:`, failed);
          failed.forEach(record => {
            if (record.message) showToast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          showToast.success('Project updated successfully!');
          return await this.getById(id);
        }
      }
    } catch (error) {
      console.error("Error updating project:", error);
      showToast.error(error.message || 'Failed to update project');
      throw error;
    }
  },

  // Toggle project favorite status
  async toggleFavorite(id) {
    try {
      const project = await this.getById(id);
      return await this.update(id, { isFavorite: !project.isFavorite });
    } catch (error) {
      console.error("Error toggling favorite:", error);
      throw error;
    }
  },

  // Archive project
  async archive(id) {
    try {
      const updateData = {
        status_c: 'Archived',
        is_archived_c: true,
        archived_at_c: new Date().toISOString(),
        archived_by_c: 'current-user'
      };
      
      return await this.update(id, updateData);
    } catch (error) {
      console.error("Error archiving project:", error);
      throw error;
    }
  },

  // Restore archived project
  async restore(id) {
    try {
      const updateData = {
        status_c: 'Active',
        is_archived_c: false,
        archived_at_c: null,
        archived_by_c: null
      };
      
      return await this.update(id, updateData);
    } catch (error) {
      console.error("Error restoring project:", error);
      throw error;
    }
  },

  // Delete project permanently
  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.deleteRecord('project_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || 'Failed to delete project');
      }

      showToast.success('Project deleted successfully!');
      return true;
    } catch (error) {
      console.error("Error deleting project:", error);
      showToast.error(error.message || 'Failed to delete project');
      throw error;
    }
  },

  // Get project statistics
  async getProjectStats(projectId) {
    try {
      // Import task service to get project tasks
      const { taskService } = await import('./taskService');
      const allTasks = await taskService.getAll();
      const projectTasks = allTasks.filter(task => task.projectId === parseInt(projectId));

      const stats = {
        totalTasks: projectTasks.length,
        completedTasks: projectTasks.filter(task => task.completed).length,
        activeTasks: projectTasks.filter(task => !task.completed).length,
        overdueTasks: projectTasks.filter(task => {
          if (!task.dueDate && !task.dueDateTime) return false;
          const dueDate = new Date(task.dueDate || task.dueDateTime);
          return !task.completed && dueDate < new Date();
        }).length,
        completionPercentage: projectTasks.length > 0 
          ? Math.round((projectTasks.filter(task => task.completed).length / projectTasks.length) * 100)
          : 0,
        priorityBreakdown: {
          High: projectTasks.filter(task => task.priority === 'High' && !task.completed).length,
          Medium: projectTasks.filter(task => task.priority === 'Medium' && !task.completed).length,
          Low: projectTasks.filter(task => task.priority === 'Low' && !task.completed).length
        }
      };

      return stats;
    } catch (error) {
      console.error("Error fetching project stats:", error);
      return {
        totalTasks: 0,
        completedTasks: 0,
        activeTasks: 0,
        overdueTasks: 0,
        completionPercentage: 0,
        priorityBreakdown: { High: 0, Medium: 0, Low: 0 }
      };
    }
  },

  // Helper method to parse members JSON
  parseMembers(membersJson) {
    if (!membersJson) return [];
    try {
      return typeof membersJson === 'string' ? JSON.parse(membersJson) : membersJson;
    } catch {
      return [];
    }
  },

  // Helper method to parse settings JSON
  parseSettings(settingsJson) {
    if (!settingsJson) return {
      isPublic: false,
      allowMemberInvites: true,
      requireApproval: false
    };
    try {
      return typeof settingsJson === 'string' ? JSON.parse(settingsJson) : settingsJson;
    } catch {
      return {
        isPublic: false,
        allowMemberInvites: true,
        requireApproval: false
      };
    }
  },

  // Add member to project
  async addMember(projectId, memberData) {
    try {
      const project = await this.getById(projectId);
      const currentMembers = project.members || [];
      
      const newMember = {
        Id: Date.now(),
        ...memberData,
        joinedAt: new Date().toISOString(),
        role: memberData.role || 'Member'
      };

      const updatedMembers = [...currentMembers, newMember];
      await this.update(projectId, { members: updatedMembers });
      
      return newMember;
    } catch (error) {
      console.error("Error adding member:", error);
      throw error;
    }
  },

  // Remove member from project
  async removeMember(projectId, memberId) {
    try {
      const project = await this.getById(projectId);
      const currentMembers = project.members || [];
      
      const updatedMembers = currentMembers.filter(m => m.Id !== parseInt(memberId));
      await this.update(projectId, { members: updatedMembers });
      
      return true;
    } catch (error) {
      console.error("Error removing member:", error);
      throw error;
    }
  },

  // Update member role
  async updateMemberRole(projectId, memberId, role) {
    try {
      const project = await this.getById(projectId);
      const currentMembers = project.members || [];
      
      const updatedMembers = currentMembers.map(m => 
        m.Id === parseInt(memberId) ? { ...m, role } : m
      );
      
      await this.update(projectId, { members: updatedMembers });
      
      const updatedMember = updatedMembers.find(m => m.Id === parseInt(memberId));
      return updatedMember;
    } catch (error) {
      console.error("Error updating member role:", error);
      throw error;
    }
  },

  // Get built-in project templates (preserved for compatibility)
  async getTemplates() {
    // Built-in project templates (same as before)
    const builtInTemplates = [
      {
        Id: -1,
        name: 'Software Development Project',
        description: 'Complete software development lifecycle with agile methodology',
        icon: '💻',
        color: '#3b82f6',
        category: 'Technology',
        isBuiltIn: true,
        isPublic: true,
        tags: [
          { Id: 1, name: 'development', color: '#3b82f6' },
          { Id: 2, name: 'agile', color: '#10b981' }
        ],
        defaults: {
          color: '#3b82f6',
          status: 'Active',
          settings: {
            isPublic: false,
            allowMemberInvites: true,
            requireApproval: false
          }
        },
        tasks: [
          { 
            title: 'Project Setup & Requirements Gathering', 
            priority: 'High', 
            category: 'Work',
            description: 'Set up development environment and gather detailed requirements',
            estimatedTime: 480
          },
          { 
            title: 'System Architecture & Design', 
            priority: 'High', 
            category: 'Work',
            description: 'Create system architecture diagrams and database design',
            estimatedTime: 360
          },
          { 
            title: 'Development Environment Setup', 
            priority: 'Medium', 
            category: 'Work',
            description: 'Configure development tools, CI/CD pipeline, and version control',
            estimatedTime: 240
          },
          { 
            title: 'Core Feature Development', 
            priority: 'High', 
            category: 'Work',
            description: 'Implement core application features and functionality',
            estimatedTime: 1200
          },
          { 
            title: 'Testing & Quality Assurance', 
            priority: 'High', 
            category: 'Work',
            description: 'Comprehensive testing including unit, integration, and end-to-end tests',
            estimatedTime: 480
          },
          { 
            title: 'Documentation & Deployment', 
            priority: 'Medium', 
            category: 'Work',
            description: 'Create user documentation and deploy to production environment',
            estimatedTime: 320
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        usageCount: 142
      }
      // Additional templates can be added here
    ];
    
    return builtInTemplates;
  },

  // Create project from template
  async createFromTemplate(templateId, projectData) {
    const templates = await this.getTemplates();
    const template = templates.find(t => t.Id === templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }

    const projectFromTemplate = {
      ...projectData,
      icon: projectData.icon || template.icon,
      color: projectData.color || template.color,
      defaultCategory: template.category || 'Work'
    };

    const project = await this.create(projectFromTemplate);

    // Create tasks if template has them
    if (template.tasks && template.tasks.length > 0) {
      const { taskService } = await import('./taskService');
      
      for (const taskTemplate of template.tasks) {
        await taskService.create({
          ...taskTemplate,
          projectId: project.Id
        });
      }
    }

    return project;
  }
};

export { projectService };
export { projectService }
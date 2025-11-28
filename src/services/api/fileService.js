import { getApperClient } from "@/services/apperClient";
import { showToast } from "@/utils/toast";

const fileService = {
  // File operations
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('file_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "original_name_c"}},
          {"field": {"Name": "size_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "url_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "version_c"}},
          {"field": {"Name": "folder_id_c"}},
          {"field": {"Name": "task_id_c"}},
          {"field": {"Name": "project_id_c"}},
          {"field": {"Name": "uploaded_at_c"}},
          {"field": {"Name": "uploaded_by_c"}},
          {"field": {"Name": "is_archived_c"}},
          {"field": {"Name": "file_content_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [{
          "FieldName": "is_archived_c",
          "Operator": "EqualTo",
          "Values": [false]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(file => this.mapFileFromDatabase(file));
    } catch (error) {
      console.error("Error fetching files:", error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.getRecordById('file_c', id, {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "original_name_c"}},
          {"field": {"Name": "size_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "url_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "version_c"}},
          {"field": {"Name": "folder_id_c"}},
          {"field": {"Name": "task_id_c"}},
          {"field": {"Name": "project_id_c"}},
          {"field": {"Name": "uploaded_at_c"}},
          {"field": {"Name": "uploaded_by_c"}},
          {"field": {"Name": "is_archived_c"}},
          {"field": {"Name": "file_content_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      });

      if (!response.success || !response.data) {
        throw new Error('File not found');
      }

      return this.mapFileFromDatabase(response.data);
    } catch (error) {
      console.error("Error fetching file:", error);
      throw error;
    }
  },

  async getByTaskId(taskId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('file_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "original_name_c"}},
          {"field": {"Name": "size_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "url_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "task_id_c"}},
          {"field": {"Name": "uploaded_at_c"}},
          {"field": {"Name": "is_archived_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        where: [
          {
            "FieldName": "task_id_c",
            "Operator": "EqualTo",
            "Values": [parseInt(taskId)]
          },
          {
            "FieldName": "is_archived_c",
            "Operator": "EqualTo",
            "Values": [false]
          }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(file => this.mapFileFromDatabase(file));
    } catch (error) {
      console.error("Error fetching files by task:", error);
      return [];
    }
  },

  async getByProjectId(projectId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('file_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "original_name_c"}},
          {"field": {"Name": "size_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "url_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "project_id_c"}},
          {"field": {"Name": "uploaded_at_c"}},
          {"field": {"Name": "is_archived_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        where: [
          {
            "FieldName": "project_id_c",
            "Operator": "EqualTo",
            "Values": [parseInt(projectId)]
          },
          {
            "FieldName": "is_archived_c",
            "Operator": "EqualTo",
            "Values": [false]
          }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(file => this.mapFileFromDatabase(file));
    } catch (error) {
      console.error("Error fetching files by project:", error);
      return [];
    }
  },

  async create(fileData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Process file content if it's a File object using ApperFileFieldComponent
      let processedFileContent = null;
      if (fileData.fileContent) {
        if (window.ApperSDK?.ApperFileUploader) {
          processedFileContent = window.ApperSDK.ApperFileUploader.toCreateFormat([fileData.fileContent]);
        } else {
          processedFileContent = fileData.fileContent;
        }
      }

      const params = {
        records: [{
          Name: fileData.name,
          original_name_c: fileData.originalName || fileData.name,
          size_c: fileData.size || 0,
          type_c: fileData.type || 'application/octet-stream',
          url_c: fileData.url || null,
          category_c: fileData.category || 'other',
          version_c: 1,
          folder_id_c: fileData.folderId || null,
          task_id_c: fileData.taskId || null,
          project_id_c: fileData.projectId || null,
          uploaded_at_c: new Date().toISOString(),
          uploaded_by_c: fileData.uploadedBy || 'current-user',
          last_modified_c: fileData.lastModified ? new Date(fileData.lastModified).toISOString() : new Date().toISOString(),
          shared_with_c: fileData.sharedWith ? JSON.stringify(fileData.sharedWith) : null,
          permissions_c: fileData.permissions ? JSON.stringify(fileData.permissions) : JSON.stringify({ read: true, write: true, delete: true }),
          is_archived_c: false,
          archived_at_c: null,
          archived_by_c: null,
          access_logs_c: null,
          storage_location_c: fileData.storageLocation || 'apper',
          file_content_c: processedFileContent
        }]
      };

      const response = await apperClient.createRecord('file_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || 'Failed to create file');
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} files:`, failed);
          failed.forEach(record => {
            if (record.message) showToast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const newFile = successful[0].data;
          showToast.success('File uploaded successfully!');
          return this.mapFileFromDatabase(newFile);
        }
      }
    } catch (error) {
      console.error("Error creating file:", error);
      showToast.error(error.message || 'Failed to upload file');
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

      if (updates.name !== undefined) updateData.Name = updates.name;
      if (updates.originalName !== undefined) updateData.original_name_c = updates.originalName;
      if (updates.category !== undefined) updateData.category_c = updates.category;
      if (updates.url !== undefined) updateData.url_c = updates.url;
      if (updates.folderId !== undefined) updateData.folder_id_c = updates.folderId;

      // Increment version if name changed
      if (updates.name !== undefined) {
        const currentFile = await this.getById(id);
        if (updates.name !== currentFile.name) {
          updateData.version_c = (currentFile.version || 1) + 1;
        }
      }

      const params = {
        records: [updateData]
      };

      const response = await apperClient.updateRecord('file_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || 'Failed to update file');
      }

      showToast.success('File updated successfully!');
      return await this.getById(id);
    } catch (error) {
      console.error("Error updating file:", error);
      showToast.error(error.message || 'Failed to update file');
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.deleteRecord('file_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || 'Failed to delete file');
      }

      showToast.success('File deleted successfully!');
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      showToast.error(error.message || 'Failed to delete file');
      throw error;
    }
  },

  async archive(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Id: parseInt(id),
          is_archived_c: true,
          archived_at_c: new Date().toISOString(),
          archived_by_c: 'current-user'
        }]
      };

      const response = await apperClient.updateRecord('file_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || 'Failed to archive file');
      }

      showToast.success('File archived successfully!');
      return await this.getById(id);
    } catch (error) {
      console.error("Error archiving file:", error);
      showToast.error(error.message || 'Failed to archive file');
      throw error;
    }
  },

  async restore(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Id: parseInt(id),
          is_archived_c: false,
          archived_at_c: null,
          archived_by_c: null
        }]
      };

      const response = await apperClient.updateRecord('file_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || 'Failed to restore file');
      }

      showToast.success('File restored successfully!');
      return await this.getById(id);
    } catch (error) {
      console.error("Error restoring file:", error);
      showToast.error(error.message || 'Failed to restore file');
      throw error;
    }
  },

  async getArchived() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('file_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "original_name_c"}},
          {"field": {"Name": "size_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "archived_at_c"}},
          {"field": {"Name": "archived_by_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        where: [{
          "FieldName": "is_archived_c",
          "Operator": "EqualTo",
          "Values": [true]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(file => this.mapFileFromDatabase(file));
    } catch (error) {
      console.error("Error fetching archived files:", error);
      return [];
    }
  },

  // Helper method to map database file to application format
  mapFileFromDatabase(file) {
    return {
      Id: file.Id,
      name: file.Name,
      originalName: file.original_name_c || file.Name,
      size: file.size_c || 0,
      type: file.type_c || 'application/octet-stream',
      url: file.url_c,
      category: file.category_c || 'other',
      version: file.version_c || 1,
      folderId: file.folder_id_c?.Id || file.folder_id_c,
      taskId: file.task_id_c?.Id || file.task_id_c,
      projectId: file.project_id_c?.Id || file.project_id_c,
      uploadedAt: file.uploaded_at_c || file.CreatedOn,
      uploadedBy: file.uploaded_by_c || 'unknown',
      lastModified: file.last_modified_c || file.ModifiedOn,
      sharedWith: file.shared_with_c ? this.parseJSON(file.shared_with_c) : [],
      permissions: file.permissions_c ? this.parseJSON(file.permissions_c) : { read: true, write: true, delete: true },
      isArchived: file.is_archived_c || false,
      archivedAt: file.archived_at_c,
      archivedBy: file.archived_by_c,
      accessLogs: file.access_logs_c ? this.parseJSON(file.access_logs_c) : [],
      storageLocation: file.storage_location_c || 'apper',
      fileContent: file.file_content_c,
      createdAt: file.CreatedOn,
      updatedAt: file.ModifiedOn
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
  }
};

export default fileService;

import { getApperClient } from "@/services/apperClient";
import { showToast } from "@/utils/toast";

const tagService = {
  // Get all tags
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('tag_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "Name", "sorttype": "ASC"}]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(tag => ({
        Id: tag.Id,
        name: tag.Name,
        color: tag.color_c || '#3b82f6',
        icon: tag.icon_c || 'Tag',
        createdAt: tag.CreatedOn,
        updatedAt: tag.ModifiedOn
      }));
    } catch (error) {
      console.error("Error fetching tags:", error);
      return [];
    }
  },

  // Get tag by ID
  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.getRecordById('tag_c', id, {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      });

      if (!response.success || !response.data) {
        throw new Error(`Tag with Id ${id} not found`);
      }

      const tag = response.data;
      return {
        Id: tag.Id,
        name: tag.Name,
        color: tag.color_c || '#3b82f6',
        icon: tag.icon_c || 'Tag',
        createdAt: tag.CreatedOn,
        updatedAt: tag.ModifiedOn
      };
    } catch (error) {
      console.error("Error fetching tag:", error);
      throw error;
    }
  },

  // Create new tag
  async create(tagData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Validate required fields
      if (!tagData.name || !tagData.name.trim()) {
        throw new Error('Tag name is required');
      }

      // Check for duplicate names
      const existingTags = await this.getAll();
      if (existingTags.some(t => t.name.toLowerCase() === tagData.name.trim().toLowerCase())) {
        throw new Error('Tag name already exists');
      }

      const params = {
        records: [{
          Name: tagData.name.trim(),
          color_c: tagData.color || '#3b82f6',
          icon_c: tagData.icon || 'Tag'
        }]
      };

      const response = await apperClient.createRecord('tag_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || 'Failed to create tag');
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} tags:`, failed);
          failed.forEach(record => {
            if (record.message) showToast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const newTag = successful[0].data;
          showToast.success('Tag created successfully!');
          return {
            Id: newTag.Id,
            name: tagData.name.trim(),
            color: tagData.color || '#3b82f6',
            icon: tagData.icon || 'Tag',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
      }
    } catch (error) {
      console.error("Error creating tag:", error);
      showToast.error(error.message || 'Failed to create tag');
      throw error;
    }
  },

  // Update tag
  async update(id, updates) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Check for duplicate names (excluding current tag)
      if (updates.name && updates.name.trim()) {
        const existingTags = await this.getAll();
        const existingTag = existingTags.find(t => 
          t.Id !== parseInt(id) && 
          t.name.toLowerCase() === updates.name.trim().toLowerCase()
        );
        if (existingTag) {
          throw new Error('Tag name already exists');
        }
      }

      const params = {
        records: [{
          Id: parseInt(id),
          ...(updates.name && { Name: updates.name.trim() }),
          ...(updates.color && { color_c: updates.color }),
          ...(updates.icon && { icon_c: updates.icon })
        }]
      };

      const response = await apperClient.updateRecord('tag_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || 'Failed to update tag');
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} tags:`, failed);
          failed.forEach(record => {
            if (record.message) showToast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          showToast.success('Tag updated successfully!');
          // Return updated tag data
          return await this.getById(id);
        }
      }
    } catch (error) {
      console.error("Error updating tag:", error);
      showToast.error(error.message || 'Failed to update tag');
      throw error;
    }
  },

  // Delete tag
  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Get tag before deletion for return value
      const tag = await this.getById(id);

      const response = await apperClient.deleteRecord('tag_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || 'Failed to delete tag');
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} tags:`, failed);
          failed.forEach(record => {
            if (record.message) showToast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          showToast.success('Tag deleted successfully!');
          return tag;
        }
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
      showToast.error(error.message || 'Failed to delete tag');
      throw error;
    }
  },

  // Search tags
  async search(query) {
    try {
      if (!query || !query.trim()) {
        return this.getAll();
      }

      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('tag_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [{
          "FieldName": "Name",
          "Operator": "Contains",
          "Values": [query.trim()]
        }],
        orderBy: [{"fieldName": "Name", "sorttype": "ASC"}]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(tag => ({
        Id: tag.Id,
        name: tag.Name,
        color: tag.color_c || '#3b82f6',
        icon: tag.icon_c || 'Tag',
        createdAt: tag.CreatedOn,
        updatedAt: tag.ModifiedOn
      }));
    } catch (error) {
      console.error("Error searching tags:", error);
      return [];
    }
  },

  // Get popular tags (most used)
  async getPopular(limit = 10) {
    try {
      // In a real implementation, this would join with task tags and count usage
      // For now, return all tags sorted by name
      const allTags = await this.getAll();
      return allTags.slice(0, limit);
    } catch (error) {
      console.error("Error fetching popular tags:", error);
      return [];
    }
  }
};

export default tagService;

export default tagService
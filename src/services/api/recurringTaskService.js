import { getApperClient } from '@/services/apperClient';
import toast from '@/utils/toast';

export class RecurringTaskService {
  constructor() {
    this.tableName = 'recurring_task_c';
  }

  async getAll() {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "task_id_c"}},
          {"field": {"Name": "recurrence_pattern_c"}},
          {"field": {"Name": "start_date_c"}},
          {"field": {"Name": "end_date_c"}},
          {"field": {"Name": "interval_c"}},
          {"field": {"Name": "day_of_week_c"}},
          {"field": {"Name": "day_of_month_c"}},
          {"field": {"Name": "occurrences_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      };

      const response = await apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map(this.transformFromAPI);
    } catch (error) {
      console.error("Error fetching recurring tasks:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "task_id_c"}},
          {"field": {"Name": "recurrence_pattern_c"}},
          {"field": {"Name": "start_date_c"}},
          {"field": {"Name": "end_date_c"}},
          {"field": {"Name": "interval_c"}},
          {"field": {"Name": "day_of_week_c"}},
          {"field": {"Name": "day_of_month_c"}},
          {"field": {"Name": "occurrences_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };

      const response = await apperClient.getRecordById(this.tableName, id, params);

      if (!response?.data) {
        return null;
      }

      return this.transformFromAPI(response.data);
    } catch (error) {
      console.error(`Error fetching recurring task ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async getByTaskId(taskId) {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "task_id_c"}},
          {"field": {"Name": "recurrence_pattern_c"}},
          {"field": {"Name": "start_date_c"}},
          {"field": {"Name": "end_date_c"}},
          {"field": {"Name": "interval_c"}},
          {"field": {"Name": "day_of_week_c"}},
          {"field": {"Name": "day_of_month_c"}},
          {"field": {"Name": "occurrences_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [{
          "FieldName": "task_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(taskId)]
        }]
      };

      const response = await apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map(this.transformFromAPI);
    } catch (error) {
      console.error(`Error fetching recurring tasks for task ${taskId}:`, error?.response?.data?.message || error);
      return [];
    }
  }

  async create(recurringTaskData) {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const recordData = this.transformToAPI(recurringTaskData);
      
      const params = {
        records: [recordData]
      };

      const response = await apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} recurring tasks:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          return this.transformFromAPI(successful[0].data);
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating recurring task:", error?.response?.data?.message || error);
      return null;
    }
  }

  async update(id, updates) {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const updateData = this.transformToAPI(updates);
      updateData.Id = id;

      const params = {
        records: [updateData]
      };

      const response = await apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} recurring tasks:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          return this.transformFromAPI(successful[0].data);
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating recurring task:", error?.response?.data?.message || error);
      return null;
    }
  }

  async delete(id) {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        RecordIds: [id]
      };

      const response = await apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} recurring tasks:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0;
      }

      return false;
    } catch (error) {
      console.error("Error deleting recurring task:", error?.response?.data?.message || error);
      return false;
    }
  }

  transformToAPI(data) {
    const record = {};

    // Map fields with non-empty values only
    if (data.name) record.Name = data.name;
    if (data.title) record.Name = data.title; // Support both name and title
    if (data.tags && data.tags.length > 0) record.Tags = Array.isArray(data.tags) ? data.tags.join(',') : data.tags;
    if (data.taskId) record.task_id_c = parseInt(data.taskId);
    if (data.recurrence) {
      record.recurrence_pattern_c = data.recurrence.pattern || 'daily';
      if (data.recurrence.startDate) record.start_date_c = new Date(data.recurrence.startDate).toISOString().split('T')[0];
      if (data.recurrence.endDate) record.end_date_c = new Date(data.recurrence.endDate).toISOString().split('T')[0];
      if (data.recurrence.interval) record.interval_c = parseInt(data.recurrence.interval);
      if (data.recurrence.daysOfWeek && data.recurrence.daysOfWeek.length > 0) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        record.day_of_week_c = data.recurrence.daysOfWeek.map(d => dayNames[d]).join(',');
      }
      if (data.recurrence.monthlyDate) record.day_of_month_c = parseInt(data.recurrence.monthlyDate);
      if (data.recurrence.endAfterOccurrences) record.occurrences_c = parseInt(data.recurrence.endAfterOccurrences);
    }

    return record;
  }

  transformFromAPI(data) {
    if (!data) return null;

    return {
      Id: data.Id,
      name: data.Name || '',
      title: data.Name || '', // Support both for compatibility
      tags: data.Tags ? data.Tags.split(',').filter(tag => tag.trim()) : [],
      taskId: data.task_id_c?.Id || data.task_id_c,
      task: data.task_id_c,
      recurrence: {
        pattern: data.recurrence_pattern_c || 'daily',
        startDate: data.start_date_c ? new Date(data.start_date_c).toISOString() : null,
        endDate: data.end_date_c ? new Date(data.end_date_c).toISOString() : null,
        interval: data.interval_c || 1,
        daysOfWeek: data.day_of_week_c ? this.parseDaysOfWeek(data.day_of_week_c) : [],
        monthlyDate: data.day_of_month_c || 1,
        endAfterOccurrences: data.occurrences_c || 10,
        enabled: true
      },
      createdOn: data.CreatedOn,
      modifiedOn: data.ModifiedOn
    };
  }

  parseDaysOfWeek(dayString) {
    if (!dayString) return [];
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const days = dayString.split(',').map(day => day.trim());
    
    return days.map(dayName => dayNames.indexOf(dayName)).filter(index => index !== -1);
  }

  parseJSON(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return null;
    }
  }
}

export const recurringTaskService = new RecurringTaskService();
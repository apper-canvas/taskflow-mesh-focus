import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Empty from "@/components/ui/Empty";
import TaskCard from "@/components/molecules/TaskCard";
import { recurringTaskService } from "@/services/api/recurringTaskService";
import toast from "@/utils/toast";

const TaskList = ({ 
  tasks, 
  onToggleComplete, 
  onEdit, 
  onDelete, 
  viewMode = "list",
  showCompleted = true,
  onCreateTask,
  onToggleSubtask,
  onCreateSubtask
}) => {
  const [recurringTasks, setRecurringTasks] = useState([]);
  const [loadingRecurring, setLoadingRecurring] = useState(false);

  // Load recurring tasks when component mounts
  useEffect(() => {
    loadRecurringTasks();
  }, []);

  const loadRecurringTasks = async () => {
    try {
      setLoadingRecurring(true);
      const recurring = await recurringTaskService.getAll();
      
      // Transform recurring tasks to match regular task structure
      const transformedRecurring = recurring.map(recurringTask => ({
        Id: `recurring-${recurringTask.Id}`, // Prefix to avoid ID conflicts
        title: recurringTask.name || recurringTask.title,
        description: `Recurring: ${recurringTask.recurrence?.pattern || 'daily'}`,
        category: "Personal", // Default category for recurring tasks
        priority: "Medium", // Default priority
        status: "Not Started",
        completed: false,
        isRecurring: true,
        recurrence: recurringTask.recurrence,
        tags: recurringTask.tags || [],
        taskId: recurringTask.taskId, // Reference to original task
        recurringId: recurringTask.Id, // Original recurring task ID
        createdOn: recurringTask.createdOn,
        modifiedOn: recurringTask.modifiedOn,
        // Add visual indicators for recurring tasks
        recurringPattern: recurringTask.recurrence?.pattern || 'daily',
        nextOccurrence: recurringTask.recurrence?.startDate
      }));
      
      setRecurringTasks(transformedRecurring);
    } catch (error) {
      console.error('Failed to load recurring tasks:', error);
      toast.error('Failed to load recurring tasks');
    } finally {
      setLoadingRecurring(false);
    }
  };

  // Combine regular tasks and recurring tasks
  const allTasks = [...tasks, ...recurringTasks];
  const activeTasks = allTasks.filter(task => !task.completed);
  const completedTasks = allTasks.filter(task => task.completed);

  // Handle recurring task actions
  const handleRecurringTaskEdit = (recurringTask) => {
    if (recurringTask.recurringId) {
      // Find the original task if it exists
      const originalTask = tasks.find(t => t.Id === recurringTask.taskId);
      if (originalTask) {
        onEdit({
          ...originalTask,
          isRecurring: true,
          recurrence: recurringTask.recurrence
        });
      } else {
        // Create a mock task for editing recurring schedule
        onEdit({
          Id: recurringTask.taskId || null,
          title: recurringTask.title,
          description: recurringTask.description,
          isRecurring: true,
          recurrence: recurringTask.recurrence,
          category: recurringTask.category,
          priority: recurringTask.priority,
          tags: recurringTask.tags
        });
      }
    } else {
      onEdit(recurringTask);
    }
  };

  const handleRecurringTaskDelete = async (recurringTaskId) => {
    try {
      const recurringId = recurringTaskId.replace('recurring-', '');
      await recurringTaskService.delete(parseInt(recurringId));
      
      // Remove from local state
      setRecurringTasks(prev => prev.filter(t => t.Id !== recurringTaskId));
      toast.success('Recurring task deleted successfully');
    } catch (error) {
      console.error('Failed to delete recurring task:', error);
      toast.error('Failed to delete recurring task');
    }
  };

  const handleTaskAction = (task, action, ...args) => {
    if (task.Id && task.Id.toString().startsWith('recurring-')) {
      // Handle recurring task actions
      switch (action) {
        case 'edit':
          handleRecurringTaskEdit(task);
          break;
        case 'delete':
          handleRecurringTaskDelete(task.Id);
          break;
        case 'toggle':
          // For recurring tasks, we might want to create an instance or skip
          toast.info('Recurring tasks cannot be completed directly. Edit the schedule to manage occurrences.');
          break;
        default:
          break;
      }
    } else {
      // Handle regular task actions
      switch (action) {
        case 'edit':
          onEdit(task);
          break;
        case 'delete':
          onDelete(task.Id);
          break;
        case 'toggle':
          onToggleComplete(task.Id, !task.completed);
          break;
        default:
          break;
      }
    }
  };

  if (allTasks.length === 0) {
    return (
      <Empty
        title="No tasks found"
        description="No tasks match your current filters. Try adjusting your search or create a new task!"
        actionText="Create your first task"
        onAction={onCreateTask}
      />
    )
  }

  const renderTasksByCategory = () => {
    const categories = ["Personal", "Work", "Other"]
    const tasksByCategory = categories.reduce((acc, category) => {
      acc[category] = allTasks.filter(task => task.category === category && !task.completed)
      return acc
    }, {})

    return (
      <div className="space-y-8">
        {categories.map(category => {
          const categoryTasks = tasksByCategory[category]
          if (categoryTasks.length === 0) return null

          const getCategoryIcon = (cat) => {
            switch (cat) {
              case "Personal": return "Home"
              case "Work": return "Briefcase"  
              case "Other": return "Folder"
              default: return "Circle"
            }
          }

          const getCategoryColor = (cat) => {
            switch (cat) {
              case "Personal": return "from-purple-500 to-purple-600"
              case "Work": return "from-blue-500 to-blue-600"
              case "Other": return "from-green-500 to-green-600"
              default: return "from-gray-500 to-gray-600"
            }
          }

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 bg-gradient-to-br ${getCategoryColor(category)} rounded-lg flex items-center justify-center`}>
                  <ApperIcon name={getCategoryIcon(category)} size={18} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {category}
                </h3>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full font-medium">
                  {categoryTasks.length}
                </span>
              </div>

<div className="grid gap-3">
                <AnimatePresence>
                  {categoryTasks.map(task => (
                    <TaskCard
                      key={task.Id}
                      task={task}
                      showCreator={true}
                      onToggleComplete={(taskId, completed) => handleTaskAction(task, 'toggle', taskId, completed)}
                      onEdit={() => handleTaskAction(task, 'edit')}
                      onDelete={() => handleTaskAction(task, 'delete')}
                      onToggleSubtask={onToggleSubtask}
                      onCreateSubtask={onCreateSubtask}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </div>
    )
  }

  const renderTasksList = () => (
    <div className="space-y-6">
      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="Circle" size={18} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Active Tasks
            </h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
              {activeTasks.length}
            </span>
            {recurringTasks.length > 0 && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-medium">
                {recurringTasks.filter(t => !t.completed).length} recurring
              </span>
            )}
          </div>

          <div className="grid gap-3">
            <AnimatePresence>
{activeTasks.map(task => (
                <TaskCard
                  key={task.Id}
                  task={task}
                  showCreator={true}
                  onToggleComplete={(taskId, completed) => handleTaskAction(task, 'toggle', taskId, completed)}
                  onEdit={() => handleTaskAction(task, 'edit')}
                  onDelete={() => handleTaskAction(task, 'delete')}
                  onToggleSubtask={onToggleSubtask}
                  onCreateSubtask={onCreateSubtask}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && showCompleted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="CheckCircle2" size={18} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Completed Tasks
            </h3>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
              {completedTasks.length}
            </span>
          </div>

          <div className="grid gap-3">
<AnimatePresence>
              {completedTasks.map(task => (
                <TaskCard
                  key={task.Id}
                  task={task}
                  showCreator={true}
                  onToggleComplete={(taskId, completed) => handleTaskAction(task, 'toggle', taskId, completed)}
                  onEdit={() => handleTaskAction(task, 'edit')}
                  onDelete={() => handleTaskAction(task, 'delete')}
                  onToggleSubtask={onToggleSubtask}
                  onCreateSubtask={onCreateSubtask}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Loading Recurring Tasks */}
      {loadingRecurring && (
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <ApperIcon name="RotateCw" size={16} className="animate-spin" />
            Loading recurring tasks...
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {viewMode === "category" ? renderTasksByCategory() : renderTasksList()}
    </div>
  )
}

export default TaskList
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/api';

// Types
interface User {
  _id: string;
  name: string;
  email: string;
}

interface Comment {
  _id?: string;
  user: User | string;
  content: string;
  createdAt: string;
}

interface ActivityLog {
  user: User | string;
  action: string;
  field?: string;
  oldValue?: any;
  newValue?: any;
  timestamp: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  project: string;
  column: string;
  assignedTo: User[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
  dueDate?: string;
  labels: string[];
  attachments: string[];
  comments: Comment[];
  activityHistory: ActivityLog[];
  order: number;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

interface TasksState {
  tasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  error: string | null;
}

interface CreateTaskData {
  title: string;
  description?: string;
  project: string;
  column: string;
  assignedTo?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  labels?: string[];
}

interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string;
}

interface MoveTaskData {
  taskId: string;
  targetColumnId: string;
  targetPosition: number;
}

// Initial state
const initialState: TasksState = {
  tasks: [],
  selectedTask: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchTasksByProject = createAsyncThunk(
  'tasks/fetchByProject',
  async (projectId: string, { rejectWithValue }) => {
    try {
      // The backend returns columns with nested tasks, we need to extract all tasks
      const response = await api.get(`/board/${projectId}`);

      // Extract all tasks from columns
      const tasks: Task[] = [];
      response.data.forEach((col: any) => {
        if (col.tasks && col.tasks.length > 0) {
          tasks.push(...col.tasks);
        }
      });

      return tasks;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchById',
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/board/tasks/${taskId}`);
      return response.data.task || response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch task');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (taskData: CreateTaskData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/board/${taskData.project}/tasks`,
        {
          title: taskData.title,
          description: taskData.description,
          columnId: taskData.column,
          order: 0, // You might want to calculate this
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, ...updateData }: UpdateTaskData, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/board/tasks/${id}`,
        updateData
      );
      return response.data.task || response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (taskId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/board/tasks/${taskId}`);
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
    }
  }
);

export const moveTask = createAsyncThunk(
  'tasks/move',
  async ({ taskId, targetColumnId, targetPosition }: MoveTaskData, { rejectWithValue }) => {
    try {
      await api.patch(
        `/board/tasks/${taskId}/move`,
        { newColumnId: targetColumnId, newOrder: targetPosition }
      );

      // The backend only returns a success message, so we'll return the data we need
      return {
        task: { _id: taskId, column: targetColumnId, order: targetPosition } as Task,
        affectedTasks: [] as Task[]
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to move task');
    }
  }
);

export const addTaskComment = createAsyncThunk(
  'tasks/addComment',
  async ({ taskId, content }: { taskId: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/board/tasks/${taskId}/comments`,
        { content }
      );
      return response.data.task || response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

export const deleteTaskComment = createAsyncThunk(
  'tasks/deleteComment',
  async ({ taskId, commentId }: { taskId: string; commentId: string }, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/board/tasks/${taskId}/comments/${commentId}`
      );
      return response.data.task || response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete comment');
    }
  }
);

// Search and filter tasks
export const searchTasks = createAsyncThunk(
  'tasks/search',
  async ({ projectId, filters }: { projectId: string; filters: any }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      const response = await api.get(`/board/${projectId}/search?${params}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search tasks');
    }
  }
);

// Tasks slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    },
    setSelectedTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload;
    },
    clearTasks: (state) => {
      state.tasks = [];
      state.selectedTask = null;
      state.error = null;
    },
    // Optimistic update for drag and drop
    reorderTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch tasks by project
    builder
      .addCase(fetchTasksByProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasksByProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
        state.error = null;
      })
      .addCase(fetchTasksByProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch task by ID
    builder
      .addCase(fetchTaskById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedTask = action.payload;
        state.error = null;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create task
    builder
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks.push(action.payload);
        state.error = null;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update task
    builder
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.selectedTask?._id === action.payload._id) {
          state.selectedTask = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete task
    builder
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t._id !== action.payload);
        if (state.selectedTask?._id === action.payload) {
          state.selectedTask = null;
        }
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Move task
    builder
      .addCase(moveTask.fulfilled, (state, action) => {
        const { task, affectedTasks } = action.payload;

        // Update the moved task
        const taskIndex = state.tasks.findIndex(t => t._id === task._id);
        if (taskIndex !== -1) {
          state.tasks[taskIndex] = task;
        }

        // Update all affected tasks (reordered tasks)
        affectedTasks.forEach(affectedTask => {
          const index = state.tasks.findIndex(t => t._id === affectedTask._id);
          if (index !== -1) {
            state.tasks[index] = affectedTask;
          }
        });

        state.error = null;
      })
      .addCase(moveTask.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Add comment
    builder
      .addCase(addTaskComment.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.selectedTask?._id === action.payload._id) {
          state.selectedTask = action.payload;
        }
        state.error = null;
      })
      .addCase(addTaskComment.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete comment
    builder
      .addCase(deleteTaskComment.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.selectedTask?._id === action.payload._id) {
          state.selectedTask = action.payload;
        }
        state.error = null;
      })
      .addCase(deleteTaskComment.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { clearTaskError, setSelectedTask, clearTasks, reorderTasks } = taskSlice.actions;
export default taskSlice.reducer;
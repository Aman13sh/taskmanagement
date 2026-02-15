import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/api';

// Types
interface Column {
  _id: string;
  name: string;
  project: string;
  order: number;
  color?: string;
  limit?: number;
  createdAt: string;
  updatedAt: string;
}

interface BoardState {
  columns: Column[];
  isLoading: boolean;
  error: string | null;
  draggedTaskId: string | null;
  draggedOverColumnId: string | null;
}

interface CreateColumnData {
  name: string;
  project: string;
  color?: string;
  limit?: number;
}

interface UpdateColumnData extends Partial<CreateColumnData> {
  id: string;
}

interface MoveColumnData {
  columnId: string;
  targetPosition: number;
}

// Initial state
const initialState: BoardState = {
  columns: [],
  isLoading: false,
  error: null,
  draggedTaskId: null,
  draggedOverColumnId: null,
};

// Async thunks
export const fetchColumnsByProject = createAsyncThunk(
  'board/fetchColumns',
  async (projectId: string, { rejectWithValue }) => {
    try {
      // The backend returns columns with nested tasks
      const response = await api.get(`/board/${projectId}`);

      // Extract just the column data (without nested tasks)
      const columns = response.data.map((col: any) => {
        const { tasks, ...columnData } = col;
        return columnData;
      });

      return columns;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch board data');
    }
  }
);

export const createColumn = createAsyncThunk(
  'board/createColumn',
  async (columnData: CreateColumnData, { rejectWithValue }) => {
    try {
      // Calculate order based on existing columns count
      const order = 0; // You might want to calculate this based on existing columns

      const response = await api.post(
        `/board/${columnData.project}/columns`,
        { name: columnData.name, order }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create column');
    }
  }
);

export const updateColumn = createAsyncThunk(
  'board/updateColumn',
  async ({ id, ...updateData }: UpdateColumnData, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/columns/${id}`,
        updateData
      );
      return response.data.column || response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update column');
    }
  }
);

export const deleteColumn = createAsyncThunk(
  'board/deleteColumn',
  async (columnId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/columns/${columnId}`);
      return columnId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete column');
    }
  }
);

export const moveColumn = createAsyncThunk(
  'board/moveColumn',
  async ({ columnId, targetPosition }: MoveColumnData, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/columns/${columnId}/move`,
        { position: targetPosition }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to move column');
    }
  }
);

// Board slice
const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    clearBoardError: (state) => {
      state.error = null;
    },
    setDraggedTask: (state, action: PayloadAction<string | null>) => {
      state.draggedTaskId = action.payload;
    },
    setDraggedOverColumn: (state, action: PayloadAction<string | null>) => {
      state.draggedOverColumnId = action.payload;
    },
    clearBoard: (state) => {
      state.columns = [];
      state.error = null;
      state.draggedTaskId = null;
      state.draggedOverColumnId = null;
    },
    // Optimistic update for drag and drop
    reorderColumns: (state, action: PayloadAction<Column[]>) => {
      state.columns = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch columns
    builder
      .addCase(fetchColumnsByProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchColumnsByProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.columns = action.payload;
        state.error = null;
      })
      .addCase(fetchColumnsByProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create column
    builder
      .addCase(createColumn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createColumn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.columns.push(action.payload);
        // Sort columns by order
        state.columns.sort((a, b) => a.order - b.order);
        state.error = null;
      })
      .addCase(createColumn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update column
    builder
      .addCase(updateColumn.fulfilled, (state, action) => {
        const index = state.columns.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.columns[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateColumn.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete column
    builder
      .addCase(deleteColumn.fulfilled, (state, action) => {
        state.columns = state.columns.filter(c => c._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteColumn.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Move column
    builder
      .addCase(moveColumn.fulfilled, (state, action) => {
        const { column, affectedColumns } = action.payload;

        // Update the moved column
        const columnIndex = state.columns.findIndex(c => c._id === column._id);
        if (columnIndex !== -1) {
          state.columns[columnIndex] = column;
        }

        // Update all affected columns (reordered columns)
        affectedColumns.forEach(affectedColumn => {
          const index = state.columns.findIndex(c => c._id === affectedColumn._id);
          if (index !== -1) {
            state.columns[index] = affectedColumn;
          }
        });

        // Sort columns by order
        state.columns.sort((a, b) => a.order - b.order);
        state.error = null;
      })
      .addCase(moveColumn.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const {
  clearBoardError,
  setDraggedTask,
  setDraggedOverColumn,
  clearBoard,
  reorderColumns,
} = boardSlice.actions;

export default boardSlice.reducer;
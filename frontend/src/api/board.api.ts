import api from './api';

interface Column {
  _id: string;
  name: string;
  project: string;
  order: number;
  tasks?: Task[];
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  project: string;
  column: string;
  order: number;
}

interface BoardData {
  columns: Column[];
  tasks: Task[];
}

// Get entire board with columns and tasks
export const getBoard = async (projectId: string): Promise<BoardData> => {
  const response = await api.get(`/board/${projectId}`);

  // The backend returns columns with nested tasks, we need to flatten them
  const boardData = response.data;
  const columns: Column[] = [];
  const tasks: Task[] = [];

  boardData.forEach((col: any) => {
    const { tasks: colTasks, ...columnData } = col;
    columns.push(columnData);
    if (colTasks && colTasks.length > 0) {
      tasks.push(...colTasks);
    }
  });

  return { columns, tasks };
};

// Create a new column
export const createColumn = async (projectId: string, name: string, order: number = 0) => {
  const response = await api.post(`/board/${projectId}/columns`, { name, order });
  return response.data;
};

// Create a new task
export const createTask = async (
  projectId: string,
  columnId: string,
  title: string,
  description?: string,
  order: number = 0
) => {
  const response = await api.post(`/board/${projectId}/tasks`, {
    title,
    description,
    columnId,
    order,
  });
  return response.data;
};

// Move a task to a different column or position
export const moveTask = async (taskId: string, newColumnId: string, newOrder: number) => {
  const response = await api.patch(`/board/tasks/${taskId}/move`, {
    newColumnId,
    newOrder,
  });
  return response.data;
};

// Delete a task
export const deleteTask = async (taskId: string) => {
  const response = await api.delete(`/board/tasks/${taskId}`);
  return response.data;
};
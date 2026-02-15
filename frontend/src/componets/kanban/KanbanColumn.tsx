import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../../redux/hooks';
import { updateColumn, deleteColumn } from '../../redux/slices/boardSlice';
import { createTask } from '../../redux/slices/taskSlice';
import { TaskCard } from './TaskCard';
import { AddTaskForm } from './AddTaskForm';

interface Column {
  _id: string;
  name: string;
  project: string;
  order: number;
  color?: string;
  limit?: number;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  column: string;
  order: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  assignedTo?: string[];
}

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, tasks }) => {
  const dispatch = useAppDispatch();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [columnTitle, setColumnTitle] = useState(column.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column._id,
    data: {
      type: 'column',
      data: column,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleUpdateTitle = async () => {
    if (columnTitle.trim() && columnTitle !== column.name) {
      try {
        await dispatch(updateColumn({
          id: column._id,
          name: columnTitle.trim(),
        })).unwrap();
        toast.success('Column updated');
      } catch (error) {
        toast.error('Failed to update column');
        setColumnTitle(column.name);
      }
    }
    setIsEditingTitle(false);
  };

  const handleDeleteColumn = async () => {
    if (tasks.length > 0) {
      toast.error('Cannot delete column with tasks');
      return;
    }

    if (window.confirm(`Delete column "${column.name}"?`)) {
      try {
        await dispatch(deleteColumn(column._id)).unwrap();
        toast.success('Column deleted');
      } catch (error) {
        toast.error('Failed to delete column');
      }
    }
  };

  const handleAddTask = async (title: string, description?: string) => {
    try {
      await dispatch(createTask({
        title,
        description,
        project: column.project,
        column: column._id,
      })).unwrap();
      toast.success('Task created');
      setIsAddingTask(false);
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500';
      case 'high':
        return 'border-orange-500';
      case 'medium':
        return 'border-yellow-500';
      case 'low':
        return 'border-green-500';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-50 rounded-lg p-4 w-80 flex-shrink-0 max-h-full flex flex-col"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 flex-1">
          {isEditingTitle ? (
            <input
              type="text"
              value={columnTitle}
              onChange={(e) => setColumnTitle(e.target.value)}
              onBlur={handleUpdateTitle}
              onKeyPress={(e) => e.key === 'Enter' && handleUpdateTitle()}
              className="font-semibold text-gray-700 bg-white border rounded px-2 py-1 flex-1"
              autoFocus
            />
          ) : (
            <h3
              className="font-semibold text-gray-700 cursor-pointer flex-1"
              onClick={() => setIsEditingTitle(true)}
            >
              {column.name}
            </h3>
          )}
          <span className="text-sm text-gray-500 bg-gray-200 rounded-full px-2 py-1">
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsAddingTask(true)}
            className="text-gray-500 hover:text-gray-700"
            title="Add task"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            {...listeners}
            {...attributes}
            className="text-gray-500 hover:text-gray-700 cursor-move"
            title="Drag column"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={handleDeleteColumn}
            className="text-gray-500 hover:text-red-600"
            title="Delete column"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Add Task Form */}
      {isAddingTask && (
        <AddTaskForm
          onAdd={handleAddTask}
          onCancel={() => setIsAddingTask(false)}
        />
      )}

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto space-y-2">
        <SortableContext
          items={tasks.map((task) => task._id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </SortableContext>
      </div>

      {/* Drop zone indicator when empty */}
      {tasks.length === 0 && !isAddingTask && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400">
          <p>Drop tasks here</p>
          <button
            onClick={() => setIsAddingTask(true)}
            className="mt-2 text-blue-600 hover:text-blue-700"
          >
            Or add a task
          </button>
        </div>
      )}
    </div>
  );
};
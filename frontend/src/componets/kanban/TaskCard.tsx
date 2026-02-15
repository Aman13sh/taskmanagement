import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../../redux/hooks';
import { deleteTask, updateTask } from '../../redux/slices/taskSlice';
import { TaskDetailModal } from './TaskDetailModal';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  column: string;
  order: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'todo' | 'in_progress' | 'in_review' | 'done';
  dueDate?: string;
  assignedTo?: User[];
  labels?: string[];
  comments?: any[];
}

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isDragging = false }) => {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || '');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task._id,
    data: {
      type: 'task',
      data: task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging || isDragging ? 0.5 : 1,
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getPriorityLabel = () => {
    switch (task.priority) {
      case 'urgent':
        return 'Urgent';
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      default:
        return '';
    }
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Overdue', color: 'text-red-600' };
    } else if (diffDays === 0) {
      return { text: 'Today', color: 'text-orange-600' };
    } else if (diffDays === 1) {
      return { text: 'Tomorrow', color: 'text-yellow-600' };
    } else if (diffDays <= 7) {
      return { text: `${diffDays} days`, color: 'text-blue-600' };
    } else {
      return { text: date.toLocaleDateString(), color: 'text-gray-600' };
    }
  };

  const handleSave = async () => {
    if (!editedTitle.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      await dispatch(updateTask({
        id: task._id,
        title: editedTitle.trim(),
        description: editedDescription.trim(),
      })).unwrap();
      toast.success('Task updated');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this task?')) {
      try {
        await dispatch(deleteTask(task._id)).unwrap();
        toast.success('Task deleted');
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          className="w-full font-medium text-gray-800 mb-2 px-2 py-1 border rounded"
          placeholder="Task title"
        />
        <textarea
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          className="w-full text-sm text-gray-600 px-2 py-1 border rounded resize-none"
          placeholder="Description (optional)"
          rows={3}
        />
        <div className="flex justify-end space-x-2 mt-2">
          <button
            onClick={() => {
              setEditedTitle(task.title);
              setEditedDescription(task.description || '');
              setIsEditing(false);
            }}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-move hover:shadow-md transition-shadow"
        onClick={() => setShowDetailModal(true)}
        {...attributes}
        {...listeners}
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-gray-800 flex-1">{task.title}</h4>
          <div className="flex items-center space-x-1 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="text-gray-400 hover:text-gray-600"
              title="Edit task"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="text-gray-400 hover:text-red-600"
              title="Delete task"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
        )}

        {/* Meta info section */}
        <div className="space-y-2">
          {/* Priority, Due Date, Comments */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {task.priority && (
                <span className={`inline-block w-2 h-2 rounded-full ${getPriorityColor()}`} title={getPriorityLabel()} />
              )}
              {task.dueDate && (
                <span className={`text-xs ${formatDueDate(task.dueDate).color}`}>
                  📅 {formatDueDate(task.dueDate).text}
                </span>
              )}
              {task.comments && task.comments.length > 0 && (
                <span className="text-xs text-gray-500">
                  💬 {task.comments.length}
                </span>
              )}
            </div>
          </div>

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.labels.slice(0, 2).map((label, index) => (
                <span
                  key={index}
                  className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-1"
                >
                  {label}
                </span>
              ))}
              {task.labels.length > 2 && (
                <span className="text-xs text-gray-500">+{task.labels.length - 2}</span>
              )}
            </div>
          )}

          {/* Assigned Users */}
          {task.assignedTo && task.assignedTo.length > 0 && (
            <div className="flex items-center -space-x-2">
              {task.assignedTo.slice(0, 3).map((user) => (
                <div
                  key={user._id}
                  className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-medium border-2 border-white"
                  title={user.name}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {task.assignedTo.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-medium border-2 border-white">
                  +{task.assignedTo.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      {showDetailModal && (
        <TaskDetailModal
          taskId={task._id}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </>
  );
};
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../../redux/hooks';
import { deleteTask } from '../../redux/slices/taskSlice';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Comment {
  _id: string;
  text: string;
  user: User | string;
  createdAt: string;
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
  assignedTo?: (User | string)[];
  labels?: string[];
  comments?: Comment[];
  createdBy?: User | string;
  createdAt?: string;
  updatedAt?: string;
}

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onSelect?: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isDragging = false, onSelect }) => {
  const dispatch = useAppDispatch();
 

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
    disabled: false,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging || isDragging ? 0.5 : 1,
    cursor: isSortableDragging ? 'grabbing' : 'auto',
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

  const getPriorityBorderColor = () => {
    switch (task.priority) {
      case 'urgent':
        return 'border-l-4 border-l-red-500';
      case 'high':
        return 'border-l-4 border-l-orange-500';
      case 'medium':
        return 'border-l-4 border-l-yellow-500';
      case 'low':
        return 'border-l-4 border-l-green-500';
      default:
        return '';
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

  const handleDelete = async () => {
    if (window.confirm('Delete this task?')) {
      try {
        await dispatch(deleteTask(task._id)).unwrap();
        toast.success('Task deleted');
      } catch {
        toast.error('Failed to delete task');
      }
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-lg transition-all hover:border-blue-400 cursor-pointer ${getPriorityBorderColor()}`}
        onClick={(e) => {
          // Check if the click is directly on the card or its text content (not buttons/drag handle)
          const target = e.target as HTMLElement;
          const isButton = target.closest('button') || target.closest('[role="button"]');
          const isDragHandle = target.closest('.drag-handle');

          if (!isButton && !isDragHandle && !isSortableDragging && onSelect) {
            onSelect(task._id);
          }
        }}
      >
        {/* Task Header with Drag Handle */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <button
                type="button"
                className="drag-handle cursor-move text-gray-400 hover:text-gray-600 p-1 touch-none"
                title="Drag to move"
                {...attributes}
                {...listeners}
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </button>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                #{task._id.slice(-6).toUpperCase()}
              </span>
              {task.createdBy && (
                <span className="text-xs text-gray-400">
                  by {typeof task.createdBy === 'object' && 'name' in task.createdBy ? task.createdBy.name : 'Unknown'}
                </span>
              )}
            </div>
            <h4 className="font-semibold text-gray-900 text-base leading-tight">{task.title}</h4>
          </div>
          <div className="flex items-center space-x-1 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onSelect) onSelect(task._id);
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

        {/* Assigned Users Section */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Assigned:</span>
            {task.assignedTo && task.assignedTo.length > 0 ? (
              <div className="flex items-center -space-x-1">
                {task.assignedTo.slice(0, 4).map((user, index) => {
                  const isUserObject = typeof user === 'object' && user !== null && 'name' in user;
                  const userName = isUserObject ? user.name : 'User';
                  const userId = isUserObject ? user._id : user;
                  const userEmail = isUserObject && 'email' in user ? user.email : '';

                  return (
                    <div
                      key={userId || index}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-semibold border-2 border-white shadow-sm hover:z-10 hover:scale-110 transition-transform"
                      title={`${userName}${userEmail ? ` (${userEmail})` : ''}`}
                    >
                      {userName.substring(0, 2).toUpperCase()}
                    </div>
                  );
                })}
                {task.assignedTo.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-semibold border-2 border-white shadow-sm">
                    +{task.assignedTo.length - 4}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs text-gray-400 italic">Unassigned</span>
            )}
          </div>
        </div>

        {/* Meta info section */}
        <div className="space-y-2">
          {/* Status and Priority Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {task.priority && (
              <div className="flex items-center gap-1 bg-gray-50 rounded px-2 py-1">
                <span className={`inline-block w-3 h-3 rounded-full ${getPriorityColor()}`} />
                <span className="text-xs font-medium text-gray-700">{getPriorityLabel()}</span>
              </div>
            )}
            {task.status && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                task.status === 'done' ? 'bg-green-100 text-green-800' :
                task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                task.status === 'in_review' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-700'
              }`}>
                {task.status === 'todo' ? '📋 To Do' :
                 task.status === 'in_progress' ? '⚡ In Progress' :
                 task.status === 'in_review' ? '👀 In Review' :
                 task.status === 'done' ? '✅ Done' :
                 task.status ? task.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Unknown'}
              </span>
            )}
          </div>

          {/* Due Date and Comments */}
          <div className="flex items-center gap-3 flex-wrap">
            {task.dueDate && (
              <div className={`flex items-center gap-1 text-xs font-medium ${formatDueDate(task.dueDate).color}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDueDate(task.dueDate).text}</span>
              </div>
            )}
            {task.comments && task.comments.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{task.comments.length} {task.comments.length === 1 ? 'comment' : 'comments'}</span>
              </div>
            )}
          </div>

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.labels.slice(0, 3).map((label, index) => (
                <span
                  key={index}
                  className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 font-medium"
                >
                  {label}
                </span>
              ))}
              {task.labels.length > 3 && (
                <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                  +{task.labels.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

    </>
  );
};
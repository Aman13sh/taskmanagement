import { useState } from 'react';
import { useAppSelector } from '../../redux/hooks';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface ProjectMember {
  user: string | User;
  role: 'owner' | 'admin' | 'member' | 'viewer';
}

interface AddTaskFormProps {
  onAdd: (taskData: any) => void;
  onCancel: () => void;
  columnId: string;
}

export const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAdd, onCancel, columnId }) => {
  const { currentProject } = useAppSelector((state) => state.projects);
  const [isExpanded, setIsExpanded] = useState(false);

  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'todo' as 'todo' | 'in_progress' | 'in_review' | 'done',
    dueDate: '',
    assignedTo: [] as string[],
    labels: [] as string[],
  });

  const [newLabel, setNewLabel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskData.title.trim()) return;

    onAdd({
      ...taskData,
      column: columnId,
      dueDate: taskData.dueDate || undefined,
      labels: taskData.labels.filter(l => l.trim()),
    });

    // Reset form
    setTaskData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      dueDate: '',
      assignedTo: [],
      labels: [],
    });
    setIsExpanded(false);
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && !taskData.labels.includes(newLabel.trim())) {
      setTaskData({
        ...taskData,
        labels: [...taskData.labels, newLabel.trim()],
      });
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (label: string) => {
    setTaskData({
      ...taskData,
      labels: taskData.labels.filter(l => l !== label),
    });
  };

  const handleAssignUser = (userId: string) => {
    setTaskData(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter(id => id !== userId)
        : [...prev.assignedTo, userId]
    }));
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
      >
        + Add a task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
      <div className="space-y-3">
        {/* Title */}
        <input
          type="text"
          value={taskData.title}
          onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
          placeholder="Enter task title..."
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />

        {/* Description */}
        <textarea
          value={taskData.description}
          onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
          placeholder="Add a description..."
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />

        {/* Priority and Status Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={taskData.priority}
              onChange={(e) => setTaskData({ ...taskData, priority: e.target.value as any })}
              className="w-full px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🟠 High</option>
              <option value="urgent">🔴 Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              value={taskData.status}
              onChange={(e) => setTaskData({ ...taskData, status: e.target.value as any })}
              className="w-full px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
          <input
            type="date"
            value={taskData.dueDate}
            onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
            className="w-full px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Assigned To */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Assign To</label>
          <div className="space-y-1 max-h-32 overflow-y-auto border rounded-md p-2">
            {currentProject?.members?.map((member) => {
              const userId = typeof member.user === 'object' ? member.user._id : member.user;
              const userName = typeof member.user === 'object' && member.user.name
                ? member.user.name
                : 'User';

              return (
                <label
                  key={userId}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={taskData.assignedTo.includes(userId)}
                    onChange={() => handleAssignUser(userId)}
                    className="rounded text-blue-600 cursor-pointer"
                  />
                  <span className="text-sm cursor-pointer select-none">
                    {userName}
                    <span className="text-xs text-gray-500 ml-1">({member.role})</span>
                  </span>
                </label>
              );
            })}
            {(!currentProject?.members || currentProject.members.length === 0) && (
              <p className="text-xs text-gray-500">No members to assign</p>
            )}
          </div>
        </div>

        {/* Labels */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Labels</label>
          <div className="flex flex-wrap gap-1 mb-2">
            {taskData.labels.map((label) => (
              <span
                key={label}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center"
              >
                {label}
                <button
                  type="button"
                  onClick={() => handleRemoveLabel(label)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-1">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLabel();
                }
              }}
              placeholder="Add label..."
              className="flex-1 px-2 py-1 text-sm border rounded"
            />
            <button
              type="button"
              onClick={handleAddLabel}
              className="px-2 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-xs text-gray-500">
          💡 All fields help track your task better
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => {
              setIsExpanded(false);
              onCancel();
            }}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!taskData.title.trim()}
            className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Task
          </button>
        </div>
      </div>
    </form>
  );
};
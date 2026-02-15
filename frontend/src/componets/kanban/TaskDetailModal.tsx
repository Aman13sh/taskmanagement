import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { updateTask, addTaskComment, deleteTaskComment, fetchTaskById } from '../../redux/slices/taskSlice';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

interface TaskDetailModalProps {
  taskId: string;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ taskId, onClose }) => {
  const dispatch = useAppDispatch();
  const { selectedTask, isLoading } = useAppSelector((state) => state.tasks);
  const { currentProject } = useAppSelector((state) => state.projects);
  const { user } = useAppSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'todo' as 'todo' | 'in_progress' | 'in_review' | 'done',
    dueDate: '',
    assignedTo: [] as string[],
    labels: [] as string[],
  });
  const [newComment, setNewComment] = useState('');
  const [newLabel, setNewLabel] = useState('');

  useEffect(() => {
    dispatch(fetchTaskById(taskId));
  }, [dispatch, taskId]);

  useEffect(() => {
    if (selectedTask) {
      setEditedTask({
        title: selectedTask.title,
        description: selectedTask.description || '',
        priority: selectedTask.priority || 'medium',
        status: selectedTask.status || 'todo',
        dueDate: selectedTask.dueDate ? format(new Date(selectedTask.dueDate), 'yyyy-MM-dd') : '',
        assignedTo: selectedTask.assignedTo?.map(u => u._id) || [],
        labels: selectedTask.labels || [],
      });
    }
  }, [selectedTask]);

  const handleSave = async () => {
    if (!selectedTask) return;

    try {
      await dispatch(updateTask({
        id: selectedTask._id,
        ...editedTask,
        dueDate: editedTask.dueDate || undefined,
      })).unwrap();

      toast.success('Task updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTask) return;

    try {
      await dispatch(addTaskComment({
        taskId: selectedTask._id,
        content: newComment.trim(),
      })).unwrap();

      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedTask) return;

    try {
      await dispatch(deleteTaskComment({
        taskId: selectedTask._id,
        commentId,
      })).unwrap();

      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleAddLabel = () => {
    if (!newLabel.trim()) return;

    setEditedTask({
      ...editedTask,
      labels: [...editedTask.labels, newLabel.trim()],
    });
    setNewLabel('');
  };

  const handleRemoveLabel = (label: string) => {
    setEditedTask({
      ...editedTask,
      labels: editedTask.labels.filter(l => l !== label),
    });
  };

  const handleAssignUser = (userId: string) => {
    if (editedTask.assignedTo.includes(userId)) {
      setEditedTask({
        ...editedTask,
        assignedTo: editedTask.assignedTo.filter(id => id !== userId),
      });
    } else {
      setEditedTask({
        ...editedTask,
        assignedTo: [...editedTask.assignedTo, userId],
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'in_review': return 'bg-purple-100 text-purple-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!selectedTask || isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isEditing ? (
              <input
                type="text"
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="text-xl font-bold border-b-2 border-blue-500 focus:outline-none"
              />
            ) : (
              <h2 className="text-xl font-bold">{selectedTask.title}</h2>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-6 p-6">
            {/* Main Content */}
            <div className="col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                {isEditing ? (
                  <textarea
                    value={editedTask.description}
                    onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    rows={4}
                    placeholder="Add a description..."
                  />
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedTask.description || 'No description'}
                  </p>
                )}
              </div>

              {/* Labels */}
              <div>
                <h3 className="font-semibold mb-2">Labels</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editedTask.labels.map((label) => (
                    <span
                      key={label}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center"
                    >
                      {label}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveLabel(label)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddLabel()}
                      placeholder="Add label..."
                      className="px-2 py-1 border rounded"
                    />
                    <button
                      onClick={handleAddLabel}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* Comments */}
              <div>
                <h3 className="font-semibold mb-2">Comments ({selectedTask.comments?.length || 0})</h3>

                {/* Add Comment */}
                <div className="mb-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full p-2 border rounded-md"
                    rows={3}
                  />
                  <button
                    onClick={handleAddComment}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    disabled={!newComment.trim()}
                  >
                    Add Comment
                  </button>
                </div>

                {/* Comments List */}
                <div className="space-y-3">
                  {selectedTask.comments?.map((comment) => (
                    <div key={comment._id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium">{comment.user?.name || 'Unknown'}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                          </span>
                          {comment.user?._id === user?.id && (
                            <button
                              onClick={() => handleDeleteComment(comment._id!)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity History */}
              <div>
                <h3 className="font-semibold mb-2">Activity History</h3>
                <div className="space-y-2">
                  {selectedTask.activityHistory?.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-1.5"></div>
                      <div>
                        <span className="font-medium">{activity.user?.name || 'Unknown'}</span>
                        <span className="text-gray-600"> {activity.action}</span>
                        {activity.field && (
                          <span className="text-gray-600"> {activity.field}</span>
                        )}
                        {activity.oldValue && activity.newValue && (
                          <span className="text-gray-600">
                            {' from '}<span className="font-medium">{activity.oldValue}</span>
                            {' to '}<span className="font-medium">{activity.newValue}</span>
                          </span>
                        )}
                        <span className="text-gray-500 ml-2">
                          {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-semibold mb-2">Status</label>
                {isEditing ? (
                  <select
                    value={editedTask.status}
                    onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as any })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="in_review">In Review</option>
                    <option value="done">Done</option>
                  </select>
                ) : (
                  <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(selectedTask.status || 'todo')}`}>
                    {selectedTask.status?.replace('_', ' ').toUpperCase() || 'TODO'}
                  </span>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold mb-2">Priority</label>
                {isEditing ? (
                  <select
                    value={editedTask.priority}
                    onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as any })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                ) : (
                  <span className={`px-2 py-1 rounded-full text-sm ${getPriorityColor(selectedTask.priority || 'medium')}`}>
                    {selectedTask.priority?.toUpperCase() || 'MEDIUM'}
                  </span>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-semibold mb-2">Due Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editedTask.dueDate}
                    onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                ) : (
                  <p className="text-sm">
                    {selectedTask.dueDate
                      ? format(new Date(selectedTask.dueDate), 'MMM dd, yyyy')
                      : 'No due date'}
                  </p>
                )}
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-sm font-semibold mb-2">Assigned To</label>
                {isEditing ? (
                  <div className="space-y-2">
                    {currentProject?.members.map((member) => (
                      <label key={member.user} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editedTask.assignedTo.includes(member.user)}
                          onChange={() => handleAssignUser(member.user)}
                          className="rounded"
                        />
                        <span className="text-sm">{member.user}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {selectedTask.assignedTo?.length > 0 ? (
                      selectedTask.assignedTo.map((user) => (
                        <div key={user._id} className="text-sm">{user.name}</div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Unassigned</p>
                    )}
                  </div>
                )}
              </div>

              {/* Created Info */}
              <div className="text-xs text-gray-500 pt-4 border-t">
                <p>Created by: {selectedTask.createdBy?.name || 'Unknown'}</p>
                <p>Created: {format(new Date(selectedTask.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                <p>Updated: {format(new Date(selectedTask.updatedAt), 'MMM dd, yyyy HH:mm')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-3 flex justify-end space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
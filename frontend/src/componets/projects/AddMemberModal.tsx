import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../../redux/hooks';
import { addProjectMember, fetchProjectById } from '../../redux/slices/projectSlice';

interface AddMemberModalProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ projectId, projectName, onClose }) => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      toast.error('Email is required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      await dispatch(addProjectMember({
        projectId,
        email: trimmedEmail,
        role,
      })).unwrap();

      // Refresh project data to show updated members
      await dispatch(fetchProjectById(projectId));

      toast.success(`User added to ${projectName} successfully`);
      setEmail('');
      onClose();
    } catch (error: any) {
      toast.error(error || 'Failed to add member');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute top-16 right-6 z-50">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add Member to {projectName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter member's email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'member' | 'viewer')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="admin">Admin - Can manage project and members</option>
              <option value="member">Member - Can create and edit tasks</option>
              <option value="viewer">Viewer - Can only view tasks</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
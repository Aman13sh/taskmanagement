import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { updateProject, deleteProject, removeProjectMember } from '../../redux/slices/projectSlice';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface ProjectSettingsProps {
  projectId: string;
  onClose: () => void;
}

export const ProjectSettings: React.FC<ProjectSettingsProps> = ({ projectId, onClose }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentProject } = useAppSelector((state) => state.projects);
  const { user } = useAppSelector((state) => state.auth);

  const [projectName, setProjectName] = useState(currentProject?.name || '');
  const [projectDescription, setProjectDescription] = useState(currentProject?.description || '');
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = currentProject?.owner === user?.id ||
    (typeof currentProject?.owner === 'object' && currentProject?.owner._id === user?.id);

  const handleUpdateProject = async () => {
    try {
      await dispatch(updateProject({
        id: projectId,
        name: projectName,
        description: projectDescription,
      })).unwrap();
      toast.success('Project updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update project');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm(`Are you sure you want to delete "${currentProject?.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsDeleting(true);
      await dispatch(deleteProject(projectId)).unwrap();
      toast.success('Project deleted successfully');
      navigate('/projects');
    } catch (error) {
      toast.error('Failed to delete project');
      setIsDeleting(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await dispatch(removeProjectMember({ projectId, userId })).unwrap();
      toast.success('Member removed successfully');
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner': return 'Owner';
      case 'admin': return 'Admin';
      case 'member': return 'Member';
      case 'viewer': return 'Viewer';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'member': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!currentProject) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Project Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Project Details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Project Details</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isOwner}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                disabled={!isOwner}
              />
            </div>
            {isOwner && (
              <button
                onClick={handleUpdateProject}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>

        {/* Members */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Members</h3>
          <div className="space-y-2">
            {/* Owner */}
            {currentProject.owner && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-medium">
                    {typeof currentProject.owner === 'object'
                      ? currentProject.owner.name?.charAt(0).toUpperCase()
                      : 'O'
                    }
                  </div>
                  <div>
                    <div className="font-medium">
                      {typeof currentProject.owner === 'object'
                        ? currentProject.owner.name
                        : 'Project Owner'
                      }
                    </div>
                    <div className="text-sm text-gray-500">
                      {typeof currentProject.owner === 'object'
                        ? currentProject.owner.email
                        : ''
                      }
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor('owner')}`}>
                  {getRoleLabel('owner')}
                </span>
              </div>
            )}

            {/* Other Members */}
            {currentProject.members?.map((member) => (
              <div key={member.user._id || member.user} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-medium">
                    {typeof member.user === 'object' && member.user.name
                      ? member.user.name.charAt(0).toUpperCase()
                      : 'U'
                    }
                  </div>
                  <div>
                    <div className="font-medium">
                      {typeof member.user === 'object' && member.user.name
                        ? member.user.name
                        : 'User'
                      }
                    </div>
                    <div className="text-sm text-gray-500">
                      {typeof member.user === 'object' && member.user.email
                        ? member.user.email
                        : ''
                      }
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(member.role)}`}>
                    {getRoleLabel(member.role)}
                  </span>
                  {isOwner && (
                    <button
                      onClick={() => handleRemoveMember(
                        typeof member.user === 'object' ? member.user._id : member.user
                      )}
                      className="text-red-500 hover:text-red-700"
                      title="Remove member"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {(!currentProject.members || currentProject.members.length === 0) && (
              <p className="text-gray-500 text-sm">No other members in this project</p>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        {isOwner && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3 text-red-600">Danger Zone</h3>
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <p className="text-sm text-gray-700 mb-3">
                Once you delete a project, there is no going back. All tasks and data will be permanently deleted.
              </p>
              <button
                onClick={handleDeleteProject}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
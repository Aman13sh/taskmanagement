import React, { useState, useEffect } from "react";
import { getProjectById, removeUserFromProject } from "../../api/projects/project.api";
import type { IProject } from "../../api/projects/project.types";
import { toast } from "react-toastify";
import InviteMemberModal from "./InviteMemberModal";

interface ProjectDetailProps {
  projectId: string;
  currentUserId?: string; // Pass current user ID to identify if user is owner
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, currentUserId }) => {
  const [project, setProject] = useState<IProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const data = await getProjectById(projectId);
      setProject(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch project details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!project) return;

    if (!window.confirm(`Are you sure you want to remove ${userName} from the project?`)) {
      return;
    }

    try {
      await removeUserFromProject(project._id, userId);
      toast.success(`${userName} has been removed from the project`);
      fetchProject(); // Refresh project details
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove member");
    }
  };

  const handleInviteSuccess = () => {
    setShowInviteModal(false);
    fetchProject(); // Refresh to show new member
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  const isOwner = project.owner._id === currentUserId;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{project.name}</h2>
            {project.description && (
              <p className="text-gray-600">{project.description}</p>
            )}
          </div>
          {isOwner && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Invite Member
            </button>
          )}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Team Members ({project.members.length})</h3>

        <div className="space-y-3">
          {project.members.map((member) => (
            <div
              key={member.user._id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                  {member.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{member.user.name}</p>
                  <p className="text-sm text-gray-500">{member.user.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  member.role === 'owner'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {member.role === 'owner' ? 'Owner' : 'Member'}
                </span>

                {isOwner && member.role !== 'owner' && (
                  <button
                    onClick={() => handleRemoveMember(member.user._id, member.user.name)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove member"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showInviteModal && project && (
        <InviteMemberModal
          project={project}
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
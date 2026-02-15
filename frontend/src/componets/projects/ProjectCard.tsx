import React from "react";
import type { IProject } from "../../api/projects/project.types";

interface ProjectCardProps {
  project: IProject;
  onDelete: (projectId: string) => void;
  onEdit: (project: IProject) => void;
  onSelect: (project: IProject) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete, onEdit, onSelect }) => {
  const isOwner = project.members.find(m => m.role === "owner")?.user._id === project.owner._id;
  const memberCount = project.members.length;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <h3
          className="text-xl font-semibold text-gray-800 cursor-pointer hover:text-blue-600"
          onClick={() => onSelect(project)}
        >
          {project.name}
        </h3>
        <div className="flex space-x-2">
          {isOwner && (
            <>
              <button
                onClick={() => onEdit(project)}
                className="text-gray-600 hover:text-blue-600"
                title="Edit Project"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(project._id)}
                className="text-gray-600 hover:text-red-600"
                title="Delete Project"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {project.description && (
        <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
      )}

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          isOwner ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {isOwner ? 'Owner' : 'Member'}
        </span>
      </div>

      <button
        onClick={() => onSelect(project)}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Open Board
      </button>
    </div>
  );
};

export default ProjectCard;
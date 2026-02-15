import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProjects, deleteProject } from "../../api/projects/project.api";
import type { IProject } from "../../api/projects/project.types";
import { toast } from "react-toastify";
import ProjectCard from "./ProjectCard";
import CreateProjectModal from "./CreateProjectModal";

const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<IProject | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getUserProjects();
      setProjects(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteProject(projectId);
      toast.success("Project deleted successfully");
      fetchProjects(); // Refresh the list
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete project");
    }
  };

  const handleProjectCreated = () => {
    setShowCreateModal(false);
    fetchProjects(); // Refresh the list
  };

  const handleProjectUpdated = () => {
    setSelectedProject(null);
    fetchProjects(); // Refresh the list
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Projects</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No projects yet. Create your first project!</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onDelete={handleDeleteProject}
              onEdit={(project) => setSelectedProject(project)}
              onSelect={(project) => {
                // Navigate to project board
                navigate(`/board/${project._id}`);
              }}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleProjectCreated}
        />
      )}

      {selectedProject && (
        <CreateProjectModal
          onClose={() => setSelectedProject(null)}
          onSuccess={handleProjectUpdated}
          project={selectedProject}
          isEdit={true}
        />
      )}
    </div>
  );
};

export default ProjectList;
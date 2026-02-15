import api from "../api";
import type{
  IProject,
  CreateProjectRequest,
  InviteUserRequest,
  UpdateProjectRequest,
} from "./project.types";

// Create a new project
export const createProject = async (data: CreateProjectRequest): Promise<{ message: string; project: IProject }> => {
  const response = await api.post("/projects", data);
  return response.data;
};

// Get all user's projects
export const getUserProjects = async (): Promise<IProject[]> => {
  const response = await api.get("/projects");
  return response.data;
};

// Get single project by ID
export const getProjectById = async (projectId: string): Promise<IProject> => {
  const response = await api.get(`/projects/${projectId}`);
  return response.data;
};

// Invite user to project
export const inviteUserToProject = async (
  projectId: string,
  data: InviteUserRequest
): Promise<{ message: string; project: IProject }> => {
  const response = await api.post(`/projects/${projectId}/invite`, data);
  return response.data;
};

// Remove user from project
export const removeUserFromProject = async (
  projectId: string,
  userId: string
): Promise<{ message: string; project: IProject }> => {
  const response = await api.delete(`/projects/${projectId}/members/${userId}`);
  return response.data;
};

// Update project
export const updateProject = async (
  projectId: string,
  data: UpdateProjectRequest
): Promise<{ message: string; project: IProject }> => {
  const response = await api.patch(`/projects/${projectId}`, data);
  return response.data;
};

// Delete project
export const deleteProject = async (projectId: string): Promise<{ message: string }> => {
  const response = await api.delete(`/projects/${projectId}`);
  return response.data;
};
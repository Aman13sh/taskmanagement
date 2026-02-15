import { Router } from "express";
import { verifyAccessToken } from "../middleware/auth.middleware";
import { verifyProjectMember } from "../middleware/projectaccess.middleware";
import {
  createProject,
  getUserProjects,
  getProjectById,
  inviteUserToProject,
  removeUserFromProject,
  updateProject,
  deleteProject,
} from "../controller/project.controller";

const router = Router();

// All project routes require authentication
router.use(verifyAccessToken);

// Routes that don't require project access middleware
router.post("/", createProject); // Create new project
router.get("/", getUserProjects); // Get all user's projects

// Routes that require project access middleware
router.get("/:projectId", verifyProjectMember, getProjectById); // Get single project
router.post("/:projectId/invite", verifyProjectMember, inviteUserToProject); // Invite user by email
router.delete("/:projectId/members/:userId", verifyProjectMember, removeUserFromProject); // Remove member
router.patch("/:projectId", verifyProjectMember, updateProject); // Update project
router.delete("/:projectId", verifyProjectMember, deleteProject); // Delete project

export default router;
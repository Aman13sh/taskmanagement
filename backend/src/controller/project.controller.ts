import { Request, Response } from "express";
import Project, { IProject } from "../models/project.model";
import User from "../models/user.model";
import mongoose from "mongoose";

// Extend Request to include user
interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

// Create a new project
export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const ownerId = req.user?.userId;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const project = new Project({
      name: name.trim(),
      description: description?.trim(),
      owner: ownerId,
      members: [
        {
          user: ownerId,
          role: "owner",
        },
      ],
    });

    await project.save();
    await project.populate("members.user", "name email");

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Error creating project" });
  }
};

// Get all projects for the authenticated user
export const getUserProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const projects = await Project.find({
      "members.user": userId,
    })
      .populate("owner", "name email")
      .populate("members.user", "name email")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Error fetching projects" });
  }
};

// Get a single project by ID
export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate("owner", "name email")
      .populate("members.user", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: "Error fetching project" });
  }
};

// Invite user to project by email
export const inviteUserToProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { email, role } = req.body;
    const currentUserId = req.user?.userId;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Validate role (default to 'member' if not provided)
    const validRoles = ['admin', 'member', 'viewer'];
    const memberRole = validRoles.includes(role) ? role : 'member';

    // Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if current user is the owner
    if (project.owner.toString() !== currentUserId) {
      return res.status(403).json({ message: "Only project owner can invite members" });
    }

    // Find user by email
    const userToInvite = await User.findOne({ email: email.toLowerCase() });
    if (!userToInvite) {
      return res.status(404).json({ message: "User with this email not found. They must register first." });
    }

    // Check if user is already a member
    const isAlreadyMember = project.members.some(
      (member) => member.user.toString() === userToInvite._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({ message: "User is already a member of this project" });
    }

    // Add user as member with specified role
    project.members.push({
      user: userToInvite._id as mongoose.Types.ObjectId,
      role: memberRole as "owner" | "admin" | "member" | "viewer",
    });

    await project.save();
    await project.populate("members.user", "name email");

    res.json({
      message: `User ${userToInvite.name} has been invited to the project`,
      project,
    });
  } catch (error) {
    console.error("Error inviting user:", error);
    res.status(500).json({ message: "Error inviting user to project" });
  }
};

// Remove user from project
export const removeUserFromProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, userId } = req.params;
    const currentUserId = req.user?.userId;

    // Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if current user is the owner
    if (project.owner.toString() !== currentUserId) {
      return res.status(403).json({ message: "Only project owner can remove members" });
    }

    // Prevent owner from removing themselves
    if (userId === currentUserId) {
      return res.status(400).json({ message: "Owner cannot remove themselves from the project" });
    }

    // Remove the user from members array
    project.members = project.members.filter(
      (member) => member.user.toString() !== userId
    );

    await project.save();
    await project.populate("members.user", "name email");

    res.json({
      message: "User removed from project successfully",
      project,
    });
  } catch (error) {
    console.error("Error removing user:", error);
    res.status(500).json({ message: "Error removing user from project" });
  }
};

// Update project
export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { name, description } = req.body;
    const currentUserId = req.user?.userId;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if current user is the owner
    if (project.owner.toString() !== currentUserId) {
      return res.status(403).json({ message: "Only project owner can update project details" });
    }

    // Update fields
    if (name) project.name = name.trim();
    if (description !== undefined) project.description = description?.trim();

    await project.save();
    await project.populate("members.user", "name email");

    res.json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Error updating project" });
  }
};

// Delete project
export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const currentUserId = req.user?.userId;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if current user is the owner
    if (project.owner.toString() !== currentUserId) {
      return res.status(403).json({ message: "Only project owner can delete the project" });
    }

    // Delete the project and all related data (tasks, columns will be handled by cascading)
    await Project.findByIdAndDelete(projectId);

    // TODO: Also delete related columns and tasks (add this when implementing cascading deletes)

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Error deleting project" });
  }
};
import { Response, NextFunction } from "express";
import Project from "../models/project.model";
import { AuthRequest } from "./auth.middleware";

export const verifyProjectMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user is either the owner or a member
    const isOwner = project.owner.toString() === userId;
    const isMember = project.members.some(
      (member) => member.user.toString() === userId
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "Access denied. Not a project member.",
      });
    }

    next();
  } catch (error) {
    console.error("Project access middleware error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

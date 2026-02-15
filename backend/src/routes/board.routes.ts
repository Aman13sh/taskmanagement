import { Router } from "express";
import { verifyAccessToken } from "../middleware/auth.middleware";
import { verifyProjectMember } from "../middleware/projectaccess.middleware";
import {
  createColumn,
  getBoard,
  createTask,
  moveTask,
  deleteTask,
  getTaskById,
  updateTask,
  addComment,
  deleteComment,
  searchTasks
} from "../controller/board.controller";

const router = Router();

// Protect all board routes
router.use(verifyAccessToken);

// Routes that require project membership
router.post("/:projectId/columns", verifyProjectMember, createColumn);
router.get("/:projectId", verifyProjectMember, getBoard);
router.post("/:projectId/tasks", verifyProjectMember, createTask);

// Search and filter tasks
router.get("/:projectId/search", verifyProjectMember, searchTasks);

// Task operations (these don't have projectId in params, so we'll need to handle differently)
router.get("/tasks/:taskId", getTaskById);
router.patch("/tasks/:taskId", updateTask);
router.patch("/tasks/:taskId/move", moveTask);
router.delete("/tasks/:taskId", deleteTask);

// Comment operations
router.post("/tasks/:taskId/comments", addComment);
router.delete("/tasks/:taskId/comments/:commentId", deleteComment);

export default router;

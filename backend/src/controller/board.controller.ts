import { Request, Response } from "express";
import Column from "../models/coulmns.models";
import Task, { ITask, IActivityLog } from "../models/Tasks.modles";
import User from "../models/user.model";

interface AuthRequest extends Request {
  user?: { userId: string };
}

export const createColumn = async (req: Request, res: Response) => {
  const { name, order } = req.body;
  const { projectId } = req.params;

  const column = await Column.create({
    name: name.trim(),
    project: projectId,
    order,
  });

  res.status(201).json(column);
};

export const getBoard = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const columns = await Column.find({ project: projectId })
      .sort({ order: 1 })
      .lean();

    const tasks = await Task.find({ project: projectId })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ order: 1 })
      .lean();

    const board = columns.map((column) => ({
      ...column,
      tasks: tasks.filter(
        (task) => task.column.toString() === column._id.toString()
      ),
    }));

    res.json(board);
  } catch (error) {
    console.error("Error fetching board:", error);
    res.status(500).json({ message: "Failed to fetch board" });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      columnId,
      order,
      priority,
      dueDate,
      assignedTo,
      labels
    } = req.body;
    const { projectId } = req.params;
    const userId = req.user?.userId;

    const task = await Task.create({
      title: title.trim(),
      description: description || "",
      project: projectId,
      column: columnId,
      order,
      status: "todo",
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : undefined,
      assignedTo: assignedTo || [],
      labels: labels || [],
      comments: [],
      attachments: [],
      createdBy: userId,
      activityHistory: [{
        user: userId,
        action: "created",
        timestamp: new Date()
      }]
    });

    // Populate user info
    await task.populate([
      { path: "assignedTo", select: "name email" },
      { path: "createdBy", select: "name email" }
    ]);

    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Failed to create task" });
  }
};

export const moveTask = async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { newColumnId, newOrder } = req.body;

  const task = await Task.findById(taskId);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  task.column = newColumnId;
  task.order = newOrder;

  await task.save();

  res.json({ message: "Task moved successfully" });
};

export const deleteTask = async (req: Request, res: Response) => {
  const { taskId } = req.params;

  await Task.findByIdAndDelete(taskId);

  res.json({ message: "Task deleted" });
};

// Get single task with full details
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("comments.user", "name email")
      .populate("activityHistory.user", "name email");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ message: "Failed to fetch task" });
  }
};

// Update task details
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.user?.userId;
    const updates = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Track changes for activity history
    const activityLogs: IActivityLog[] = [];
    const fieldsToTrack = ['title', 'description', 'priority', 'dueDate', 'status', 'assignedTo', 'labels'];

    fieldsToTrack.forEach(field => {
      const taskAny = task as any;
      if (updates[field] !== undefined && taskAny[field] !== updates[field]) {
        activityLogs.push({
          user: userId as any,
          action: 'updated',
          field,
          oldValue: taskAny[field],
          newValue: updates[field],
          timestamp: new Date()
        });
      }
    });

    // Apply updates
    Object.keys(updates).forEach(key => {
      if (fieldsToTrack.includes(key)) {
        (task as any)[key] = updates[key];
      }
    });

    // Add activity logs
    task.activityHistory.push(...activityLogs);

    await task.save();

    // Populate and return
    await task.populate([
      { path: "assignedTo", select: "name email" },
      { path: "createdBy", select: "name email" },
      { path: "activityHistory.user", select: "name email" }
    ]);

    res.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Failed to update task" });
  }
};

// Add comment to task
export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Add comment
    task.comments.push({
      user: userId as any,
      content,
      createdAt: new Date()
    });

    // Add to activity history
    task.activityHistory.push({
      user: userId as any,
      action: 'commented',
      newValue: content,
      timestamp: new Date()
    });

    await task.save();

    // Populate and return
    await task.populate([
      { path: "comments.user", select: "name email" },
      { path: "activityHistory.user", select: "name email" }
    ]);

    res.json(task);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

// Delete comment from task
export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, commentId } = req.params;
    const userId = req.user?.userId;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Remove comment
    task.comments = task.comments.filter(c => c._id?.toString() !== commentId);

    // Add to activity history
    task.activityHistory.push({
      user: userId as any,
      action: 'deleted_comment',
      timestamp: new Date()
    });

    await task.save();
    res.json(task);
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Failed to delete comment" });
  }
};

// Search and filter tasks
export const searchTasks = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const {
      text,
      status,
      priority,
      assignedTo,
      dueDateFrom,
      dueDateTo,
      labels
    } = req.query;

    // Build query
    const query: any = { project: projectId };

    // Text search
    if (text) {
      query.$text = { $search: text as string };
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Priority filter
    if (priority) {
      query.priority = priority;
    }

    // Assigned user filter
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    // Due date range filter
    if (dueDateFrom || dueDateTo) {
      query.dueDate = {};
      if (dueDateFrom) {
        query.dueDate.$gte = new Date(dueDateFrom as string);
      }
      if (dueDateTo) {
        query.dueDate.$lte = new Date(dueDateTo as string);
      }
    }

    // Labels filter
    if (labels) {
      const labelArray = Array.isArray(labels) ? labels : [labels];
      query.labels = { $in: labelArray };
    }

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email")
      .populate("column", "name")
      .sort({ updatedAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error("Error searching tasks:", error);
    res.status(500).json({ message: "Failed to search tasks" });
  }
};

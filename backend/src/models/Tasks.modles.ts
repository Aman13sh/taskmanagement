import mongoose, { Schema, Document } from "mongoose";

export interface IComment {
  _id?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface IActivityLog {
  user: mongoose.Types.ObjectId;
  action: string;
  field?: string;
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
}

export interface ITask extends Document {
  title: string;
  description?: string;
  project: mongoose.Types.ObjectId;
  column: mongoose.Types.ObjectId;
  order: number; // position inside column
  status: "todo" | "in_progress" | "in_review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: Date;
  assignedTo: mongoose.Types.ObjectId[];
  labels: string[];
  attachments: string[];
  comments: IComment[];
  activityHistory: IActivityLog[];
  createdBy: mongoose.Types.ObjectId;
}

const commentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const activityLogSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  field: String,
  oldValue: Schema.Types.Mixed,
  newValue: Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    column: {
      type: Schema.Types.ObjectId,
      ref: "Column",
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "in_review", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    dueDate: Date,
    assignedTo: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    labels: [String],
    attachments: [String],
    comments: [commentSchema],
    activityHistory: [activityLogSchema],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

// Index for searching
taskSchema.index({ title: 'text', description: 'text' });
taskSchema.index({ project: 1, column: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });

export default mongoose.model<ITask>("Task", taskSchema);

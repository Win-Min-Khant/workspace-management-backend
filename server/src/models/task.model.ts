import mongoose, { Schema, Types } from "mongoose";

export interface ITask extends mongoose.Document {
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  projectId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  assigneeId?: Types.ObjectId | null;
  assignedBy?: Types.ObjectId | null;
  assignedAt: Date;
  dueDate?: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: String,
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    assignedBy: { type: Schema.Types.ObjectId, ref: "User" },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedAt: { type: Date },
    dueDate: Date,
  },
  { timestamps: true },
);

export const Task = mongoose.model<ITask>("Task", taskSchema);

import mongoose, { mongo, Schema } from "mongoose";

export interface IComment extends Document {
  content: string;
  authorId: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
}

const commentSchema = new mongoose.Schema<IComment>(
  {
    content: {
      type: String,
      required: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
  },
  { timestamps: true },
);

export const Comment = mongoose.model<IComment>("Comment", commentSchema);

import { Comment } from "../models/comment.model.js";
import { Task } from "../models/task.model.js";
import { UserWorkspace } from "../models/user_workspace.model.js";
import { AppError } from "../utils/appError.js";

export class CommentService {
  static async addComment(
    content: string,
    authorId: string,
    taskId: string,
    workspaceId: string,
  ) {
    if (!content) throw new AppError(400, "Comment content is required.");

    const task = await Task.findOne({ _id: taskId, workspaceId });
    if (!task) throw new AppError(404, "Task not found.");

    const membership = await UserWorkspace.findOne({
      userId: authorId,
      workspaceId,
    });
    if (!membership)
      throw new AppError(403, "You are not a member of this workspace.");

    const isAssignee = task.assigneeId?.toString() === authorId;
    if (
      membership.role !== "owner" &&
      membership.role !== "admin" &&
      !isAssignee
    ) {
      throw new AppError(403, "You can only comment on tasks assigned to you.");
    }

    const comment = await Comment.create({
      content,
      authorId,
      taskId,
      workspaceId,
    });

    return comment;
  }

  // delete comment — author or owner/admin can delete
  static async deleteComment(
    commentId: string,
    userId: string,
    workspaceId: string,
  ) {
    const comment = await Comment.findById(commentId);
    if (!comment) throw new AppError(404, "Comment not found.");

    const isAuthor = comment.authorId.toString() === userId;

    if (!isAuthor) {
      // check if user has elevated role before rejecting
      const membership = await UserWorkspace.findOne({ userId, workspaceId });
      const isPrivileged =
        membership?.role === "owner" || membership?.role === "admin";

      if (!isPrivileged) {
        throw new AppError(
          403,
          "You do not have permission to delete this comment.",
        );
      }
    }

    await Comment.findByIdAndDelete(commentId);
    return { message: "Comment deleted successfully." };
  }

  // get comments
  static async getComments(
    taskId: string,
    workspaceId: string,
    userId: string,
  ) {
    const task = await Task.findOne({ _id: taskId, workspaceId });
    if (!task) throw new AppError(404, "Task not found.");

    const membership = await UserWorkspace.findOne({ userId, workspaceId });
    if (!membership)
      throw new AppError(403, "You are not a member of this workspace.");

    const isAssignee = task.assigneeId?.toString() === userId;
    if (
      membership.role !== "owner" &&
      membership.role !== "admin" &&
      !isAssignee
    ) {
      throw new AppError(
        403,
        "You are not authorized to view this task's comments.",
      );
    }

    const comments = await Comment.find({ taskId })
      .populate("authorId", "name avatar")
      .sort({ createdAt: 1 });

    return comments;
  }

  static async updateComment(
    commentId: string,
    userId: string,
    content: string,
  ) {
    if (!content) throw new AppError(400, "Comment content is required.");

    const comment = await Comment.findById(commentId);
    if (!comment) throw new AppError(404, "Comment not found.");

    if (comment.authorId.toString() !== userId) {
      throw new AppError(403, "You can only edit your own comments.");
    }

    comment.content = content;
    await comment.save();

    return comment;
  }
}

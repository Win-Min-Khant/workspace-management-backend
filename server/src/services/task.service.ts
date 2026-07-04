import mongoose from "mongoose";
import { ProjectMember } from "../models/project_member.model.js";
import { Task } from "../models/task.model.js";
import { UserWorkspace } from "../models/user_workspace.model.js";
import { AppError } from "../utils/appError.js";
import { Project } from "../models/project.model.js";
import { Activity } from "./activity.service.js";
import { Comment } from "../models/comment.model.js";
import { Notification } from "../models/notification.model.js";

interface CreateTaskDTO {
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  workspaceId: string;
  projectId: string;
  assigneeId?: string | null;
  assignedBy?: string | null;
  assignedAt: Date | null;
  dueDate?: Date | null;
}

interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: "todo" | "in-progress" | "done";
  priority?: "low" | "medium" | "high";
  assigneeId?: string;
  dueDate?: Date;
}

interface UpdateStatusDTO {
  status?: "todo" | "in-progress" | "done";
}

export class TaskService {
  // create task
  static async createTask(data: CreateTaskDTO) {
    const { projectId, assigneeId, workspaceId, assignedBy } = data;
    const project = await Project.findOne({ _id: projectId, workspaceId });
    if (!project) throw new AppError(404, "Project not found.");

    if (assigneeId) {
      const isProjectMember = await ProjectMember.findOne({
        projectId,
        userId: assigneeId,
      });
      if (!isProjectMember)
        throw new AppError(400, "Assignee is not a member of this project.");
    }

    const task = await Task.create({
      title: data.title,
      description: data.description || "",
      status: data.status || "todo",
      priority: data.priority || "medium",
      projectId: data.projectId,
      workspaceId: data.workspaceId,
      assigneeId: data.assigneeId || null,
      assignedBy: data.assignedBy || null,
      assignedAt: data.assignedAt || new Date(),
      dueDate: data.dueDate || null,
    });

    if (assigneeId) {
      await Notification.create({
        userId: assigneeId,
        workspaceId,
        taskId: task._id,
        message: `You have been assigned to task '${task.title}'.`,
      }).catch((err) => console.error("Notification creation failed:", err));
    }

    await Activity.logActivity(
      workspaceId,
      data.assignedBy!,
      "TASK_CREATED",
      task._id.toString(),
      "TASK",
      `Task '${task.title}' was created.`,
    );

    return task;
  }

  // view tasks by query
  // static async getAllTasks(workspaceId: string, projectId: string, user: any) {
  //   let query: any = { workspaceId, projectId };
  //   const userId = user.userId;
  //   const membership = await UserWorkspace.findOne({
  //     userId: String(userId),
  //     workspaceId: String(workspaceId),
  //   });
  //   if (!membership)
  //     throw new AppError(404, "You don't have access to the workspace.");
  //   if (membership.role === "member") {
  //     query.assigneeId = membership._id;
  //   }
  //   return await Task.find(query)
  //     .populate("assigneeId", "name email")
  //     .sort({ createdAt: -1 });
  // }
  static async getTasksByQuery(
    workspaceId: string,
    userId: string,
    role: string,
    projectId?: string,
    search?: string,
    status?: string,
    priority?: string,
    assigneeId?: string,
  ) {
    const query: any = {
      workspaceId,
    };

    if (role !== "owner" && role !== "admin") {
      query.assigneeId = userId;
    }

    if (projectId) query.projectId = projectId;

    if (search) query.title = { $regex: search, $options: "i" };
    if (status) query.status = status;
    if (priority) query.priority = priority;

    if ((role === "owner" || role === "admin") && assigneeId) {
      query.assigneeId = assigneeId;
    }

    return await Task.find(query)
      .select("title priority status dueDate assigneeId assignedBy projectId")
      .populate("assigneeId", "name avatar")
      .populate("assignedBy", "name")
      .sort({ createdAt: -1 });
  }

  // update task
  static async updateTask(
    taskId: string,
    workspaceId: string,
    projectId: string,
    updateData: UpdateTaskDTO,
  ) {
    const formattedData: any = {};
    if (updateData.title !== undefined) formattedData.title = updateData.title;
    if (updateData.description !== undefined)
      formattedData.description = updateData.description;
    if (updateData.status !== undefined)
      formattedData.status = updateData.status;
    if (updateData.priority !== undefined)
      formattedData.priority = updateData.priority;
    if (updateData.assigneeId !== undefined)
      formattedData.assigneeId = updateData.assigneeId;
    if (updateData.dueDate !== undefined)
      formattedData.dueDate = new Date(updateData.dueDate);
    if (Object.keys(formattedData).length === 0) {
      throw new AppError(400, "No update data provided.");
    }
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, workspaceId, projectId },
      { $set: formattedData },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedTask) throw new AppError(404, "Task not found.");

    if (updateData.assigneeId && updatedTask) {
      await Notification.create({
        userId: updateData.assigneeId,
        workspaceId,
        taskId: taskId,
        message: `You have been assigned to task '${updatedTask.title}'.`,
      }).catch((err) => console.error("Notification creation failed:", err));
    }

    return updatedTask;
  }

  // update status
  static async updateTaskStatus(
    taskId: string,
    userId: string,
    workspaceId: string,
    projectId: string,
    data: UpdateStatusDTO,
  ) {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, assigneeId: userId, workspaceId, projectId },
      { $set: { status: data.status } },
      { returnDocument: "after", runValidators: true },
    );
    if (!updatedTask) {
      throw new AppError(
        404,
        "Task not found or you are not assigned to this task.",
      );
    }

    await Activity.logActivity(
      workspaceId,
      userId,
      "TASK_STATUS_CHANGED",
      taskId,
      "TASK",
      `Task status changed to '${data.status}'.`,
    ).catch((err) => console.error("Activity log failed:", err));

    return updatedTask;
  }

  // delete task
  static async deleteTask(
    userId: string,
    taskId: string,
    workspaceId: string,
    projectId: string,
  ) {
    const task = await Task.findOne({ _id: taskId, workspaceId, projectId });
    if (!task) throw new AppError(404, "Task not found.");
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await Task.deleteOne({ _id: taskId, workspaceId, projectId }).session(
        session,
      );
      await Comment.deleteMany({ taskId }).session(session);
      await Notification.deleteMany({ taskId }).session(session);
      await session.commitTransaction();
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      session.endSession();
    }
    await Activity.logActivity(
      workspaceId,
      userId,
      "TASK_DELETED",
      taskId,
      "TASK",
      `Task '${task.title}' was deleted.`,
    ).catch((err) => console.error("Activity log failed:", err));
    return task;
  }
}

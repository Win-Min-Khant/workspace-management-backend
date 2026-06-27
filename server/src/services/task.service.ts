//  title: string;
//   description?: string;
//   status: "todo" | "in-progress" | "done";
//   priority: "low" | "medium" | "high";
//   projectId: Types.ObjectId;
//   workspaceId: Types.ObjectId;
//   assigneeId?: Types.ObjectId;
//   dueDate?: Date;

import mongoose from "mongoose";
import { Project } from "../models/project.model.js";
import { ProjectMember } from "../models/project_member.model.js";
import { Task } from "../models/task.model.js";

interface CreateTaskDTO {
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  workspaceId: string;
  projectId: string;
  assigneeId?: string;
  assignedBy?: string;
  assignedAt: Date;
  dueDate?: Date;
}

export class TaskService {
  static async createTask(data: CreateTaskDTO) {
    const { projectId, assigneeId, workspaceId } = data;

    const project = await ProjectMember.findOne({
      userId: new mongoose.Types.ObjectId(assigneeId),
      projectId,
    });
    // console.log(`assigneeId: ${assigneeId}, projectId - ${projectId}`);
    if (!project) throw new Error("Project not found");

    return await Task.create({
      ...data,
      workspaceId,
      assignedAt: new Date(),
      status: "todo",
    });
  }
}

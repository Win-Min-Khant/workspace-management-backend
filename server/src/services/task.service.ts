//  title: string;
//   description?: string;
//   status: "todo" | "in-progress" | "done";
//   priority: "low" | "medium" | "high";
//   projectId: Types.ObjectId;
//   workspaceId: Types.ObjectId;
//   assigneeId?: Types.ObjectId;
//   dueDate?: Date;

import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";

interface CreateTaskDTO {
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  projectId: string;
  assigneeId?: string;
  dueDate?: Date;
}

export class TaskService {
  static async createTask(data: CreateTaskDTO) {
    const { projectId, assigneeId } = data;

    const project = await Project.findOne({
      userId: assigneeId,
      projectId,
    });
    if (!project) throw new Error("Project not found");

    return await Task.create({
      ...data,
      workspaceId: project.workspaceId,
      status: "todo",
    });
  }
}

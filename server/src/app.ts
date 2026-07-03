import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import errorHandler from "./middlewares/errorHandler.middleware.js";
import workspaceRoutes from "./routes/workspace.routes.js";
import inviteRoutes from "./routes/invitation.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

// dotenv config
dotenv.config({
  path: ".env",
});

// create server
const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(cookieParser());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/invitation", inviteRoutes);
app.use("/api/workspaces/:workspaceId/projects", projectRoutes);
app.use("/api/workspaces/:workspaceId/projects/:projectId/tasks", taskRoutes);
app.use("/api/workspaces/:workspaceId/dashboard", dashboardRoutes);
app.use("/api/workspaces/:workspaceId/tasks/:taskId/comments", commentRoutes);
app.use("/api/workspaces/:workspaceId/activity", activityRoutes);
app.use("/api/workspaces/:workspaceId/notifications", notificationRoutes);

// custom middlewares
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// connect server with database
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${process.env.PORT}`);
});

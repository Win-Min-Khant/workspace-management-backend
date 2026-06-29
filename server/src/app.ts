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

// dotenv config
dotenv.config({
  path: ".env",
});

// create server
const app = express();

// middlewares
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(cookieParser());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/workspace", workspaceRoutes);
app.use("/api/invitation", inviteRoutes);
app.use("/api/workspaces/:workspaceId/projects", projectRoutes);
app.use("/api/workspaces/:workspaceId/tasks", taskRoutes);
app.use("/api/workspaces/:workspaceId/dashboard", dashboardRoutes);
app.use("/api/workspaces/:workspaceId/tasks/:taskId/comments", commentRoutes);

// debug route list
// custom middlewares
app.use(errorHandler);

// connect server with database
app.listen(process.env.PORT, () => {
  connectDB();
  console.log(`Server is running on port ${process.env.PORT}`);
});

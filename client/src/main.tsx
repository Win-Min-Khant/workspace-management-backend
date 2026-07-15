import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { queryClient } from "./app/queryClient.ts";
import PublicLayout from "./components/layouts/PublicLayout.tsx";
import MainLayout from "./components/layouts/MainLayout.tsx";
import Home from "./pages/Home.tsx";
import Register from "./pages/auth/Register.tsx";
import Login from "./pages/auth/Login.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import SelectWorkspace from "./pages/SelectWorkspace.tsx";
import AcceptInvitation from "./pages/AcceptInvitation.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Members from "./pages/Members.tsx";
import Projects from "./pages/Projects.tsx";
import ProjectDetails from "./pages/ProjectDetails.tsx";
import TaskBoard from "./pages/TaskBoard.tsx";
import TaskDetails from "./pages/TaskDetails.tsx";
import WorkspaceSettings from "./pages/WorkspaceSettings.tsx";
import Notifications from "./pages/Notifications.tsx";
import ActivityLog from "./pages/ActivityLog.tsx";
import Profile from "./pages/Profile.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "register", element: <Register /> },
      { path: "login", element: <Login /> },
    ],
  },
  { path: "onboarding", element: <Onboarding /> },
  { path: "select-workspace", element: <SelectWorkspace /> },
  { path: "invite/:token", element: <AcceptInvitation /> },
  {
    path: "w/:workspaceId",
    element: <MainLayout />,
    children: [
      { path: "profile", element: <Profile /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "members", element: <Members /> },
      { path: "projects", element: <Projects /> },
      { path: "projects/:projectId", element: <ProjectDetails /> },
      { path: "projects/:projectId/board", element: <TaskBoard /> },
      { path: "projects/:projectId/tasks/:taskId", element: <TaskDetails /> },
      { path: "settings", element: <WorkspaceSettings /> },
      { path: "notifications", element: <Notifications /> },
      { path: "activity", element: <ActivityLog /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </QueryClientProvider>
  </StrictMode>,
);

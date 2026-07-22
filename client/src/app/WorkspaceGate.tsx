import { Navigate } from "react-router";
import { useMyWorkspaces } from "@/features/workspace/hooks/useMyWorkspaces";

function WorkspaceGate() {
  const { data: workspaces, isLoading, error } = useMyWorkspaces();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-destructive">
          Something went wrong loading your workspaces.
        </p>
      </div>
    );
  }

  // Check workspace has or not
  // If not => redirect to the create workspace page
  if (!workspaces || workspaces.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  // If workspace has => navigate to that workspace
  if (workspaces.length === 1) {
    return (
      <Navigate to={`/w/${workspaces[0].workspace._id}/dashboard`} replace />
    );
  }

  // Get lastWorkspaceId from localStorage and check it with current workspaceId
  const lastWorkspaceId = localStorage.getItem("lastWorkspaceId");
  const stillValid = workspaces.some(
    (w) => w.workspace._id === lastWorkspaceId,
  );

  // If lastWorkspaceId has and same with the workspaceId from workspaces => Navigate to the lastWorkspaceId's dashboard
  if (lastWorkspaceId && stillValid) {
    return <Navigate to={`/w/${lastWorkspaceId}/dashboard`} replace />;
  }

  // If lastWorkspaceId doesn't have => Navigate to the select workspace page
  return <Navigate to="/select-workspace" replace />;
}

export default WorkspaceGate;

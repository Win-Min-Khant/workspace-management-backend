import { Link, useNavigate } from "react-router";
import { useMyWorkspaces } from "@/features/workspace/hooks/useMyWorkspaces";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";

function SelectWorkspace() {
  const { data: workspaces, isLoading, error } = useMyWorkspaces();
  const navigate = useNavigate();

  function handleSelect(workspaceId: string) {
    localStorage.setItem("lastWorkspaceId", workspaceId);
    navigate(`/w/${workspaceId}/dashboard`);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p className="text-sm text-destructive">
          Something went wrong loading your workspaces.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-lg font-medium mb-1">Pick a workspace</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Choose a workspace to continue
        </p>

        <div className="flex flex-col gap-2">
          {workspaces?.map(({ workspace, role }) => (
            <button
              key={workspace._id}
              onClick={() => handleSelect(workspace._id)}
              className="flex items-center gap-3 border rounded-md px-4 py-3 text-left hover:bg-accent"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={workspace.logo?.image_url} />
                <AvatarFallback>
                  {workspace.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm font-medium">{workspace.name}</div>
                <div className="text-xs text-muted-foreground capitalize">
                  {role}
                </div>
              </div>
            </button>
          ))}

          <Link
            to="/onboarding"
            className="mt-2 flex items-center justify-center gap-2 rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Plus className="h-4 w-4" /> Create a new workspace
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SelectWorkspace;

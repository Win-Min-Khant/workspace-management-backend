import { useState } from "react";
import { useParams } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, ShieldAlert } from "lucide-react";
import { useUpdateWorkspace } from "@/features/workspace/hooks/useUpdateWorkspace";
import { useDeleteWorkspace } from "@/features/workspace/hooks/useDeleteWorkspace";
import { useMyWorkspaces } from "@/features/workspace/hooks/useMyWorkspaces";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useWorkspaceDetails } from "@/features/workspace/hooks/useWorkspaceDetail";

function WorkspaceSettings() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { data, isLoading, error } = useWorkspaceDetails(workspaceId as string);

  // figure out my own role in this workspace, same pattern as Members.tsx
  const { data: workspaces } = useMyWorkspaces();
  const myRole = workspaces?.find((w) => w.workspace._id === workspaceId)?.role;

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="text-sm text-destructive">
        {getErrorMessage(error, "Something went wrong loading this workspace.")}
      </p>
    );
  }

  // block the whole page for anyone who isn't the owner
  if (myRole !== "owner") {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <ShieldAlert className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">Owner access required</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          Only the workspace owner can view or change workspace settings.
        </p>
      </div>
    );
  }

  return <WorkspaceSettingsForm workspace={data.workspace} />;
}

function WorkspaceSettingsForm({
  workspace,
}: {
  workspace: { _id: string; name: string; logo?: { image_url: string } };
}) {
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const [name, setName] = useState(workspace.name);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const { mutate: saveChanges, isPending: isSaving } = useUpdateWorkspace(
    workspaceId as string,
  );
  const { mutate: deleteWs, isPending: isDeleting } = useDeleteWorkspace();

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  }

  function handleSave() {
    saveChanges({
      workspaceId: workspaceId as string,
      name,
      logo: logoFile ?? undefined,
    });
  }

  const isUnchanged = name === workspace.name && !logoFile;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Workspace settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your workspace details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Update your workspace name and logo</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 rounded-lg">
              <AvatarImage
                src={logoPreview ?? workspace.logo?.image_url}
                className="rounded-lg"
              />
              <AvatarFallback className="rounded-lg">
                {workspace.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <FieldLabel htmlFor="ws-logo" className="cursor-pointer">
                <span className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
                  Change logo
                </span>
              </FieldLabel>
              <input
                id="ws-logo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
            </div>
          </div>

          <Field>
            <FieldLabel htmlFor="ws-name">Workspace name</FieldLabel>
            <Input
              id="ws-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={isSaving || isUnchanged}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Deleting this workspace removes all projects, tasks, and members
            permanently.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Dialog>
            <DialogTrigger
              render={
                <button className="inline-flex items-center text-white rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90" />
              }
            >
              Delete workspace
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete this workspace?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. All projects, tasks,
                  invitations, and member access for this workspace will be
                  permanently deleted.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="destructive"
                  className="w-auto"
                  disabled={isDeleting}
                  onClick={() => deleteWs(workspaceId as string)}
                >
                  {isDeleting ? "Deleting..." : "Yes, delete workspace"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}

export default WorkspaceSettings;

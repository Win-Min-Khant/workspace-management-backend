import { useParams } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useProjectDetails } from "@/features/project/hooks/useProjectDetails";
import { useUpdateProject } from "@/features/project/hooks/useUpdateProject";
import { useDeleteProject } from "@/features/project/hooks/useDeleteProject";
import { getErrorMessage } from "@/utils/getErrorMessage";
import type { ProjectInputs } from "@/schema/Project";
import ProjectForm from "@/components/ProjectForm";

function EditProject() {
  const { workspaceId, projectId } = useParams<{
    workspaceId: string;
    projectId: string;
  }>();
  const { data, isLoading, error } = useProjectDetails(
    workspaceId as string,
    projectId as string,
  );

  const { mutate: update, isPending: isSaving } = useUpdateProject(
    workspaceId as string,
    projectId as string,
  );
  const { mutate: remove, isPending: isDeleting } = useDeleteProject(
    workspaceId as string,
  );

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
        {getErrorMessage(error, "Something went wrong loading this project.")}
      </p>
    );
  }

  function handleSubmit(formData: ProjectInputs) {
    update({
      workspaceId: workspaceId as string,
      projectId: projectId as string,
      ...formData,
    });
  }

  function handleDelete() {
    remove({
      workspaceId: workspaceId as string,
      projectId: projectId as string,
    });
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit project</CardTitle>
          <CardDescription>Update this project's details</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm
            defaultValues={{
              name: data.project.name,
              description: data.project.description ?? "",
              status: data.project.status,
              startDate: data.project.startDate?.slice(0, 10) ?? "",
              endDate: data.project.endDate?.slice(0, 10) ?? "",
            }}
            onSubmit={handleSubmit}
            isPending={isSaving}
            submitLabel="Save changes"
          />
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Deleting this project removes all its tasks permanently.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Dialog>
            <DialogTrigger
              render={
                <button className="inline-flex items-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 cursor-pointer text-white" />
              }
            >
              Delete project
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete this project?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. All tasks, comments, and
                  notifications tied to this project will be permanently
                  deleted.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="destructive"
                  className="w-auto"
                  disabled={isDeleting}
                  onClick={handleDelete}
                >
                  {isDeleting ? "Deleting..." : "Yes, delete project"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}

export default EditProject;

import { useParams } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCreateProject } from "@/features/project/hooks/useCreateProject";
import type { ProjectInputs } from "@/schema/Project";
import ProjectForm from "@/components/ProjectForm";

function CreateProject() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { mutate: create, isPending } = useCreateProject(workspaceId as string);

  function handleSubmit(data: ProjectInputs) {
    create({ workspaceId: workspaceId as string, ...data });
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create a new project</CardTitle>
          <CardDescription>
            Organize your team's work into a new project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm
            onSubmit={handleSubmit}
            isPending={isPending}
            submitLabel="Create project"
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateProject;

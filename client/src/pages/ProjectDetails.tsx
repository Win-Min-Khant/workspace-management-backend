import { useState } from "react";
import { useParams, Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  MoreHorizontal,
  Plus,
  UserPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjectDetails } from "@/features/project/hooks/useProjectDetails";
import { useManageProjectMember } from "@/features/project/hooks/useManageProjectMember";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useWorkspaceMembers } from "@/features/workspace/hooks/useWorkspaceMember";

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  planning: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  completed: "bg-muted text-muted-foreground",
};

const taskStatusStyles: Record<string, string> = {
  todo: "bg-muted text-muted-foreground",
  "in-progress":
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
};

const priorityStyles: Record<string, string> = {
  low: "text-muted-foreground",
  medium: "text-amber-700 dark:text-amber-300",
  high: "text-destructive",
};

function ProjectDetails() {
  const { workspaceId, projectId } = useParams<{
    workspaceId: string;
    projectId: string;
  }>();
  const { data, isLoading, error } = useProjectDetails(
    workspaceId as string,
    projectId as string,
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

  const { project, members, tasks } = data;
  const completedCount = tasks.filter((t) => t.status === "done").length;
  const progress =
    tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="flex flex-col gap-6">
      <Link
        to={`/w/${workspaceId}/projects`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground w-fit"
      >
        <ArrowLeft className="h-4 w-4" /> Back to projects
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-semibold">{project.name}</h1>
            <Badge className={statusStyles[project.status]} variant="secondary">
              {project.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            {project.description || "No description"}
          </p>
        </div>
        <Button
          variant="secondary"
          className="w-auto"
          render={<Link to={`/w/${workspaceId}/projects/${projectId}/edit`} />}
        >
          Edit project
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Timeline</div>
              <div className="text-sm font-medium">
                {project.startDate?.slice(0, 10) ?? "No start date"} —{" "}
                {project.endDate?.slice(0, 10) ?? "No end date"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Progress</span>
              <span>
                {completedCount}/{tasks.length} tasks
              </span>
            </div>
            <Progress value={progress} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex -space-x-2">
              {members.map((member) => (
                <Avatar
                  key={member._id}
                  className="h-7 w-7 border-2 border-background"
                >
                  <AvatarImage src={member.userId.avatar?.image_url} />
                  <AvatarFallback className="text-[10px]">
                    {member.userId.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <AssignMemberDialog
              workspaceId={workspaceId as string}
              projectId={projectId as string}
              currentMemberIds={members.map((m) => m.userId._id)}
            />
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">Tasks</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="w-auto"
              render={
                <Link to={`/w/${workspaceId}/projects/${projectId}/board`} />
              }
            >
              Board view
            </Button>
            <Button size="sm" className="w-auto">
              <Plus className="h-4 w-4" /> New task
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {tasks.map((task, i) => (
              <div
                key={task._id}
                className={`flex items-center justify-between px-4 py-3 ${
                  i !== tasks.length - 1 ? "border-b" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={task.assigneeId?.avatar?.image_url} />
                    <AvatarFallback className="text-[10px]">
                      {task.assigneeId?.name.slice(0, 2).toUpperCase() ?? "--"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">{task.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {task.dueDate
                        ? `Due ${task.dueDate.slice(0, 10)}`
                        : "No due date"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium ${priorityStyles[task.priority]}`}
                  >
                    {task.priority}
                  </span>
                  <Badge
                    className={taskStatusStyles[task.status]}
                    variant="secondary"
                  >
                    {task.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        />
                      }
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit task</DropdownMenuItem>
                      <DropdownMenuItem variant="destructive">
                        Delete task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}

            {tasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-12">
                No tasks yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AssignMemberDialog({
  workspaceId,
  projectId,
  currentMemberIds,
}: {
  workspaceId: string;
  projectId: string;
  currentMemberIds: string[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  const { data: workspaceMembers } = useWorkspaceMembers(workspaceId);
  const { mutate: manageMember, isPending } = useManageProjectMember(
    workspaceId,
    projectId,
  );

  const availableMembers = (workspaceMembers ?? []).filter(
    (m) => !currentMemberIds.includes(m.userId._id),
  );

  function handleAssign() {
    if (!selectedUserId) return;

    manageMember(
      { workspaceId, projectId, userIdToAssign: selectedUserId, action: "add" },
      {
        onSuccess: () => {
          setOpen(false);
          setSelectedUserId("");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent" />
        }
      >
        <UserPlus className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign a member</DialogTitle>
          <DialogDescription>
            Add a workspace member to this project.
          </DialogDescription>
        </DialogHeader>

        {/* FIX: Arrow function to guard against null values */}
        <Select
          value={selectedUserId}
          onValueChange={(val) => val && setSelectedUserId(val)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a member" />
          </SelectTrigger>
          <SelectContent>
            {availableMembers.map((m) => (
              <SelectItem key={m.userId._id} value={m.userId._id}>
                {m.userId.name}
              </SelectItem>
            ))}
            {availableMembers.length === 0 && (
              <SelectItem value="none" disabled>
                Everyone is already assigned
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        <DialogFooter>
          <Button
            disabled={!selectedUserId || isPending}
            onClick={handleAssign}
          >
            {isPending ? "Assigning..." : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ProjectDetails;

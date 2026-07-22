import { useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  FolderKanban,
  CheckSquare,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMyWorkspaces } from "@/features/workspace/hooks/useMyWorkspaces";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { isOwnerDashboard } from "@/features/dashboard/api/dashboardApi";

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  planning: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  completed: "bg-muted text-muted-foreground",
};

function Dashboard() {
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const { data: workspaces } = useMyWorkspaces();
  const currentEntry = workspaces?.find((w) => w.workspace._id === workspaceId);

  const { data, isLoading, error } = useDashboard(workspaceId as string);

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14 rounded-lg">
          <AvatarImage
            src={currentEntry?.workspace.logo?.image_url}
            className="rounded-lg"
          />
          <AvatarFallback className="rounded-lg">
            {currentEntry?.workspace.name.slice(0, 2).toUpperCase() ?? "--"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-semibold">
            {currentEntry?.workspace.name ?? "Loading..."}
          </h1>
          <p className="text-sm text-muted-foreground">Workspace overview</p>
        </div>
      </div>

      {isOwnerDashboard(data) ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            label="Members"
            value={data.totalMembers}
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            label="Projects"
            value={data.totalProjects}
            icon={<FolderKanban className="h-4 w-4" />}
          />
          <StatCard
            label="Tasks"
            value={data.tasks.total}
            icon={<CheckSquare className="h-4 w-4" />}
          />
          <StatCard
            label="Pending"
            value={data.tasks.pending}
            icon={<Clock className="h-4 w-4" />}
          />
          <StatCard
            label="Overdue"
            value={data.tasks.overdue}
            icon={<AlertTriangle className="h-4 w-4" />}
            variant="danger"
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Assigned projects"
              value={data.assignedProjects.count}
              icon={<FolderKanban className="h-4 w-4" />}
            />
            <StatCard
              label="Tasks"
              value={data.tasks.total}
              icon={<CheckSquare className="h-4 w-4" />}
            />
            <StatCard
              label="Pending"
              value={data.tasks.pending}
              icon={<Clock className="h-4 w-4" />}
            />
          </div>

          <div>
            <h2 className="text-sm font-medium mb-3">Your projects</h2>
            <div className="flex flex-col gap-2">
              {data.assignedProjects.projects.map((project) => (
                <Card key={project._id}>
                  <CardContent className="flex items-center justify-between py-3">
                    <span className="text-sm font-medium">{project.name}</span>
                    <Badge
                      className={statusStyles[project.status]}
                      variant="secondary"
                    >
                      {project.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
              {data.assignedProjects.projects.length === 0 && (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  You haven't been assigned to any projects yet.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  variant = "default",
}: {
  label: string;
  value: number;
  icon: ReactNode;
  variant?: "default" | "danger";
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div
          className={
            variant === "danger"
              ? "flex h-7 w-7 items-center justify-center rounded-md bg-destructive/10 text-destructive"
              : "flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary"
          }
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default Dashboard;

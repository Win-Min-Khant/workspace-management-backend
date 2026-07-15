import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FolderKanban,
  CheckSquare,
  CircleCheck,
  Clock,
  AlertTriangle,
  Loader2, // Added for loading indicator
} from "lucide-react";
import type { ReactNode } from "react";
import { useWorkspaceDetail } from "@/features/workspace/hooks/useWorkspaceDetail";
import { useParams } from "react-router";

// fake data — replace with useWorkspaceDetails(workspaceId) later
const stats = {
  completedTasks: 24,
  pendingTasks: 15,
  overdueTasks: 3,
};

const recentProjects = [
  { id: "1", name: "Website redesign", status: "active", taskCount: 7 },
  { id: "2", name: "Mobile app v2", status: "active", taskCount: 11 },
  { id: "3", name: "Q3 marketing", status: "planning", taskCount: 4 },
];

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  planning: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  completed: "bg-muted text-muted-foreground",
};

function Dashboard() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  // Added standard isLoading and error statuses from your data hook
  const { data, isLoading, error } = useWorkspaceDetail(workspaceId as string);

  // 1. Handle Loading State
  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Loading workspace info...
        </p>
      </div>
    );
  }

  // 2. Handle Error State
  if (error || !data) {
    return (
      <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <div>
          <h3 className="text-lg font-medium">Failed to load workspace</h3>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "There is no data to show right now."}
          </p>
        </div>
      </div>
    );
  }

  // 3. Main UI (Guaranteed to have data here)
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14 rounded-lg">
          <AvatarImage
            src={data.workspace.logo?.image_url}
            className="rounded-lg"
          />
          <AvatarFallback className="rounded-lg">
            {data.workspace.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-semibold">{data.workspace.name}</h1>
          <p className="text-sm text-muted-foreground">Workspace overview</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
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
          value={data.totalTasks}
          icon={<CheckSquare className="h-4 w-4" />}
        />
        <StatCard
          label="Completed"
          value={stats.completedTasks}
          icon={<CircleCheck className="h-4 w-4" />}
        />
        <StatCard
          label="Pending"
          value={stats.pendingTasks}
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          label="Overdue"
          value={stats.overdueTasks}
          icon={<AlertTriangle className="h-4 w-4" />}
          variant="danger"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">Recent projects</h2>
          <span className="text-sm text-primary cursor-pointer">View all</span>
        </div>
        <div className="flex flex-col gap-2">
          {recentProjects.map((project) => (
            <Card key={project.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{project.name}</span>
                  <Badge
                    className={statusStyles[project.status]}
                    variant="secondary"
                  >
                    {project.status}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  {project.taskCount} tasks
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
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

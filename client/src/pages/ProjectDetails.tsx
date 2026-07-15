import { useParams, Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Calendar,
  MoreHorizontal,
  Plus,
  UserPlus,
} from "lucide-react";

// fake data — replace with useProjectDetails(projectId) later
const project = {
  id: "1",
  name: "Website redesign",
  description:
    "Refresh the marketing site with the new brand system, improve page load times, and simplify the navigation structure.",
  status: "active",
  startDate: "2026-06-01",
  endDate: "2026-08-15",
  members: [
    { id: "1", name: "Kyaw Gyi" },
    { id: "2", name: "Mei Thant" },
  ],
};

const tasks = [
  {
    id: "1",
    title: "Design new homepage layout",
    status: "done",
    priority: "high",
    assignee: "Kyaw Gyi",
    dueDate: "2026-07-10",
  },
  {
    id: "2",
    title: "Set up component library",
    status: "in-progress",
    priority: "high",
    assignee: "Mei Thant",
    dueDate: "2026-07-20",
  },
  {
    id: "3",
    title: "Migrate blog content",
    status: "todo",
    priority: "medium",
    assignee: "Mei Thant",
    dueDate: "2026-07-28",
  },
  {
    id: "4",
    title: "Write launch announcement",
    status: "todo",
    priority: "low",
    assignee: "Kyaw Gyi",
    dueDate: "2026-08-05",
  },
];

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
  const { projectId } = useParams<{ projectId: string }>();

  const completedCount = tasks.filter((t) => t.status === "done").length;
  const progress = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/projects"
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
            {project.description}
          </p>
        </div>
        <Button variant="secondary" className="w-auto">
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
                {project.startDate} — {project.endDate}
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
              {project.members.map((member) => (
                <Avatar
                  key={member.id}
                  className="h-7 w-7 border-2 border-background"
                >
                  <AvatarFallback className="text-[10px]">
                    {member.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <UserPlus className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="w-auto"
              size="sm"
              render={<Link to={`/projects/${projectId}/board`} />}
              nativeButton={false}
            >
              Board view
            </Button>
            <Button className="w-auto" size="sm">
              <Plus className="h-4 w-4" /> New task
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {tasks.map((task, i) => (
              <div
                key={task.id}
                className={`flex items-center justify-between px-4 py-3 ${
                  i !== tasks.length - 1 ? "border-b" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-[10px]">
                      {task.assignee.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">{task.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Due {task.dueDate}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProjectDetails;

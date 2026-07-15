import { useParams, Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, Plus } from "lucide-react";

// fake data — replace with useProjectTasks(projectId) later
const tasks = [
  {
    id: "1",
    title: "Design new homepage layout",
    status: "done",
    priority: "high",
    assignee: "Kyaw Gyi",
    dueDate: "Jul 10",
  },
  {
    id: "2",
    title: "Set up component library",
    status: "in-progress",
    priority: "high",
    assignee: "Mei Thant",
    dueDate: "Jul 20",
  },
  {
    id: "3",
    title: "Migrate blog content",
    status: "todo",
    priority: "medium",
    assignee: "Mei Thant",
    dueDate: "Jul 28",
  },
  {
    id: "4",
    title: "Write launch announcement",
    status: "todo",
    priority: "low",
    assignee: "Kyaw Gyi",
    dueDate: "Aug 5",
  },
  {
    id: "5",
    title: "QA pass on mobile breakpoints",
    status: "in-progress",
    priority: "medium",
    assignee: "Kyaw Gyi",
    dueDate: "Jul 22",
  },
  {
    id: "6",
    title: "Fix broken footer links",
    status: "done",
    priority: "low",
    assignee: "Mei Thant",
    dueDate: "Jul 8",
  },
];

const columns = [
  { key: "todo", label: "To do" },
  { key: "in-progress", label: "In progress" },
  { key: "done", label: "Done" },
] as const;

const priorityStyles: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
};

function TaskBoard() {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div className="flex flex-col gap-6">
      <Link
        to={`/projects/${projectId}`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground w-fit"
      >
        <ArrowLeft className="h-4 w-4" /> Back to project
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Task board</h1>
        <Button className="w-auto">
          <Plus className="h-4 w-4" /> New task
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {columns.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.key);

          return (
            <div key={column.key} className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-medium">{column.label}</span>
                <span className="text-xs text-muted-foreground">
                  {columnTasks.length}
                </span>
              </div>

              <div className="flex flex-col gap-2 rounded-lg bg-muted/40 p-2 min-h-[120px]">
                {columnTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <CardContent className="flex flex-col gap-3 p-3">
                      <div className="text-sm font-medium leading-snug">
                        {task.title}
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge
                          className={priorityStyles[task.priority]}
                          variant="secondary"
                        >
                          {task.priority}
                        </Badge>
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px]">
                            {task.assignee.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {task.dueDate}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {columnTasks.length === 0 && (
                  <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TaskBoard;

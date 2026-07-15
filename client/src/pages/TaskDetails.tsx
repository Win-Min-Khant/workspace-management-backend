import { useParams, Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Calendar, Flag } from "lucide-react";

const task = {
  id: "2",
  title: "Set up component library",
  description:
    "Build the shared Button, Input, and Card components in Storybook before other pages start depending on them.",
  status: "in-progress",
  priority: "high",
  assignee: "Mei Thant",
  dueDate: "2026-07-20",
  project: "Website redesign",
};

const comments = [
  {
    id: "1",
    author: "Kyaw Gyi",
    text: "How's this coming along?",
    createdAt: "2 days ago",
  },
  {
    id: "2",
    author: "Mei Thant",
    text: "Buttons and inputs are done, working on Card now.",
    createdAt: "1 day ago",
  },
];

function TaskDetails() {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Link
        to={`/projects/${projectId}`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground w-fit"
      >
        <ArrowLeft className="h-4 w-4" /> Back to {task.project}
      </Link>

      <div>
        <h1 className="text-xl font-semibold mb-2">{task.title}</h1>
        <p className="text-sm text-muted-foreground">{task.description}</p>
      </div>

      <Card>
        <CardContent className="grid grid-cols-2 gap-4 py-4 sm:grid-cols-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Status</div>
            <Select defaultValue={task.status}>
              <SelectTrigger className="h-8 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To do</SelectItem>
                <SelectItem value="in-progress">In progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Assignee</div>
            <div className="flex items-center gap-2 text-sm">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[9px]">
                  {task.assignee.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {task.assignee}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Priority</div>
            <div className="flex items-center gap-1.5 text-sm">
              <Flag className="h-3.5 w-3.5 text-destructive" />
              {task.priority}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Due date</div>
            <div className="flex items-center gap-1.5 text-sm">
              <Calendar className="h-3.5 w-3.5" />
              {task.dueDate}
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-sm font-medium mb-3">Comments</h2>
        <div className="flex flex-col gap-4 mb-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[10px]">
                  {c.author.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{c.author}</span>
                  <span className="text-xs text-muted-foreground">
                    {c.createdAt}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            placeholder="Add a comment..."
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
          <Button className="w-auto">Post</Button>
        </div>
      </div>
    </div>
  );
}

export default TaskDetails;

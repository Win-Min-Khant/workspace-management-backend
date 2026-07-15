import { useState } from "react";
import { Link, useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search, CheckSquare } from "lucide-react";

// fake data — replace with useProjects(workspaceId) later
const projects = [
  {
    id: "1",
    name: "Website redesign",
    description: "Refresh the marketing site with the new brand system",
    status: "active",
    taskCount: 12,
    completedCount: 7,
    members: [
      { id: "1", name: "Kyaw Gyi" },
      { id: "2", name: "Mei Thant" },
    ],
  },
  {
    id: "2",
    name: "Mobile app v2",
    description: "Rebuild the mobile app with the new design language",
    status: "active",
    taskCount: 20,
    completedCount: 4,
    members: [
      { id: "2", name: "Mei Thant" },
      { id: "3", name: "Zin Ko" },
    ],
  },
  {
    id: "3",
    name: "Q3 marketing",
    description: "Campaign planning and content calendar for Q3",
    status: "planning",
    taskCount: 6,
    completedCount: 0,
    members: [{ id: "1", name: "Kyaw Gyi" }],
  },
  {
    id: "4",
    name: "Internal tools",
    description: "Admin dashboard for support team",
    status: "completed",
    taskCount: 15,
    completedCount: 15,
    members: [{ id: "3", name: "Zin Ko" }],
  },
];

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  planning: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  completed: "bg-muted text-muted-foreground",
};

function Projects() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { workspaceId } = useParams<string>();

  const filtered = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Everything your team is working on
          </p>
        </div>
        <Button className="w-auto">
          <Plus className="h-4 w-4" /> New project
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => {
          const progress =
            project.taskCount === 0
              ? 0
              : Math.round((project.completedCount / project.taskCount) * 100);

          return (
            <Link
              key={project.id}
              to={`/w/${workspaceId}/projects/${project.id}`}
            >
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{project.name}</CardTitle>
                    <Badge
                      className={statusStyles[project.status]}
                      variant="secondary"
                    >
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckSquare className="h-3.5 w-3.5" />
                        {project.completedCount}/{project.taskCount} tasks
                      </span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>

                  <div className="flex -space-x-2">
                    {project.members.map((member) => (
                      <Avatar
                        key={member.id}
                        className="h-6 w-6 border-2 border-background"
                      >
                        <AvatarFallback className="text-[10px]">
                          {member.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">
          No projects match your search.
        </p>
      )}
    </div>
  );
}

export default Projects;

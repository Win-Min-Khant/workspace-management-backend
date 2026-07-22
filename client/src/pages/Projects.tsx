import { useState } from "react";
import { useParams, Link } from "react-router";
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
import { Loader2, Plus, Search } from "lucide-react";
import { useProjects } from "@/features/project/hooks/useProjects";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useDebounce } from "react-use";

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  planning: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  completed: "bg-muted text-muted-foreground",
};

function Projects() {
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useDebounce(() => setDebouncedSearch(search), 500, [search]);

  const {
    data: projects,
    isLoading,
    error,
    isFetching,
  } = useProjects(
    workspaceId as string,
    debouncedSearch || undefined,
    statusFilter === "all" ? undefined : statusFilter,
  );

  return (
    <div className="flex flex-col gap-6">
      {/* --- HEADER STAYS RENDERED --- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Everything your team is working on
          </p>
        </div>
        <Button
          className="w-auto"
          render={<Link to={`/w/${workspaceId}/projects/new`} />}
        >
          <Plus className="h-4 w-4" /> New project
        </Button>
      </div>

      {/* --- INPUT STAYS RENDERED (FOCUS IS PRESERVED) --- */}
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
        <Select
          value={statusFilter}
          onValueChange={(val) => val && setStatusFilter(val)}
        >
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

      {/* --- GRID / CONTENT AREA (ONLY THIS PART SWAPS) --- */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive text-center">
          {getErrorMessage(error, "Something went wrong loading projects.")}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(projects ?? []).map((project) => (
              <Link
                key={project._id}
                to={`/w/${workspaceId}/projects/${project._id}`}
              >
                <Card className="h-full hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">
                        {project.name}
                      </CardTitle>
                      <Badge
                        className={statusStyles[project.status]}
                        variant="secondary"
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description || "No description"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created by {project.createdBy.name}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {(projects ?? []).length === 0 && !isFetching && (
            <p className="text-sm text-muted-foreground text-center py-12">
              No projects match your search.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default Projects;

import { FolderPlus, CheckSquare, UserPlus, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const activities = [
  {
    id: "1",
    icon: UserPlus,
    text: "Mei Thant invited Zin Ko to the workspace",
    time: "1d ago",
  },
  {
    id: "2",
    icon: FolderPlus,
    text: 'Kyaw Gyi created project "Q3 marketing"',
    time: "2d ago",
  },
  {
    id: "3",
    icon: CheckSquare,
    text: 'Mei Thant created task "Migrate blog content"',
    time: "3d ago",
  },
  {
    id: "4",
    icon: RefreshCw,
    text: 'Kyaw Gyi changed "Design new homepage layout" to done',
    time: "4d ago",
  },
];

function ActivityLog() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Activity log</h1>
        <p className="text-sm text-muted-foreground">
          Recent actions across this workspace
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {activities.map((a, i) => (
            <div
              key={a.id}
              className={`flex items-start gap-3 px-4 py-3 ${i !== activities.length - 1 ? "border-b" : ""}`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <a.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm">{a.text}</p>
                <span className="text-xs text-muted-foreground">{a.time}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default ActivityLog;

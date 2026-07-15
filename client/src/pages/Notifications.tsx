import { CheckSquare, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const notifications = [
  {
    id: "1",
    icon: CheckSquare,
    text: 'Mei Thant assigned you to "Set up component library"',
    time: "2h ago",
    unread: true,
  },
  {
    id: "2",
    icon: UserPlus,
    text: "Zin Ko joined Cannopy",
    time: "1d ago",
    unread: true,
  },
  {
    id: "3",
    icon: CheckSquare,
    text: 'Kyaw Gyi marked "Fix broken footer links" as done',
    time: "3d ago",
    unread: false,
  },
];

function Notifications() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Stay up to date with your workspace
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {notifications.map((n, i) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-4 py-3 ${i !== notifications.length - 1 ? "border-b" : ""} ${n.unread ? "bg-primary/5" : ""}`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <n.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm">{n.text}</p>
                <span className="text-xs text-muted-foreground">{n.time}</span>
              </div>
              {n.unread && (
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default Notifications;

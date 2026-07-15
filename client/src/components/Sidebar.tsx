import { LayoutDashboard, FolderKanban, Users, Settings } from "lucide-react";
import SidebarItem from "./SidebarItem";

interface SidebarProps {
  workspaceId: string;
}

function Sidebar({ workspaceId }: SidebarProps) {
  return (
    <div className="flex h-full flex-col border-r bg-background px-3 py-6">
      <nav className="flex flex-col gap-1">
        <SidebarItem
          to={`/w/${workspaceId}/dashboard`}
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
        />
        <SidebarItem
          to={`/w/${workspaceId}/projects`}
          icon={<FolderKanban size={18} />}
          label="Projects"
        />
        <SidebarItem
          to={`/w/${workspaceId}/members`}
          icon={<Users size={18} />}
          label="Members"
        />
        <SidebarItem
          to={`/w/${workspaceId}/settings`}
          icon={<Settings size={18} />}
          label="Settings"
        />
      </nav>
    </div>
  );
}

export default Sidebar;

import { Link, useNavigate, useParams } from "react-router";
import {
  Bell,
  ChevronsUpDown,
  LogOut,
  Plus,
  Settings,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useMyWorkspaces } from "@/features/workspace/hooks/useMyWorkspaces";
import { useLogout } from "@/features/auth/hooks/useLogout";
// Import your existing profile hook
import { useProfile } from "@/features/auth/hooks/useProfile";

function AppHeader() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();

  const { data: workspaces } = useMyWorkspaces();
  const { mutate: logout } = useLogout();

  // Use your existing hook here.
  // It uses the workspaceId from the URL to fetch the correct user profile.
  const { data: user } = useProfile(workspaceId ?? "");

  // Check current workspaceId does have in workspaces or not
  const currentEntry = workspaces?.find((w) => w.workspace._id === workspaceId);
  const otherEntries =
    workspaces?.filter((w) => w.workspace._id !== workspaceId) ?? [];

  function handleSwitch(id: string) {
    localStorage.setItem("lastWorkspaceId", id);
    navigate(`/w/${id}/dashboard`);
  }

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent" />
          }
        >
          <Avatar className="h-6 w-6 rounded-md">
            <AvatarImage src={currentEntry?.workspace.logo?.image_url} />
            <AvatarFallback className="rounded-md text-xs">
              {currentEntry?.workspace.name.slice(0, 2).toUpperCase() ?? "--"}
            </AvatarFallback>
          </Avatar>
          {currentEntry?.workspace.name ?? "Loading..."}
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            {currentEntry && (
              <DropdownMenuItem className="flex items-center gap-2">
                <Avatar className="h-5 w-5 rounded-md">
                  <AvatarImage src={currentEntry.workspace.logo?.image_url} />
                  <AvatarFallback className="rounded-md text-[10px]">
                    {currentEntry.workspace.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {currentEntry.workspace.name}
              </DropdownMenuItem>
            )}
            {otherEntries.map(({ workspace }) => (
              <DropdownMenuItem
                key={workspace._id}
                onClick={() => handleSwitch(workspace._id)}
                className="flex items-center gap-2"
              >
                <Avatar className="h-5 w-5 rounded-md">
                  <AvatarImage src={workspace.logo?.image_url} />
                  <AvatarFallback className="rounded-md text-[10px]">
                    {workspace.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {workspace.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            render={<Link to="/onboarding" />}
            nativeButton={false}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Create workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          render={<Link to={`/w/${workspaceId}/notifications`} />}
          nativeButton={false}
        >
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="h-8 w-8 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center" />
            }
          >
            {/* Safe chaining ensures the app doesn't crash while loading */}
            {user?.name.slice(0, 2).toUpperCase() ?? "U"}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="text-sm font-medium">
                  {user?.name ?? "Loading..."}
                </div>
                <div className="text-xs text-muted-foreground">
                  {user?.email ?? "..."}
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                render={<Link to={`/w/${workspaceId}/profile`} />}
                nativeButton={false}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link to={`/w/${workspaceId}/settings`} />}
                nativeButton={false}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" /> Workspace settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => logout()}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default AppHeader;

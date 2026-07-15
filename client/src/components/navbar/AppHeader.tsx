import { Link, useParams } from "react-router";
import { Bell, ChevronsUpDown, LogOut, Plus, User } from "lucide-react";
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
import { useLogout } from "@/features/auth/hooks/useLogout";

const currentWorkspace = { id: "1", name: "Cannopy", logoUrl: undefined };
const otherWorkspaces = [{ id: "2", name: "Cho", logoUrl: undefined }];
const currentUser = { name: "Kyaw Gyi", email: "kyaw@example.com" };

function AppHeader() {
  const { workspaceId } = useParams();
  const { mutate: logout } = useLogout();

  const logoutFn = async () => {
    logout();
  };
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent" />
          }
        >
          <Avatar className="h-6 w-6 rounded-md">
            <AvatarImage src={currentWorkspace.logoUrl} />
            <AvatarFallback className="rounded-md text-xs">
              {currentWorkspace.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {currentWorkspace.name}
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            <DropdownMenuItem className="flex items-center gap-2">
              <Avatar className="h-5 w-5 rounded-md">
                <AvatarFallback className="rounded-md text-[10px]">
                  {currentWorkspace.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {currentWorkspace.name}
            </DropdownMenuItem>
            {otherWorkspaces.map((ws) => (
              <DropdownMenuItem key={ws.id} className="flex items-center gap-2">
                <Avatar className="h-5 w-5 rounded-md">
                  <AvatarFallback className="rounded-md text-[10px]">
                    {ws.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {ws.name}
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
            {currentUser.name.slice(0, 2).toUpperCase()}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="text-sm font-medium">{currentUser.name}</div>
                <div className="text-xs text-muted-foreground">
                  {currentUser.email}
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
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="flex items-center gap-2"
              onClick={logoutFn}
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

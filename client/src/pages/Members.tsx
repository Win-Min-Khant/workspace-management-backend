import { useState } from "react";
import { useParams } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal, Search } from "lucide-react";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useWorkspaceMembers } from "@/features/workspace/hooks/useWorkspaceMember";
import { useUpdateMemberRole } from "@/features/workspace/hooks/useUpdateMemberRole";
import { useDeleteMember } from "@/features/workspace/hooks/useDeleteMember";

const roleStyles: Record<string, string> = {
  owner: "bg-primary/10 text-primary",
  admin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  member: "bg-muted text-muted-foreground",
};

import { useMyWorkspaces } from "@/features/workspace/hooks/useMyWorkspaces";
import InviteMemberDialog from "@/components/InviteMemberDialog";

function Members() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [search, setSearch] = useState("");

  const {
    data: members,
    isLoading,
    error,
  } = useWorkspaceMembers(workspaceId as string);
  const { mutate: updateRole } = useUpdateMemberRole(workspaceId as string);
  const { mutate: removeMember } = useDeleteMember(workspaceId as string);

  // figure out our own role in this specific workspace
  const { data: workspaces } = useMyWorkspaces();
  const myRole = workspaces?.find((w) => w.workspace._id === workspaceId)?.role;

  const canInvite = myRole === "owner" || myRole === "admin";

  const filtered = (members ?? []).filter((m) =>
    m.userId.name.toLowerCase().includes(search.toLowerCase()),
  );

  function handlePromote(memberId: string, currentRole: string) {
    updateRole({
      workspaceId: workspaceId as string,
      memberId,
      role: currentRole === "admin" ? "member" : "admin",
    });
  }

  function handleRemove(memberId: string) {
    removeMember({ workspaceId: workspaceId as string, memberId });
  }

  // decides what a specific row is allowed to show, based on MY role + THEIR role
  function getRowPermissions(targetRole: string) {
    if (myRole === "owner") {
      return {
        canChangeRole: targetRole !== "owner",
        canRemove: targetRole !== "owner",
      };
    }
    if (myRole === "admin") {
      return {
        canChangeRole: false, // admins can never change roles, per spec
        canRemove: targetRole === "member", // admins can only remove plain members
      };
    }
    // plain members can't manage anyone
    return { canChangeRole: false, canRemove: false };
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        {getErrorMessage(error, "Something went wrong loading members.")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Members</h1>
          <p className="text-sm text-muted-foreground">
            Manage who has access to this workspace
          </p>
        </div>
        {canInvite && <InviteMemberDialog />}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.map((member, i) => {
            const { canChangeRole, canRemove } = getRowPermissions(member.role);
            const showMenu = canChangeRole || canRemove;

            return (
              <div
                key={member._id}
                className={`flex items-center justify-between px-4 py-3 ${
                  i !== filtered.length - 1 ? "border-b" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={member.userId.avatar?.image_url} />
                    <AvatarFallback>
                      {member.userId.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">
                      {member.userId.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {member.userId.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {member.status === "invited" && (
                    <Badge variant="secondary">Invited</Badge>
                  )}
                  <Badge
                    className={roleStyles[member.role]}
                    variant="secondary"
                  >
                    {member.role}
                  </Badge>
                  {showMenu && (
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
                        {canChangeRole && (
                          <DropdownMenuItem
                            onClick={() =>
                              handlePromote(member.userId._id, member.role)
                            }
                          >
                            {member.role === "admin"
                              ? "Demote to member"
                              : "Promote to admin"}
                          </DropdownMenuItem>
                        )}
                        {canRemove && (
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleRemove(member.userId._id)}
                          >
                            Remove from workspace
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-12">
              No members match your search.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Members;

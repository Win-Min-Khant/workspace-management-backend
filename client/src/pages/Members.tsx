import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Search } from "lucide-react";

const members = [
  {
    id: "1",
    name: "Kyaw Gyi",
    email: "kyaw@example.com",
    role: "owner",
    status: "active",
    avatarUrl: undefined,
  },
  {
    id: "2",
    name: "Mei Thant",
    email: "mei@example.com",
    role: "admin",
    status: "active",
    avatarUrl: undefined,
  },
  {
    id: "3",
    name: "Zin Ko",
    email: "zin@example.com",
    role: "member",
    status: "active",
    avatarUrl: undefined,
  },
  {
    id: "4",
    name: "Aye Chan",
    email: "aye@example.com",
    role: "member",
    status: "invited",
    avatarUrl: undefined,
  },
];

const roleStyles: Record<string, string> = {
  owner: "bg-primary/10 text-primary",
  admin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  member: "bg-muted text-muted-foreground",
};

function Members() {
  const [search, setSearch] = useState("");

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Members</h1>
          <p className="text-sm text-muted-foreground">
            Manage who has access to this workspace
          </p>
        </div>
        <InviteMemberDialog />
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
          {filtered.map((member, i) => (
            <div
              key={member.id}
              className={`flex items-center justify-between px-4 py-3 ${
                i !== filtered.length - 1 ? "border-b" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={member.avatarUrl} />
                  <AvatarFallback>
                    {member.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">{member.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {member.email}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {member.status === "invited" && (
                  <Badge variant="secondary">Invited</Badge>
                )}
                <Badge className={roleStyles[member.role]} variant="secondary">
                  {member.role}
                </Badge>
                {member.role !== "owner" && (
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
                      <DropdownMenuItem>
                        {member.role === "admin"
                          ? "Demote to member"
                          : "Promote to admin"}
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive">
                        Remove from workspace
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function InviteMemberDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button className="w-auto" />}>
        <Plus className="h-4 w-4" /> Invite member
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a member</DialogTitle>
          <DialogDescription>
            They'll receive an email invite to join this workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="invite-email">Email</FieldLabel>
            <Input
              id="invite-email"
              type="email"
              placeholder="name@company.com"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="invite-role">Role</FieldLabel>
            <Select defaultValue="member">
              <SelectTrigger id="invite-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <DialogFooter>
          <Button type="submit">Send invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default Members;

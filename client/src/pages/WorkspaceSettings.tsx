import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function WorkspaceSettings() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setLogoPreview(URL.createObjectURL(file));
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Workspace settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your workspace details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Update your workspace name and logo</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 rounded-lg">
              <AvatarImage
                src={logoPreview ?? undefined}
                className="rounded-lg"
              />
              <AvatarFallback className="rounded-lg">CA</AvatarFallback>
            </Avatar>
            <div>
              <FieldLabel htmlFor="ws-logo" className="cursor-pointer">
                <span className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
                  Change logo
                </span>
              </FieldLabel>
              <input
                id="ws-logo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
            </div>
          </div>

          <Field>
            <FieldLabel htmlFor="ws-name">Workspace name</FieldLabel>
            <Input id="ws-name" defaultValue="Cannopy" />
          </Field>
        </CardContent>
        <CardFooter>
          <Button>Save changes</Button>
        </CardFooter>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Deleting this workspace removes all projects, tasks, and members
            permanently.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Dialog>
            <DialogTrigger
              render={<Button variant="destructive" className="w-auto" />}
            >
              Delete workspace
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete this workspace?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. All projects, tasks,
                  invitations, and member access for this workspace will be
                  permanently deleted.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="destructive" className="w-auto">
                  Yes, delete workspace
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}

export default WorkspaceSettings;

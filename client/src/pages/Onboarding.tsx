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

function Onboarding() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setLogoPreview(URL.createObjectURL(file));
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle>Create your workspace</CardTitle>
          <CardDescription>
            This is where your team's projects and tasks will live
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="onboarding-form">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 rounded-lg">
                  <AvatarImage
                    src={logoPreview ?? undefined}
                    className="rounded-lg"
                  />
                  <AvatarFallback className="rounded-lg">+</AvatarFallback>
                </Avatar>
                <div>
                  <FieldLabel htmlFor="logo" className="cursor-pointer">
                    <span className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
                      Upload logo
                    </span>
                  </FieldLabel>
                  <input
                    id="logo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </div>
              </div>

              <Field>
                <FieldLabel htmlFor="onboarding-name">
                  Workspace name
                </FieldLabel>
                <Input
                  id="onboarding-name"
                  placeholder="Acme team"
                  autoComplete="off"
                />
              </Field>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" form="onboarding-form" className="w-full">
            Create workspace
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Onboarding;

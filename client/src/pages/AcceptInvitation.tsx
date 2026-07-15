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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// fake data — replace with invitation lookup by token later
const invitation = {
  workspaceName: "Cannopy",
  inviterName: "Kyaw Gyi",
  role: "member",
};

function AcceptInvitation() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full sm:max-w-md">
        <CardHeader className="items-center text-center">
          <Avatar className="h-12 w-12 mb-2">
            <AvatarFallback>
              {invitation.workspaceName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <CardTitle>Join {invitation.workspaceName}</CardTitle>
          <CardDescription>
            {invitation.inviterName} invited you to join as {invitation.role}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="accept-invite-form">
            <div className="flex flex-col gap-4">
              <Field>
                <FieldLabel htmlFor="invite-name">Full name</FieldLabel>
                <Input
                  id="invite-name"
                  placeholder="Your name"
                  autoComplete="name"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="invite-password">
                  Create a password
                </FieldLabel>
                <Input
                  id="invite-password"
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
              </Field>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" form="accept-invite-form" className="w-full">
            Accept invitation
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default AcceptInvitation;

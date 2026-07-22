import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { useVerifyInvitation } from "@/features/invitation/hooks/useVerifyInvitation";
import { acceptInvitation } from "@/features/invitation/api/invitationApi";
import { loginUser } from "@/features/auth/api/authApi";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { tokenStorage } from "@/utils/tokenStorage";
import { toast } from "react-toastify";
import {
  createAndJoinSchema,
  loginAndJoinSchema,
  type CreateAndJoinInputs,
  type LoginAndJoinInputs,
} from "@/schema/AcceptInvitation";

function AcceptInvitation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const {
    data: invitation,
    isLoading,
    error,
  } = useVerifyInvitation(token as string);

  const [mode, setMode] = useState<"create" | "login">("create");

  const createForm = useForm<CreateAndJoinInputs>({
    resolver: zodResolver(createAndJoinSchema),
    defaultValues: { name: "", password: "" },
  });

  const loginForm = useForm<LoginAndJoinInputs>({
    resolver: zodResolver(loginAndJoinSchema),
    defaultValues: { password: "" },
  });

  const createAndJoin = useMutation({
    mutationFn: (data: CreateAndJoinInputs) =>
      acceptInvitation({
        token: token as string,
        name: data.name,
        password: data.password,
      }),
    onSuccess: () => {
      toast.success("Account created! Please log in to continue.");
      navigate("/login");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const loginAndJoin = useMutation({
    mutationFn: async (data: LoginAndJoinInputs) => {
      const loginResult = await loginUser({
        email: invitation!.email,
        password: data.password,
      });
      tokenStorage.setTokens(loginResult.accessToken, loginResult.refreshToken);
      tokenStorage.setUserId(loginResult.user.id);
      return acceptInvitation({ token: token as string });
    },
    onSuccess: (data) => {
      toast.success("Joined the workspace!");
      navigate(`/w/${data.workspaceId}/dashboard`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p className="text-sm text-destructive">
          {getErrorMessage(
            error,
            "This invitation link is invalid or has expired.",
          )}
        </p>
      </div>
    );
  }

  const isPending = createAndJoin.isPending || loginAndJoin.isPending;

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full sm:max-w-md">
        <CardHeader className="items-center text-center flex flex-col">
          <Avatar className="h-12 w-12 mb-2">
            <AvatarImage src={invitation.workspace.logo ?? undefined} />
            <AvatarFallback>
              {invitation.workspace.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <CardTitle>Join {invitation.workspace.name}</CardTitle>
          <CardDescription>
            You've been invited to join as {invitation.role}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Field className="mb-4">
            <FieldLabel htmlFor="invite-email">Email</FieldLabel>
            <Input
              id="invite-email"
              type="email"
              value={invitation.email}
              disabled
            />
          </Field>

          {mode === "create" ? (
            <form
              id="accept-invite-form"
              onSubmit={createForm.handleSubmit((data) =>
                createAndJoin.mutate(data),
              )}
            >
              <div className="flex flex-col gap-4">
                <Controller
                  name="name"
                  control={createForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="invite-name">Full name</FieldLabel>
                      <Input
                        {...field}
                        id="invite-name"
                        placeholder="Your name"
                        autoComplete="name"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="password"
                  control={createForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="invite-password">
                        Create a password
                      </FieldLabel>
                      <Input
                        {...field}
                        id="invite-password"
                        type="password"
                        placeholder="At least 8 characters"
                        autoComplete="new-password"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </form>
          ) : (
            <form
              id="accept-invite-form"
              onSubmit={loginForm.handleSubmit((data) =>
                loginAndJoin.mutate(data),
              )}
            >
              <Controller
                name="password"
                control={loginForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="invite-login-password">
                      Password
                    </FieldLabel>
                    <Input
                      {...field}
                      id="invite-login-password"
                      type="password"
                      placeholder="Your password"
                      autoComplete="current-password"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            form="accept-invite-form"
            disabled={isPending}
            className="w-full"
          >
            {isPending
              ? "Please wait..."
              : mode === "create"
                ? "Create account & join"
                : "Log in & join"}
          </Button>

          <button
            type="button"
            onClick={() => setMode(mode === "create" ? "login" : "create")}
            className="text-xs text-muted-foreground hover:underline"
          >
            {mode === "create"
              ? "Already have an account? Log in instead"
              : "New here? Create an account instead"}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default AcceptInvitation;

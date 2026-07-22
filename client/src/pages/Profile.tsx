import { useState } from "react";
import { useParams } from "react-router";
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
import { useProfile } from "@/features/auth/hooks/useProfile";
import { useUpdateName } from "@/features/auth/hooks/useUpdateName";
import { useUpdateAvatar } from "@/features/auth/hooks/useUpdateAvatar";
import { Loader2 } from "lucide-react";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { tokenStorage } from "@/utils/tokenStorage";

function Profile() {
  const { workspaceId } = useParams();
  const { data: user, isLoading, error } = useProfile(workspaceId as string);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <p className="text-sm text-destructive">
        {getErrorMessage(error, "Something went wrong loading your profile.")}
      </p>
    );
  }

  // by this point, `user` is guaranteed to exist — safe to use directly
  return <ProfileForm user={user} />;
}

function ProfileForm({
  user,
}: {
  user: NonNullable<ReturnType<typeof useProfile>["data"]>;
}) {
  // const { workspaceId } = useParams();
  const [name, setName] = useState(user.name);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { mutate: saveNameChange, isPending: isSavingName } = useUpdateName();
  const { mutate: saveAvatarChange, isPending: isSavingAvatar } =
    useUpdateAvatar();

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  }

  function handleSaveName() {
    const userId = tokenStorage.getUserId();
    if (!userId) return;

    saveNameChange({ userId, name });
  }

  function handleSaveAvatar() {
    const userId = tokenStorage.getUserId();
    if (!userId || !avatarFile) return;

    saveAvatarChange({ userId, avatar: avatarFile });
  }

  const isNameUnchanged = name === user.name;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal account details
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
            <CardDescription>Update your profile photo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarPreview ?? user.avatar?.image_url} />
                <AvatarFallback>
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <FieldLabel htmlFor="avatar" className="cursor-pointer">
                  <span className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
                    Change photo
                  </span>
                </FieldLabel>
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSaveAvatar}
              disabled={isSavingAvatar || !avatarFile}
            >
              {isSavingAvatar ? "Saving..." : "Save changes"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Full name</CardTitle>
            <CardDescription>Update your display name</CardDescription>
          </CardHeader>
          <CardContent>
            <Field>
              <FieldLabel htmlFor="fullName">Full name</FieldLabel>
              <Input
                id="fullName"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSaveName}
              disabled={isSavingName || isNameUnchanged}
            >
              {isSavingName ? "Saving..." : "Save changes"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Email</CardTitle>
            <CardDescription>
              Your email is tied to your account and can't be changed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Field>
              {/* <FieldLabel htmlFor="email">Email</FieldLabel> */}
              <Input id="email" type="email" value={user.email} disabled />
            </Field>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password. You'll be signed out of other devices.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Field>
              <FieldLabel htmlFor="currentPassword">
                Current password
              </FieldLabel>
              <Input id="currentPassword" type="password" />
            </Field>
            <Field>
              <FieldLabel htmlFor="newPassword">New password</FieldLabel>
              <Input
                id="newPassword"
                type="password"
                placeholder="At least 8 characters"
              />
            </Field>
          </CardContent>
          <CardFooter>
            <Button disabled>Update password</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default Profile;

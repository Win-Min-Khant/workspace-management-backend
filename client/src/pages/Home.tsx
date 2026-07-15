import { Link } from "react-router";
import { Folder, CheckSquare, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Home() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mx-auto max-w-md text-center mb-16">
        <Badge variant="secondary" className="mb-4">
          Now in beta
        </Badge>
        <h1 className="text-3xl font-semibold mb-3">
          Project management that stays out of your way
        </h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Organize projects, assign tasks, and track progress with your team —
          all in one clean workspace.
        </p>
        <Button
          render={<Link to="/register" />}
          nativeButton={false}
          className="w-auto px-6"
        >
          Get started free
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <Folder className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm mt-2">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Organize work into projects your whole team can see.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CheckSquare className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm mt-2">Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Assign work, track status, and hit your deadlines.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm mt-2">Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Invite your team and manage roles with ease.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Home;

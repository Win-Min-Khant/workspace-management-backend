import { Outlet, useParams } from "react-router";
import Sidebar from "../Sidebar";
import Footer from "../navbar/Footer";
import AppHeader from "../navbar/AppHeader";

function MainLayout() {
  const { workspaceId } = useParams();
  const workspaceIdString = String(workspaceId);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />

      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 md:block">
          <Sidebar workspaceId={workspaceIdString} />
        </aside>

        <main className="flex-1 overflow-y-auto bg-muted/20">
          <div className="mx-auto max-w-6xl p-6">
            <Outlet />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default MainLayout;

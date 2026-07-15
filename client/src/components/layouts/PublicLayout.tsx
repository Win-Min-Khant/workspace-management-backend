import { Outlet } from "react-router";
import Header from "../navbar/Header";
import Footer from "../navbar/Footer";

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;

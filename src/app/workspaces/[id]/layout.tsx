import { PropsWithChildren } from "react";
import { AppSidebar } from "../../components/app-sidebar";

export default function ProjectsLayout({
  children,
}: Readonly<PropsWithChildren>) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

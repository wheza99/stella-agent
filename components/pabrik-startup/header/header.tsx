"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { EditableProjectTitle } from "./editable-project-title";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/user-context";
import { useEffect, useState } from "react";

export function AppHeader() {
  const pathname = usePathname();
  const { projects, updateProjectTitle } = useUser();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState<string>("");

  // Extract project ID from pathname
  useEffect(() => {
    const match = pathname.match(/\/project\/([a-f0-9-]+)/);
    if (match) {
      setProjectId(match[1]);
    } else {
      setProjectId(null);
    }
  }, [pathname]);

  // Get project title from projects list
  useEffect(() => {
    if (projectId) {
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        setProjectTitle(project.title);
      }
    }
  }, [projectId, projects]);

  const handleTitleUpdated = (newTitle: string) => {
    setProjectTitle(newTitle);
    updateProjectTitle?.(projectId!, newTitle);
  };

  return (
    <header className="flex w-full px-4 h-16 border-b shrink-0 items-center gap-3 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <SidebarTrigger />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />
      {projectId && projectTitle && (
        <div className="group flex items-center">
          <EditableProjectTitle
            projectId={projectId}
            initialTitle={projectTitle}
            onTitleUpdated={handleTitleUpdated}
          />
        </div>
      )}
    </header>
  );
}

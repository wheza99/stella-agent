"use client";

import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../../ui/sidebar'
import { FolderIcon, PlusIcon } from 'lucide-react'
import { useUser } from '@/context/user-context'
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

function SidebarProject() {
  const { projects } = useUser();
  const router = useRouter();

  return (
    <>
      <SidebarGroup>
        <Button onClick={() => { router.push("/") }}>
          <PlusIcon />
          New Project
        </Button>
      </SidebarGroup>

      {projects.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>
            Projects
          </SidebarGroupLabel>
          <SidebarMenu>
            {projects.map((project) => (
              <SidebarMenuItem key={project.id}>
                <SidebarMenuButton onClick={() => { router.push(`/project/${project.id}`) }}>
                  <FolderIcon size={20} />
                  {project.title}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu >
        </SidebarGroup>
      )}
    </>
  )
}

export default SidebarProject

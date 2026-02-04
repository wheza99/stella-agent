import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "../ui/sidebar"
import SidebarOrganization from "./sidebar-organization"
import SidebarUser from "./sidebar-user"

function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarOrganization />
      </SidebarHeader>
      <SidebarContent></SidebarContent>
      <SidebarFooter>
        <SidebarUser />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar

"use client";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '../ui/sidebar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogInIcon, LogOut, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/user-context'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '../ui/item'
import { Button } from '../ui/button';

function SidebarUser() {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { user, refreshUser } = useUser();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (response.ok) {
        await refreshUser();
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {user
          ?
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Item className="p-0 w-full">
                  <ItemMedia>
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={undefined}
                        alt={user?.name ?? undefined}
                      />
                      <AvatarFallback className="rounded-lg">
                        CN
                      </AvatarFallback>
                    </Avatar>
                  </ItemMedia>
                  <ItemContent className="gap-y-0">
                    <ItemTitle>
                      {user?.name}
                    </ItemTitle>
                    <ItemDescription>
                      {user?.email}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </ItemActions>
                </Item>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <Item className="px-1 py-1.5">
                  <ItemMedia>
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={undefined}
                        alt={user?.name ?? undefined}
                      />
                      <AvatarFallback className="rounded-lg">
                        CN
                      </AvatarFallback>
                    </Avatar>
                  </ItemMedia>
                  <ItemContent className="gap-y-0">
                    <ItemTitle>
                      {user?.name}
                    </ItemTitle>
                    <ItemDescription>
                      {user?.email}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Sparkles />
                  Upgrade to Pro
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <BadgeCheck />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          :
          <Button className="w-full gap-2" variant="outline" onClick={() => router.push("/auth/login")} >
            <LogInIcon />
            Login
          </Button>
        }
      </SidebarMenuItem>
    </SidebarMenu >
  )
}

export default SidebarUser

"use client";

import { Calendar, Home, Inbox, Search, Settings, Zap } from "lucide-react"
import { useUser } from "@/hooks/useUser";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const { isAdmin } = useUser();

  // Menu items (available to all users)
  const baseItems = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Inbox,
    },
    {
      title: "Escrow",
      url: "/escrow",
      icon: Calendar,
    },
    {
      title: "Transactions",
      url: "/transactions",
      icon: Search,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ];

  // Add Integrations only for admin users
  const items = [
    ...baseItems,
    ...(isAdmin ? [{
      title: "Integrations",
      url: "/integrations",
      icon: Zap,
    }] : []),
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
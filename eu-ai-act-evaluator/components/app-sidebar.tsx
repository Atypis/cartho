"use client"

import * as React from "react"
import { Folder, Plus, User, ChevronUp } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Separator } from "@/components/ui/separator"
import { PixelLawyerAnimated } from "@/components/PixelLawyer"
import { useThemeStore } from "@/stores/useThemeStore"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  useCaseCount: number
  onNavigateHome: () => void
  onCreateNew: () => void
  currentView: string
}

export function AppSidebar({
  useCaseCount,
  onNavigateHome,
  onCreateNew,
  currentView,
  ...props
}: AppSidebarProps) {
  const isHome = currentView === 'welcome'
  const { isMobile } = useSidebar()
  const theme = useThemeStore((state) => state.theme)

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header - Clean and minimal */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {theme === 'medieval' ? (
                <div className="flex aspect-square size-12 items-center justify-center">
                  <PixelLawyerAnimated className="w-12 h-12" />
                </div>
              ) : (
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-neutral-900">
                  <span className="text-sm font-bold text-white">EU</span>
                </div>
              )}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">AI Act Evaluator</span>
                <span className="truncate text-xs text-sidebar-foreground/50">
                  {theme === 'medieval' ? 'Legal Scrolls' : 'Compliance'}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Navigation - Simplified */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Use Cases - Direct navigation */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onNavigateHome}
                  isActive={isHome}
                  tooltip="Use Cases"
                >
                  <Folder />
                  <span>Use Cases</span>
                  {useCaseCount > 0 && (
                    <SidebarMenuBadge>{useCaseCount}</SidebarMenuBadge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* New Use Case - Subtle */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onCreateNew}
                  tooltip="Create New Use Case"
                  className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
                >
                  <Plus />
                  <span>New Use Case</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer - User Profile */}
      <SidebarFooter>
        <SidebarMenu>
          {/* Theme Toggle */}
          <SidebarMenuItem>
            <ThemeToggle />
          </SidebarMenuItem>
          <Separator className="my-2" />
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src="/avatars/user.jpg" alt="User" />
                    <AvatarFallback className="rounded-lg bg-neutral-200 text-neutral-700 text-xs font-medium">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Compliance Team</span>
                    <span className="truncate text-xs text-sidebar-foreground/50">
                      {useCaseCount} {useCaseCount === 1 ? 'system' : 'systems'}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "top"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src="/avatars/user.jpg" alt="User" />
                      <AvatarFallback className="rounded-lg bg-neutral-200 text-neutral-700">
                        JD
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">Compliance Team</span>
                      <span className="truncate text-xs text-muted-foreground">team@company.eu</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

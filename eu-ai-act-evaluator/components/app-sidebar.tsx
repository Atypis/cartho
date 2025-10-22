"use client"

import * as React from "react"
import { Folder, Plus } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

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

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header - Branding */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-sm font-bold text-white">EU</span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">AI Act Evaluator</span>
                <span className="truncate text-xs">Compliance Tool</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent>
        <SidebarMenu>
          {/* Use Cases */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onNavigateHome}
              isActive={isHome}
              tooltip="Use Cases"
            >
              <Folder />
              <span>Use Cases</span>
              {useCaseCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-md bg-sidebar-accent px-1.5 text-xs font-medium tabular-nums">
                  {useCaseCount}
                </span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="my-2" />

        {/* New Use Case Button */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onCreateNew}
              className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
              tooltip="Create New Use Case"
            >
              <Plus />
              <span>New Use Case</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      {/* Footer - Stats */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex flex-col gap-2 rounded-lg border border-sidebar-border p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-sidebar-foreground/70">Systems Documented</span>
                <span className="font-semibold tabular-nums">{useCaseCount}</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

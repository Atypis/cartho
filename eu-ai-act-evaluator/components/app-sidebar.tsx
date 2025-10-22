"use client"

import * as React from "react"
import { Folder, Plus, FileText, ChevronRight } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
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
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-sm font-bold text-white">EU</span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">AI Act Evaluator</span>
                <span className="truncate text-xs text-sidebar-foreground/70">Compliance Tool</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Use Cases Section */}
              <Collapsible asChild defaultOpen={true} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Use Cases">
                      <Folder />
                      <span>Use Cases</span>
                      {useCaseCount > 0 && (
                        <span className="ml-auto mr-2 flex h-5 min-w-5 items-center justify-center rounded-md bg-sidebar-accent px-1.5 text-xs font-medium tabular-nums">
                          {useCaseCount}
                        </span>
                      )}
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          onClick={onNavigateHome}
                          isActive={isHome}
                        >
                          <FileText className="h-4 w-4" />
                          <span>All Systems</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* New Use Case Button */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onCreateNew}
                  className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white data-[state=open]:bg-blue-700"
                  tooltip="Create New Use Case"
                >
                  <Plus />
                  <span>New Use Case</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer - Stats */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex flex-col gap-1.5 rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-sidebar-foreground/70">Systems</span>
                <span className="text-sm font-semibold tabular-nums">{useCaseCount}</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

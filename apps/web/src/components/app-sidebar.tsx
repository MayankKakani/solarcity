import type * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { ThemeToggleDropdown } from "@/components/theme-toggle-dropdown";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { shortcuts } from "@/constants/shortcuts";
import { useRegisterShortcuts } from "@/hooks/use-keyboard-shortcuts";
// import { useWorkspacePermission } from "@/hooks/use-workspace-permission";
import Search from "./search";
import { UserAvatar } from "./user-avatar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar } = useSidebar();
  // const { isAdmin } = useWorkspacePermission();

  useRegisterShortcuts({
    modifierShortcuts: {
      [shortcuts.sidebar.prefix]: {
        [shortcuts.sidebar.toggle]: toggleSidebar,
      },
    },
  });

  return (
    <Sidebar
      collapsible="offcanvas"
      variant="inset"
      className="border-none pt-1.5"
      {...props}
    >
      <SidebarHeader className="pt-1 pb-1.5">
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent className="overflow-hidden gap-1 py-1">
        <Search />
        <NavProjects />
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between">
          <div className="w-full ">
            <UserAvatar />
          </div>
          <ThemeToggleDropdown />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

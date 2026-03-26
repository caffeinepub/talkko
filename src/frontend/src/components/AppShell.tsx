import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "@tanstack/react-router";
import { Bell, Compass, Home, PenSquare, User } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCallerProfile,
  useUnreadNotifCount,
} from "../hooks/useSocialQueries";
import { CreatePostModal } from "./CreatePostModal";
import { UserAvatar } from "./UserAvatar";

interface AppShellProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Explore", icon: Compass, path: "/explore" },
  { label: "Notifications", icon: Bell, path: "/notifications" },
  { label: "Profile", icon: User, path: "/profile" },
];

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const { data: callerProfile } = useCallerProfile();
  const { data: unreadCount = 0 } = useUnreadNotifCount();
  const { clear } = useInternetIdentity();
  const [createOpen, setCreateOpen] = useState(false);

  const username = callerProfile?.username || "You";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-[260px] bg-sidebar border-r border-sidebar-border z-30"
        data-ocid="nav.panel"
      >
        {/* Brand */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">t</span>
          </div>
          <span className="text-foreground font-bold text-lg tracking-tight">
            Talkko
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
            const isActive =
              location.pathname === path ||
              (path !== "/" && location.pathname.startsWith(path));
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
                data-ocid={`nav.${label.toLowerCase()}.link`}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {label === "Notifications" && unreadCount > 0 && (
                    <Badge className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-0.5 text-[10px] bg-primary text-primary-foreground flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </div>
                <span>{label}</span>
              </Link>
            );
          })}

          <Button
            onClick={() => setCreateOpen(true)}
            className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            data-ocid="nav.new_post.primary_button"
          >
            <PenSquare className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </nav>

        {/* User block */}
        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <UserAvatar username={username} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {username}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                @{username.toLowerCase().replace(/\s+/g, "_")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              className="text-muted-foreground hover:text-foreground text-xs px-2"
              data-ocid="nav.logout.secondary_button"
            >
              Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-[260px] min-h-screen pb-16 lg:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-6">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border z-30 flex items-center justify-around px-2 py-2"
        data-ocid="nav.mobile.panel"
      >
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
          const isActive =
            location.pathname === path ||
            (path !== "/" && location.pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-ocid={`nav.mobile.${label.toLowerCase()}.link`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {label === "Notifications" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary text-[8px] text-primary-foreground flex items-center justify-center">
                    {unreadCount > 9 ? "9" : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-primary"
          data-ocid="nav.mobile.new_post.button"
        >
          <PenSquare className="h-5 w-5" />
          <span className="text-[10px] font-medium">Post</span>
        </button>
      </nav>

      <CreatePostModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

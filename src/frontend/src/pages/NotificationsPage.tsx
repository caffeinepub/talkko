import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, UserPlus } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { UserAvatar } from "../components/UserAvatar";
import {
  useAllProfiles,
  useMarkNotificationsRead,
  useNotifications,
} from "../hooks/useSocialQueries";
import type { Profile } from "../types/social";
import { relativeTime } from "../utils/helpers";

const NOTIF_ICONS: Record<string, typeof Heart> = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
};

const NOTIF_COLORS: Record<string, string> = {
  like: "text-red-400",
  comment: "text-primary",
  follow: "text-green-400",
};

const NOTIF_TEXT: Record<string, string> = {
  like: "liked your post",
  comment: "commented on your post",
  follow: "started following you",
};

export function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications();
  const { data: profiles = [] } = useAllProfiles();
  const markRead = useMarkNotificationsRead();
  const markedRef = useRef(false);

  const profilesMap = profiles.reduce<Record<string, Profile>>((acc, p) => {
    acc[p.principal.toString()] = p;
    return acc;
  }, {});

  useEffect(() => {
    if (!markedRef.current) {
      markedRef.current = true;
      markRead.mutate();
    }
  }, [markRead]);

  return (
    <div className="space-y-4" data-ocid="notifications.page">
      <h1 className="text-xl font-bold text-foreground">Notifications</h1>

      {isLoading ? (
        <div className="space-y-3" data-ocid="notifications.loading_state">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-4 flex gap-3"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div
          className="bg-card border border-border rounded-xl p-10 text-center"
          data-ocid="notifications.empty_state"
        >
          <BellIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No notifications yet</p>
          <p className="text-muted-foreground text-sm mt-1">
            When someone likes or comments on your posts, you'll see it here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif, idx) => {
            const sender = profilesMap[notif.senderPrincipal.toString()];
            const Icon = NOTIF_ICONS[notif.notifType] || Heart;
            const color = NOTIF_COLORS[notif.notifType] || "text-primary";
            const text = NOTIF_TEXT[notif.notifType] || "interacted with you";

            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={cn(
                  "bg-card border rounded-xl p-4 flex items-center gap-3 transition-colors",
                  !notif.isRead ? "border-primary/30 bg-card" : "border-border",
                )}
                data-ocid={`notifications.item.${idx + 1}`}
              >
                <div className="relative">
                  <UserAvatar username={sender?.username || "?"} size="md" />
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-card flex items-center justify-center",
                      color,
                    )}
                  >
                    <Icon
                      className="h-3 w-3"
                      fill={
                        notif.notifType === "like" ? "currentColor" : "none"
                      }
                    />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <Link
                      to="/profile/$principalText"
                      params={{
                        principalText: notif.senderPrincipal.toString(),
                      }}
                      className="font-semibold hover:text-primary transition-colors"
                    >
                      {sender?.username || "Someone"}
                    </Link>{" "}
                    {text}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {relativeTime(notif.createdAt)}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <title>Bell</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
      />
    </svg>
  );
}

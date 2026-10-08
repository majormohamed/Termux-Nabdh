"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { formatDateTime } from "@/lib/utils";

type Notification = {
  id: string;
  title: string;
  body?: string | null;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  async function load() {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnread(data.unreadCount ?? 0);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, []);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    load();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-2 py-1.5 text-sm font-semibold">الإشعارات</div>
        <DropdownMenuSeparator />
        {notifications.length === 0 && (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">لا توجد إشعارات</div>
        )}
        {notifications.slice(0, 8).map((n) => (
          <DropdownMenuItem
            key={n.id}
            className={n.isRead ? "opacity-60" : "font-medium"}
            onClick={() => markRead(n.id)}
          >
            <Link href={n.link ?? "/notifications"} className="flex flex-col gap-0.5">
              <span>{n.title}</span>
              {n.body && <span className="line-clamp-1 text-xs text-muted-foreground">{n.body}</span>}
              <span className="text-[10px] text-muted-foreground">{formatDateTime(n.createdAt)}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { getSessionUser } from "@/lib/rbac";
import { Sidebar } from "@/components/sidebar";
import { NotificationBell } from "@/components/notification-bell";

export async function AppShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const user = await getSessionUser();
  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen">
      <Sidebar roles={user.roles} />
      <div className="md:mr-64">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-card/80 px-4 backdrop-blur md:px-6">
          <h1 className="text-base font-semibold md:text-lg">{title ?? "نبض"}</h1>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:block">{user.name}</span>
            <NotificationBell />
          </div>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

import "./admin-v6.css";
import { AdminAppChrome } from "@/components/admin/AdminAppChrome";
import { getEventCapabilities } from "@/lib/event-capabilities";
import { getAdminSession } from "@/lib/sessions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  const capabilities = session ? await getEventCapabilities(session.event_id) : [];

  return (
    <AdminAppChrome showGifts={capabilities.includes("gifts")}>
      {children}
    </AdminAppChrome>
  );
}

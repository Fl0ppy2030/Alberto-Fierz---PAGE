import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { createClient } from "@/lib/supabaseServer";

export default async function DashboardLayout({ children }) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <div className="admin-brand">
            ALBERTO FIERZ
            <span>PAINEL ADMIN</span>
          </div>
          <nav className="admin-nav">
            <Link href="/admin/avisos">Avisos</Link>
            <Link href="/admin/projetos">Projetos</Link>
            <Link href="/admin/jornal">Jornal semanal</Link>
            <Link href="/admin/galeria">Galeria de fotos</Link>
            <Link href="/" target="_blank">↗ Ver site publicado</Link>
          </nav>
        </div>
        <div className="admin-sidebar-footer">
          <p style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", color: "rgba(255,255,255,0.55)", marginBottom: "10px" }}>
            {session?.user?.email}
          </p>
          <LogoutButton />
        </div>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}

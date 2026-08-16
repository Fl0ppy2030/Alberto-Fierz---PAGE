"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className="btn btn-sm" style={{ color: "var(--white)", borderColor: "rgba(255,255,255,0.4)", width: "100%" }}>
      Sair
    </button>
  );
}

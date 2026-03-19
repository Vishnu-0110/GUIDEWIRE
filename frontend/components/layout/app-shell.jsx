"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/buy-policy", label: "Buy Policy" },
  { href: "/monitoring", label: "Monitoring" },
  { href: "/claims", label: "Claims" },
  { href: "/admin", label: "Admin" }
];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearSession } = useAuthStore();

  const onLogout = () => {
    clearSession();
    router.push("/");
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="text-lg font-black uppercase tracking-widest text-primary">
            GigShield AI
          </Link>
          <nav className="hidden gap-2 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                  pathname === link.href ? "bg-accent/70" : "hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <p className="hidden text-sm font-semibold md:block">{user?.name || "Partner"}</p>
            <Button variant="outline" size="sm" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

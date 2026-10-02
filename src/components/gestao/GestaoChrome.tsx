"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, LogOut, Palette, Plus } from "lucide-react";

const navItems = [
  { href: "/gestao", label: "Eventos", icon: CalendarDays, match: (path: string) => path === "/gestao", primary: false },
  { href: "/gestao/painel", label: "Painel", icon: LayoutDashboard, match: (path: string) => path === "/gestao/painel", primary: false },
  { href: "/gestao/eventos/novo", label: "Novo", icon: Plus, match: (path: string) => path.startsWith("/gestao/eventos/novo"), primary: true },
  { href: "/gestao/editor", label: "Editor", icon: Palette, match: (path: string) => path.startsWith("/gestao/editor"), primary: false },
] as const;

export function GestaoChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fullScreen = pathname === "/gestao/login" || pathname.startsWith("/gestao/editor");

  if (fullScreen) return <>{children}</>;

  return (
    <div className="gestao-shell">
      <header className="gestao-topbar">
        <Link href="/gestao" className="gestao-brand" aria-label="TConvido Gestão">
          <strong>TConvido</strong>
          <small>Gestão</small>
        </Link>

        <div className="gestao-topbar-actions">
          <Link href="/gestao" className="gestao-topbar-link"><CalendarDays size={15} /> Eventos</Link>
          <Link href="/gestao/painel" className="gestao-topbar-link"><LayoutDashboard size={15} /> Painel</Link>
          <Link href="/gestao/editor" className="gestao-topbar-link"><Palette size={15} /> Editor</Link>
          <Link href="/gestao/eventos/novo" className="gestao-topbar-link is-primary"><Plus size={15} /> Novo evento</Link>
          <form action="/api/owner/logout" method="post">
            <button type="submit" className="gestao-logout"><LogOut size={15} /> Sair</button>
          </form>
        </div>
      </header>

      <div className="gestao-main">{children}</div>

      <nav className="gestao-bottom-nav" aria-label="Navegação da gestão">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={"gestao-bottom-nav__item" + (active ? " is-active" : "") + (item.primary ? " is-primary" : "")}
              aria-current={active ? "page" : undefined}
            >
              <span className="gestao-bottom-nav__icon"><Icon size={22} strokeWidth={active ? 2.4 : 1.9} /></span>
              <small>{item.label}</small>
            </Link>
          );
        })}
        <form action="/api/owner/logout" method="post" className="gestao-bottom-nav__form">
          <button type="submit" className="gestao-bottom-nav__item">
            <span className="gestao-bottom-nav__icon"><LogOut size={22} strokeWidth={1.9} /></span>
            <small>Sair</small>
          </button>
        </form>
      </nav>
    </div>
  );
}

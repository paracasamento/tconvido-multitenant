"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ClipboardList, ImagePlus, LayoutDashboard, LogOut, LayoutTemplate } from "lucide-react";

const navItems = [
  { href: "/gestao", label: "Início", icon: LayoutDashboard, match: (path: string) => path === "/gestao" },
  { href: "/gestao/fichas", label: "Fichas", icon: ClipboardList, match: (path: string) => path.startsWith("/gestao/fichas") },
  { href: "/gestao/eventos", label: "Eventos", icon: CalendarDays, match: (path: string) => path.startsWith("/gestao/eventos") },
  { href: "/gestao/modelos", label: "Modelos", icon: LayoutTemplate, match: (path: string) => path.startsWith("/gestao/modelos") },
  { href: "/gestao/biblioteca", label: "Biblioteca", icon: ImagePlus, match: (path: string) => path.startsWith("/gestao/biblioteca") },
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
          <Link href="/gestao" className="gestao-topbar-link"><LayoutDashboard size={15} /> Início</Link>
          <Link href="/gestao/fichas" className="gestao-topbar-link"><ClipboardList size={15} /> Fichas</Link>
          <Link href="/gestao/eventos" className="gestao-topbar-link"><CalendarDays size={15} /> Eventos</Link>
          <Link href="/gestao/modelos" className="gestao-topbar-link"><LayoutTemplate size={15} /> Modelos</Link>
          <Link href="/gestao/biblioteca" className="gestao-topbar-link"><ImagePlus size={15} /> Biblioteca</Link>
          <form action="/api/owner/logout" method="post"><button type="submit" className="gestao-logout"><LogOut size={15} /> Sair</button></form>
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
              className={"gestao-bottom-nav__item" + (active ? " is-active" : "")}
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

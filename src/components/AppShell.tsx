import { Link } from "@tanstack/react-router";
import { Home, PlusCircle, Warehouse } from "lucide-react";
import type { ReactNode } from "react";

const tabs = [
  { to: "/", label: "Today", icon: Home },
  { to: "/batches/new", label: "New batch", icon: PlusCircle },
  { to: "/incubators", label: "Incubators", icon: Warehouse },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col">
      <main className="flex-1 px-4 pb-28 pt-6">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t bg-card/95 backdrop-blur">
        <div className="mx-auto grid max-w-lg grid-cols-3 pb-[env(safe-area-inset-bottom)]">
          {tabs.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true }}
              className="flex min-h-16 flex-col items-center justify-center gap-1 text-sm font-semibold text-muted-foreground data-[status=active]:text-primary"
            >
              <Icon className="size-6" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function PageTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <header className="mb-5">
      <h1 className="text-3xl font-semibold leading-tight">{children}</h1>
      {sub && <p className="mt-1 text-muted-foreground">{sub}</p>}
    </header>
  );
}

export const btn =
  "inline-flex min-h-14 items-center justify-center gap-2 rounded-xl px-5 text-lg font-bold transition active:scale-[0.98] disabled:opacity-50";
export const btnPrimary = `${btn} bg-primary text-primary-foreground`;
export const btnSecondary = `${btn} bg-secondary text-secondary-foreground`;
export const field =
  "min-h-14 w-full rounded-xl border border-input bg-card px-4 text-lg outline-none focus:ring-2 focus:ring-ring";

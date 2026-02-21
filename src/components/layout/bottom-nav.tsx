"use client";

/**
 * BottomNav — 5-tab application navigation.
 *
 * Tabs: Read / Journey / Trails / Library / Profile
 * Uses Phosphor icons as specified in the coding plan.
 * Active tab: accent color + dot indicator above icon.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  MapTrifold,
  GitFork,
  Books,
  User,
} from "@phosphor-icons/react";

const TABS = [
  { href: "/dashboard", label: "Read", Icon: BookOpen },
  { href: "/journey", label: "Journey", Icon: MapTrifold },
  { href: "/trails", label: "Trails", Icon: GitFork },
  { href: "/library", label: "Library", Icon: Books },
  { href: "/profile", label: "Profile", Icon: User },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex h-[60px] border-t"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 relative transition-opacity"
            style={{ color: active ? "var(--color-accent)" : "var(--color-text-3)" }}
            aria-current={active ? "page" : undefined}
          >
            {/* Active dot above icon */}
            {active && (
              <span
                className="absolute top-1.5 w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--color-accent)" }}
              />
            )}
            <Icon size={22} weight={active ? "fill" : "regular"} />
            <span
              className="text-[10px] font-medium tracking-wide"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

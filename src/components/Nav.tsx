"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Today" },
    { href: "/calendar", label: "Calendar" },
    { href: "/goals", label: "Goals & Weekly" },
    { href: "/training", label: "Boxing & Calisthenics" },
    { href: "/nutrition", label: "23:1 OMAD" },
    { href: "/progress", label: "170→155 Recomp" },
    { href: "/learning", label: "How-To Videos" },
    { href: "/coaching", label: "Stoic Coach" },
    { href: "/quests", label: "Quests" },
    { href: "/character", label: "Character HUD" },
    { href: "/imports", label: "Document Vault" },
    { href: "/settings", label: "⚙️ Settings" },
  ];

  return (
    <nav className="max-w-4xl mx-auto px-4 mt-3 overflow-x-auto">
      <div className="flex border-b border-red-950/70 gap-1.5 min-w-max">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const tourId =
            link.href === "/calendar"
              ? "tour-target-calendar-link"
              : link.href === "/nutrition"
              ? "tour-target-nutrition-link"
              : link.href === "/learning"
              ? "tour-target-learning-link"
              : undefined;

          return (
            <Link
              key={link.href}
              href={link.href}
              id={tourId}
              className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider transition rounded-t-md ${
                isActive
                  ? "text-amber-400 border-b-2 border-red-500 bg-red-950/20 shadow-sm"
                  : "text-white hover:text-amber-300 border-b-2 border-transparent hover:border-amber-500/40 hover:bg-white/[0.03]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

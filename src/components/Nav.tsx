"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Today Command" },
    { href: "/training", label: "Calisthenics & Boxing" },
    { href: "/character", label: "Character Status" },
    { href: "/quests", label: "Quest Vault" },
    { href: "/settings", label: "Settings & Founder" },
  ];

  return (
    <nav className="max-w-4xl mx-auto px-4 mt-4 overflow-x-auto">
      <div className="flex border-b border-[#232636] gap-2 min-w-max">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
                isActive
                  ? "text-amber-400 border-b-2 border-amber-500"
                  : "text-slate-400 border-b-2 border-transparent hover:text-slate-200"
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

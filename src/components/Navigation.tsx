"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  List,
  Tag,
  BookOpen,
  Sparkles,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shows", label: "My Shows", icon: List },
  { href: "/reading", label: "Reading", icon: BookOpen },
  { href: "/keywords", label: "Keywords", icon: Tag },
  { href: "/recommendations", label: "For You", icon: Sparkles },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-[rgba(0,0,0,0.06)] z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl tracking-tight">Drama Tracker</h1>
        </div>

        {/* Desktop links */}
        <div className="hidden sm:flex gap-2 items-center">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                pathname === href
                  ? "bg-[#d4a5a5] text-white"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <Icon size={18} />
              <span className="text-sm">{label}</span>
            </Link>
          ))}
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-400 transition-all"
          >
            <LogOut size={18} />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="sm:hidden p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-all"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-[rgba(0,0,0,0.06)] bg-white/95 backdrop-blur-md px-4 py-3 flex flex-col gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                pathname === href
                  ? "bg-[#d4a5a5]/15 text-[#d4a5a5]"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} />
              <span className="text-sm">{label}</span>
            </Link>
          ))}
          <div className="h-px bg-gray-100 my-1" />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-400 transition-all"
          >
            <LogOut size={18} />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      )}
    </nav>
  );
}

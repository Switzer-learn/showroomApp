"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/app/utils/supabase/client";
import { getUserLevelAction } from "@/app/actions/userActions";
import {
  FaHome,
  FaChartBar,
  FaUsers,
  FaCar,
  FaSignOutAlt,
} from "react-icons/fa";

export default function DashboardSideMenu() {
  const [userLevel, setUserLevel] = useState<"admin" | "sales" | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkUserLevel() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const level = await getUserLevelAction(user.id);
        setUserLevel(level);
      }
    }
    checkUserLevel();
  }, []);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Determine active path on client
  const activePath = useMemo(() => {
    if (typeof window !== "undefined") return window.location.pathname;
    return "";
  }, []);
  const isActive = (path: string) => activePath === path;
  const activeAttrs = (path: string) =>
    isActive(path)
      ? { "aria-current": "page" as const, "aria-disabled": true as const }
      : {};

  // Minimal rail: compact, low-chrome styles
  const linkBase = "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition";
  const linkInactive = "text-gray-700 hover:bg-gray-100";
  const linkActive = "bg-blue-600 text-white";

  return (
    <div className="drawer md:drawer-open w-[48px] md:w-[48px]">
      {/* Mobile toggle button */}
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col w-screen md:w-64">
        {/* Top bar for mobile */}
        <div className="md:hidden sticky top-0 z-20 bg-white/80 border-b border-gray-200 backdrop-blur">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 grid place-items-center shadow-[0_0_25px_rgba(37,99,235,0.35)]">
                <FaCar className="text-white text-sm" />
              </div>
              <span className="text-sm font-semibold text-gray-900">
                DealerPro
              </span>
            </div>
            <label
              htmlFor="dashboard-drawer"
              className="btn btn-square btn-ghost text-gray-700"
              aria-label="Open menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </label>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="drawer-side">
        <label htmlFor="dashboard-drawer" className="drawer-overlay"></label>
        <aside
          className="group/sidebar w-[48px] min-h-full bg-white border-r border-gray-200 text-gray-800
                     hover:w-52 transition-all duration-200 ease-out overflow-hidden"
          aria-label="Main navigation"
        >
          {/* Brand (condensed) */}
          <div className="flex items-center gap-2 px-2 py-3">
            <div className="h-8 w-8 rounded-lg bg-blue-600 grid place-items-center">
              <FaCar className="text-white text-sm" />
            </div>
            <span className="ml-1 text-sm font-semibold text-gray-900 opacity-0 group-hover/sidebar:opacity-100 transition-opacity">
              DealerPro
            </span>
          </div>

          {/* Nav (single column, minimal) */}
          <nav className="mt-1 px-1">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/dashboard"
                  className={`${linkBase} ${activePath === "/dashboard" ? linkActive : linkInactive} ${activePath === "/dashboard" ? "pointer-events-none cursor-default" : ""}`}
                  prefetch={false}
                  {...activeAttrs("/dashboard")}
                >
                  <span className={`h-8 w-8 grid place-items-center rounded-md ${activePath === "/dashboard" ? "bg-white/15" : "bg-transparent"}`}>
                    <FaHome className={`${activePath === "/dashboard" ? "text-white" : "text-blue-700 group-hover:text-blue-700"}`} />
                  </span>
                  <span className="truncate opacity-0 group-hover/sidebar:opacity-100 transition-opacity">Dashboard</span>
                </Link>
              </li>

              <li>
                <Link
                  href="/Reports"
                  className={`${linkBase} ${activePath === "/Reports" ? linkActive : linkInactive} ${activePath === "/Reports" ? "pointer-events-none cursor-default" : ""}`}
                  prefetch={false}
                  {...activeAttrs("/Reports")}
                >
                  <span className={`h-8 w-8 grid place-items-center rounded-md ${activePath === "/Reports" ? "bg-white/15" : "bg-transparent"}`}>
                    <FaChartBar className={`${activePath === "/Reports" ? "text-white" : "text-blue-700 group-hover:text-blue-700"}`} />
                  </span>
                  <span className="truncate opacity-0 group-hover/sidebar:opacity-100 transition-opacity">Reports</span>
                </Link>
              </li>

              <li>
                <Link
                  href="/inventory"
                  className={`${linkBase} ${activePath === "/inventory" ? linkActive : linkInactive} ${activePath === "/inventory" ? "pointer-events-none cursor-default" : ""}`}
                  prefetch={false}
                  {...activeAttrs("/inventory")}
                >
                  <span className={`h-8 w-8 grid place-items-center rounded-md ${activePath === "/inventory" ? "bg-white/15" : "bg-transparent"}`}>
                    <FaCar className={`${activePath === "/inventory" ? "text-white" : "text-blue-700 group-hover:text-blue-700"}`} />
                  </span>
                  <span className="truncate opacity-0 group-hover/sidebar:opacity-100 transition-opacity">Inventory</span>
                </Link>
              </li>

              <li>
                <Link
                  href="/inventory/board"
                  className={`${linkBase} ${activePath === "/inventory/board" ? linkActive : linkInactive} ${activePath === "/inventory/board" ? "pointer-events-none cursor-default" : ""}`}
                  prefetch={false}
                  {...activeAttrs("/inventory/board")}
                >
                  <span className={`h-8 w-8 grid place-items-center rounded-md ${activePath === "/inventory/board" ? "bg-white/15" : "bg-transparent"}`}>
                    <span className={`${activePath === "/inventory/board" ? "text-white" : "text-blue-700"} text-[10px]`}>●</span>
                  </span>
                  <span className="truncate opacity-0 group-hover/sidebar:opacity-100 transition-opacity">Board</span>
                </Link>
              </li>

              <li>
                <Link
                  href="/customers"
                  className={`${linkBase} ${activePath === "/customers" ? linkActive : linkInactive} ${activePath === "/customers" ? "pointer-events-none cursor-default" : ""}`}
                  prefetch={false}
                  {...activeAttrs("/customers")}
                >
                  <span className={`h-8 w-8 grid place-items-center rounded-md ${activePath === "/customers" ? "bg-white/15" : "bg-transparent"}`}>
                    <FaUsers className={`${activePath === "/customers" ? "text-white" : "text-blue-700 group-hover:text-blue-700"}`} />
                  </span>
                  <span className="truncate opacity-0 group-hover/sidebar:opacity-100 transition-opacity">Customers</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Footer compact */}
          <div className="absolute bottom-3 left-0 right-0 px-1">
            <button
              onClick={handleSignOut}
              className="w-full inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition"
            >
              <span className="h-8 w-8 grid place-items-center rounded-md">
                <FaSignOutAlt />
              </span>
              <span className="truncate opacity-0 group-hover/sidebar:opacity-100 transition-opacity">Sign Out</span>
            </button>
            <div className="mt-1 px-2 text-[10px] text-gray-500 truncate opacity-0 group-hover/sidebar:opacity-100 transition-opacity">
              {userLevel ?? "loading..."}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

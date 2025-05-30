"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaHome, FaPlus, FaSignOutAlt, FaChartBar, FaUsers } from "react-icons/fa";
import { useEffect, useState } from "react";
import { createClient } from "@/app/utils/supabase/client";
import { getUserLevel } from "@/app/lib/dbFunction";

export default function DashboardSideMenu() {
    const [userLevel, setUserLevel] = useState<'admin' | 'sales' | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function checkUserLevel() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const level = await getUserLevel(user.id);
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
            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div className="drawer md:drawer-open w-64">
            {/* Mobile toggle button */}
            <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content flex flex-col w-screen md:w-64">
                {/* Mobile navbar */}
                <div className="navbar bg-base-200 md:hidden px-4">
                    <div className="flex-1 text-xl font-bold">Dashboard</div>
                    <div className="flex-none">
                        <label htmlFor="dashboard-drawer" className="btn btn-square btn-ghost">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </label>
                    </div>
                </div>

                {/* Main content goes here (optional) */}
                {/* Example: <div className="p-4">Welcome to Dashboard</div> */}
            </div>

            {/* Sidebar */}
            <div className="drawer-side">
                <label htmlFor="dashboard-drawer" className="drawer-overlay"></label>
                <aside className="menu p-4 w-64 min-h-full bg-base-200 text-base-content">
                    <h2 className="text-xl font-bold mb-4">Dashboard Menu</h2>
                    <ul className="space-y-2">
                        <li>
                            <Link href="/dashboard" className="flex items-center gap-2">
                                <FaHome />
                                Dashboard
                            </Link>
                        </li>
                        {userLevel === 'admin' && (
                            <>
                                <li>
                                    <Link href="/tambahMobil" className="flex items-center gap-2">
                                        <FaPlus />
                                        Tambah Mobil
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/analitik" className="flex items-center gap-2">
                                        <FaChartBar />
                                        Analitik
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/customers" className="flex items-center gap-2">
                                        <FaUsers />
                                        Customers Data
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/admin/pending-users" className="flex items-center gap-2">
                                        <FaUsers />
                                        Pending Users
                                    </Link>
                                </li>
                            </>
                        )}
                        <li>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 w-full text-left"
                            >
                                <FaSignOutAlt />
                                Sign Out
                            </button>
                        </li>
                    </ul>
                </aside>
            </div>
        </div>
    );
}

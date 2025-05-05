"use client"

import DashboardSideMenu from "@/app/components/ui/DashboardSideMenu"

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen flex-col md:flex-row">
            <DashboardSideMenu />
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div>
    )
} 
"use client"

import DashboardSideMenu from "@/app/components/ui/DashboardSideMenu"
import DashboardMenu from "../../components/ui/DashboardMenu"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen flex-col md:flex-row">
            <DashboardSideMenu />
            <div className="w-screen">
                <DashboardMenu />
                <div>{children}</div>
            </div>
        </div>
    )
}

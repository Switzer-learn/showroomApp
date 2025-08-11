import Link from "next/link";

export default function DashboardMenu(){
    return(
        <div className="flex justify-between">
            <h1>Dashboard Menu</h1>
            <div>
                <Link href="/inventory" className="btn btn-primary btn-sm">Tambah Mobil</Link>
                
            </div>
        </div>
    )
}
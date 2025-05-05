interface DashboardCarCard {
    merk: string;
    model: string;
    series: string;
    tahun: number;
    kilometer: number;
    status: string;
    image_url: string;
    transmisi: string;
    kondisi: string;
    plat_nomor: string;
    harga_jual: number;
    warna: string;
}

export default function DashboardCarCard(props: DashboardCarCard) {
    // Format currency to IDR
    const formatHargaJual = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(props.harga_jual);

    // Format kilometer with dots
    const formatKilometer = new Intl.NumberFormat('id-ID').format(props.kilometer);

    return (
        <div className="card bg-base-100 w-96 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <figure className="relative w-full h-48 overflow-hidden">
                <img
                    src={props.image_url}
                    alt={`${props.merk} ${props.model}`}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 m-2 rounded-md text-sm font-medium">
                    {props.status}
                </div>
            </figure>
            
            <div className="card-body p-5">
                <h2 className="card-title text-lg font-bold mb-2">
                    {props.merk} {props.model} {props.series} {props.tahun} {props.warna}
                </h2>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>{formatKilometer} km</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>{props.transmisi}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{props.kondisi}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <span>{props.plat_nomor}</span>
                    </div>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                    <p className="text-lg font-bold text-primary">{formatHargaJual}</p>
                    <button className="btn btn-primary btn-sm">Mark as Sold</button>
                </div>
            </div>
        </div>
    );
}
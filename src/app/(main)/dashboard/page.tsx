"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import { CarInterface } from "@/app/type/car/carInterface"
import DashboardCarCard from "@/app/components/ui/DashboardCarCard"


export default function Dashboard(){
    const [carData,setCarData] = useState<CarInterface[]>([])
    useEffect(() => {
        axios.get("/api/carDetail").then((res) => {
            console.log(res.data)
            setCarData(res.data)
        })
    }, [])
    return(
        <div className="grid grid-cols-3 gap-4">
            {carData.map((car) => {
                return(
                    <div>
                        <DashboardCarCard 
                            merk={car.merk}
                            model={car.model}
                            series={car.series}
                            tahun={car.tahun}
                            kilometer={car.kilometer}
                            status={car.status}
                            image_url={car.image_url || ""}
                            transmisi={car.transmisi}
                            kondisi={car.kondisi}
                            plat_nomor={car.plat_nomor}
                            harga_jual={car.harga_jual}
                            warna={car.warna}
                        />
                    </div>
                )
            })}
        </div>
    )
}
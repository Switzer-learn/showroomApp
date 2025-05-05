'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { FaChartBar, FaChartPie, FaChartLine, FaCarSide, FaMoneyBillWave, FaUserTie } from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

// Types for our data
interface SalesPerformance {
  sales_id: string;
  nama: string;
  total_sales: number;
  total_value: number;
}

interface BrandDistribution {
  merk: string;
  count: number;
}

interface SeriesDistribution {
  series: string;
  count: number;
}

interface TypeDistribution {
  tipe: string;
  count: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  cost: number;
  profit: number;
}

interface ProfitLoss {
  total_revenue: number;
  total_cost: number;
  gross_profit: number;
  profit_margin: number;
}

interface BodyTypeDistribution {
  body_type: string;
  count: number;
}

interface SalesData {
  sales_id: string;
  users: {
    nama: string;
  };
  mobil_id: string;
}

interface SalesValue {
  id: string;
  harga_jual: number;
}

interface MonthlyData {
  tanggal_jual: string;
  mobil: {
    harga_beli: number;
    harga_jual: number;
  };
}

export default function AnalitikPage() {
  const [loading, setLoading] = useState(true);
  const [salesPerformance, setSalesPerformance] = useState<SalesPerformance[]>([]);
  const [brandDistribution, setBrandDistribution] = useState<BrandDistribution[]>([]);
  const [seriesDistribution, setSeriesDistribution] = useState<SeriesDistribution[]>([]);
  const [typeDistribution, setTypeDistribution] = useState<TypeDistribution[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [profitLoss, setProfitLoss] = useState<ProfitLoss | null>(null);
  const [bodyTypeDistribution, setBodyTypeDistribution] = useState<BodyTypeDistribution[]>([]);
  const [timeFrame, setTimeFrame] = useState('year'); // 'year', 'month', 'week'

  // Fetch data from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const supabase = createClient();

        // Get date range based on timeFrame
        const now = new Date();
        let startDate = new Date();
        if (timeFrame === 'week') {
          startDate.setDate(now.getDate() - 7);
        } else if (timeFrame === 'month') {
          startDate.setMonth(now.getMonth() - 1);
        } else { // year
          startDate.setFullYear(now.getFullYear() - 1);
        }

        // 1. Sales Performance by Sales Person
        const { data: salesData, error: salesError } = await supabase
          .from('penjualan')
          .select(`
            sales_id,
            users (
              nama
            ),
            mobil_id
          `)
          .gte('tanggal_jual', startDate.toISOString()) as { data: SalesData[] | null, error: any };

        if (salesError) throw salesError;

        // Process sales data
        const salesMap = new Map();
        salesData?.forEach(sale => {
          if (!salesMap.has(sale.sales_id)) {
            salesMap.set(sale.sales_id, {
              sales_id: sale.sales_id,
              nama: sale.users?.nama || 'Unknown',
              total_sales: 0,
              total_value: 0
            });
          }
          salesMap.get(sale.sales_id).total_sales++;
        });

        // Get sales values
        const { data: salesValues, error: valuesError } = await supabase
          .from('mobil')
          .select('id, harga_jual')
          .in('id', salesData?.map(s => s.mobil_id) || []) as { data: SalesValue[] | null, error: any };

        if (valuesError) throw valuesError;

        // Calculate total values
        salesValues?.forEach(value => {
          const sale = salesData?.find(s => s.mobil_id === value.id);
          if (sale && value.harga_jual) {
            const salesInfo = salesMap.get(sale.sales_id);
            if (salesInfo) {
              salesInfo.total_value += value.harga_jual;
            }
          }
        });

        setSalesPerformance(Array.from(salesMap.values()));

        // 2. Brand Distribution
        const { data: brandData, error: brandError } = await supabase
          .from('mobil')
          .select('merk')
          .eq('status', 'Tersedia');

        if (brandError) throw brandError;

        const brandCount = brandData?.reduce((acc, curr) => {
          acc[curr.merk] = (acc[curr.merk] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setBrandDistribution(
          Object.entries(brandCount || {}).map(([merk, count]) => ({
            merk,
            count
          }))
        );

        // 3. Series Distribution
        const { data: seriesData, error: seriesError } = await supabase
          .from('mobil')
          .select('series')
          .eq('status', 'Tersedia');

        if (seriesError) throw seriesError;

        const seriesCount = seriesData?.reduce((acc, curr) => {
          acc[curr.series] = (acc[curr.series] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setSeriesDistribution(
          Object.entries(seriesCount || {}).map(([series, count]) => ({
            series,
            count
          }))
        );

        // 4. Body Type Distribution
        const { data: bodyTypeData, error: bodyTypeError } = await supabase
          .from('mobil')
          .select('body_type')
          .eq('status', 'Tersedia');

        if (bodyTypeError) throw bodyTypeError;

        const bodyTypeCount = bodyTypeData?.reduce((acc, curr) => {
          acc[curr.body_type] = (acc[curr.body_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setBodyTypeDistribution(
          Object.entries(bodyTypeCount || {}).map(([body_type, count]) => ({
            body_type,
            count
          }))
        );

        // 5. Monthly Revenue and Profit
        const { data: monthlyData, error: monthlyError } = await supabase
          .from('penjualan')
          .select(`
            tanggal_jual,
            mobil (
              harga_beli,
              harga_jual
            )
          `)
          .gte('tanggal_jual', startDate.toISOString()) as { data: MonthlyData[] | null, error: any };

        if (monthlyError) throw monthlyError;

        // Process monthly data
        const monthlyMap = new Map();
        monthlyData?.forEach(sale => {
          const date = new Date(sale.tanggal_jual);
          const monthKey = date.toLocaleString('default', { month: 'short' });
          
          if (!monthlyMap.has(monthKey)) {
            monthlyMap.set(monthKey, {
              month: monthKey,
              revenue: 0,
              cost: 0,
              profit: 0
            });
          }

          const monthData = monthlyMap.get(monthKey);
          if (sale.mobil?.harga_jual) {
            monthData.revenue += sale.mobil.harga_jual;
            monthData.cost += sale.mobil.harga_beli;
            monthData.profit += sale.mobil.harga_jual - sale.mobil.harga_beli;
          }
        });

        setMonthlyRevenue(Array.from(monthlyMap.values()));

        // 6. Calculate Profit & Loss
        const totalRevenue = monthlyData?.reduce((sum, sale) => 
          sum + (sale.mobil?.harga_jual || 0), 0) || 0;
        const totalCost = monthlyData?.reduce((sum, sale) => 
          sum + (sale.mobil?.harga_beli || 0), 0) || 0;
        const grossProfit = totalRevenue - totalCost;
        const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

        setProfitLoss({
          total_revenue: totalRevenue,
          total_cost: totalCost,
          gross_profit: grossProfit,
          profit_margin: profitMargin
        });

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [timeFrame]);

  // Prepare chart data
  const brandData = {
    labels: brandDistribution.map(item => item.merk),
    datasets: [
      {
        label: 'Jumlah Kendaraan',
        data: brandDistribution.map(item => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const seriesData = {
    labels: seriesDistribution.map(item => item.series),
    datasets: [
      {
        label: 'Jumlah Kendaraan',
        data: seriesDistribution.map(item => item.count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const salesPerformanceData = {
    labels: salesPerformance.map(item => item.nama),
    datasets: [
      {
        label: 'Jumlah Penjualan',
        data: salesPerformance.map(item => item.total_sales),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        label: 'Nilai Penjualan (dalam jutaan Rp)',
        data: salesPerformance.map(item => item.total_value / 1000000),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
      },
    ],
  };

  const bodyTypeData = {
    labels: bodyTypeDistribution.map(item => item.body_type),
    datasets: [
      {
        label: 'Jumlah Kendaraan',
        data: bodyTypeDistribution.map(item => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
        hoverOffset: 4,
      },
    ],
  };

  const revenueData = {
    labels: monthlyRevenue.map(item => item.month),
    datasets: [
      {
        label: 'Pendapatan',
        data: monthlyRevenue.map(item => item.revenue / 1000000),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Biaya',
        data: monthlyRevenue.map(item => item.cost / 1000000),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Profit',
        data: monthlyRevenue.map(item => item.profit / 1000000),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Define chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Distribusi Series Mobil',
        color: '#e2e8f0',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#cbd5e1',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#cbd5e1',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#cbd5e1',
        },
      },
      title: {
        display: true,
        text: 'Distribusi Merk Mobil',
        color: '#e2e8f0',
        font: {
          size: 16,
        },
      },
    },
  };

  const salesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#cbd5e1',
        },
      },
      title: {
        display: true,
        text: 'Performa Penjualan per Sales',
        color: '#e2e8f0',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Jumlah Penjualan',
          color: '#cbd5e1',
        },
        ticks: {
          color: '#cbd5e1',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Nilai (juta Rp)',
          color: '#cbd5e1',
        },
        ticks: {
          color: '#cbd5e1',
        },
        grid: {
          display: false,
        },
      },
      x: {
        ticks: {
          color: '#cbd5e1',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
    },
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#cbd5e1',
        },
      },
      title: {
        display: true,
        text: 'Pendapatan, Biaya, dan Profit Bulanan (dalam juta Rp)',
        color: '#e2e8f0',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function(value: any) {
            return value.toLocaleString('id-ID');
          },
          color: '#cbd5e1',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#cbd5e1',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
    },
  };

  const bodyTypeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#cbd5e1',
        },
      },
      title: {
        display: true,
        text: 'Distribusi Tipe Body Mobil',
        color: '#e2e8f0',
        font: {
          size: 16,
        },
      },
    },
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-900 text-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <FaChartBar className="mr-3 text-primary" /> 
          Dashboard Analitik
        </h1>
        <p className="text-gray-400 mt-2">
          Visualisasi data penjualan dan inventaris kendaraan dari showroom mobil bekas
        </p>
      </div>

      {/* Time period selector */}
      <div className="flex justify-end mb-6">
        <div className="join">
          <button 
            className={`join-item btn ${timeFrame === 'week' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTimeFrame('week')}
          >
            Minggu Ini
          </button>
          <button 
            className={`join-item btn ${timeFrame === 'month' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTimeFrame('month')}
          >
            Bulan Ini
          </button>
          <button 
            className={`join-item btn ${timeFrame === 'year' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTimeFrame('year')}
          >
            Tahun Ini
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gray-800 shadow-xl border border-gray-700">
          <div className="card-body">
            <h2 className="card-title text-gray-300 flex items-center">
              <FaCarSide className="mr-2 text-blue-400" /> Total Kendaraan
            </h2>
            <p className="text-3xl font-bold">{brandDistribution.reduce((acc, item) => acc + item.count, 0)}</p>
            <p className="text-gray-400 text-sm">Jumlah kendaraan yang tersedia di inventaris</p>
          </div>
        </div>
        
        <div className="card bg-gray-800 shadow-xl border border-gray-700">
          <div className="card-body">
            <h2 className="card-title text-gray-300 flex items-center">
              <FaMoneyBillWave className="mr-2 text-green-400" /> Total Penjualan
            </h2>
            <p className="text-3xl font-bold">{salesPerformance.reduce((acc, item) => acc + item.total_sales, 0)}</p>
            <p className="text-gray-400 text-sm">Jumlah kendaraan yang terjual</p>
          </div>
        </div>
        
        <div className="card bg-gray-800 shadow-xl border border-gray-700">
          <div className="card-body">
            <h2 className="card-title text-gray-300 flex items-center">
              <FaChartLine className="mr-2 text-purple-400" /> Profit
            </h2>
            <p className="text-3xl font-bold text-green-400">{profitLoss ? formatCurrency(profitLoss.gross_profit) : 'Rp0'}</p>
            <p className="text-gray-400 text-sm">Total keuntungan dari seluruh penjualan</p>
          </div>
        </div>
        
        <div className="card bg-gray-800 shadow-xl border border-gray-700">
          <div className="card-body">
            <h2 className="card-title text-gray-300 flex items-center">
              <FaUserTie className="mr-2 text-yellow-400" /> Margin Profit
            </h2>
            <p className="text-3xl font-bold">{profitLoss ? `${profitLoss.profit_margin.toFixed(1)}%` : '0%'}</p>
            <p className="text-gray-400 text-sm">Persentase profit dari total pendapatan</p>
          </div>
        </div>
      </div>

      {/* Charts Section - First Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Brand Distribution (Pie Chart) */}
        <div className="card bg-gray-800 shadow-xl border border-gray-700">
          <div className="card-body">
            <div className="h-80">
              <Pie data={brandData} options={pieChartOptions} />
            </div>
          </div>
        </div>

        {/* Series Distribution (Bar Chart) */}
        <div className="card bg-gray-800 shadow-xl border border-gray-700">
          <div className="card-body">
            <div className="h-80">
              <Bar data={seriesData} options={barChartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section - Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Performance (Bar Chart) */}
        <div className="card bg-gray-800 shadow-xl border border-gray-700">
          <div className="card-body">
            <div className="h-80">
              <Bar data={salesPerformanceData} options={salesChartOptions} />
            </div>
          </div>
        </div>

        {/* Body Type Distribution (Doughnut Chart) */}
        <div className="card bg-gray-800 shadow-xl border border-gray-700">
          <div className="card-body">
            <div className="h-80">
              <Doughnut data={bodyTypeData} options={bodyTypeChartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart (Line Chart) - Full Width */}
      <div className="card bg-gray-800 shadow-xl border border-gray-700 mb-8">
        <div className="card-body">
          <div className="h-80">
            <Line data={revenueData} options={revenueChartOptions} />
          </div>
        </div>
      </div>

      {/* Profit & Loss Table */}
      <div className="card bg-gray-800 shadow-xl border border-gray-700">
        <div className="card-body">
          <h2 className="card-title text-xl mb-4 flex items-center">
            <FaMoneyBillWave className="mr-2 text-green-400" /> Laporan Laba Rugi
          </h2>
          
          <div className="overflow-x-auto">
            <table className="table table-zebra bg-gray-800 text-gray-100">
              <thead className="bg-gray-700 text-gray-200">
                <tr>
                  <th>Keterangan</th>
                  <th className="text-right">Nilai</th>
                  <th className="text-right">Persentase</th>
                </tr>
              </thead>
              <tbody>
                {profitLoss && (
                  <>
                    <tr>
                      <td className="font-medium">Total Pendapatan</td>
                      <td className="text-right">{formatCurrency(profitLoss.total_revenue)}</td>
                      <td className="text-right">100%</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Total Biaya</td>
                      <td className="text-right text-red-400">{formatCurrency(profitLoss.total_cost)}</td>
                      <td className="text-right">{((profitLoss.total_cost / profitLoss.total_revenue) * 100).toFixed(1)}%</td>
                    </tr>
                    <tr className="font-bold">
                      <td>Laba Kotor</td>
                      <td className="text-right text-green-400">{formatCurrency(profitLoss.gross_profit)}</td>
                      <td className="text-right text-green-400">{profitLoss.profit_margin.toFixed(1)}%</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

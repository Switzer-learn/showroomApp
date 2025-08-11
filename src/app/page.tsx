"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaWhatsapp, FaBolt, FaChartLine, FaFilePdf, FaShieldAlt, FaUsers, FaCar, FaMoneyBillWave, FaBalanceScale } from "react-icons/fa";

export default function Home() {
  const router = useRouter();

  const handleTryDemo = () => {
    // Route to a demo route or login with a demo notice
    router.push("/login?demo=true");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0B1020] via-[#0C1226] to-[#0E1530] text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/5 bg-white/0 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#3B82F6] grid place-items-center shadow-[0_0_30px_rgba(59,130,246,0.35)]">
              <FaCar className="text-white" />
            </div>
            <span className="font-semibold tracking-wide text-white/90">
              DealerPro
            </span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm text-white/70">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#how" className="hover:text-white">How it helps</a>
            <a href="#reports" className="hover:text-white">Reports</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 rounded-lg border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition">
              Login
            </Link>
            <button
              onClick={handleTryDemo}
              className="px-4 py-2 rounded-lg bg-[#22C55E] text-[#0A0F1F] font-semibold hover:scale-[1.02] active:scale-[0.99] transition shadow-[0_10px_30px_-10px_rgba(34,197,94,0.6)]"
            >
              Try Demo
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-[300px] -left-[200px] h-[600px] w-[600px] rounded-full bg-[#3B82F6]/10 blur-3xl" />
        <div className="absolute -bottom-[300px] -right-[200px] h-[600px] w-[600px] rounded-full bg-[#22C55E]/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              All-in-One App for Used Car Dealers
            </h1>
            <p className="mt-5 text-white/70 text-lg">
              Manage stock, post sales with auto-journaling, and get real-time P&L and Balance Sheet. No more Excel chaos—just clear margins and print-ready reports.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={handleTryDemo}
                className="px-6 py-3 rounded-xl bg-[#3B82F6] font-semibold hover:brightness-110 transition shadow-[0_20px_45px_-15px_rgba(59,130,246,0.6)]"
              >
                Explore Interactive Demo
              </button>
              <a
                href="#features"
                className="px-6 py-3 rounded-xl border border-white/20 text-white/90 hover:border-white/40 transition"
              >
                See Features
              </a>
            </div>
            <div className="mt-6 flex items-center gap-3 text-white/60 text-sm">
              <FaShieldAlt /> Multi-tenant & secure. RLS enforced.
              <span className="mx-2">•</span>
              <FaBolt /> Fast setup. Start in minutes.
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="grid sm:grid-cols-2 gap-4">
                <FeatureCard
                  icon={<FaCar />}
                  title="Inventory"
                  desc="Add/edit cars with photos. Filter by status and age."
                  accent="blue"
                />
                <FeatureCard
                  icon={<FaMoneyBillWave />}
                  title="Sales"
                  desc="Record sale in 30s. Auto journal posts instantly."
                  accent="green"
                />
                <FeatureCard
                  icon={<FaChartLine />}
                  title="P&L & Ledger"
                  desc="Real-time financials with drill-down."
                  accent="purple"
                />
                <FeatureCard
                  icon={<FaFilePdf />}
                  title="PDF Exports"
                  desc="One-click, clean PDF reports for owners."
                  accent="rose"
                />
              </div>
            </div>
            <div className="mt-4 text-xs text-white/50">
              Powered by Next.js + Supabase. Your data stays isolated per company.
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Outcomes */}
      <section id="how" className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold">How it helps owners</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <OutcomeCard
            title="Know your profit, today"
            desc="See monthly profit and stock value without calling accounting."
          />
          <OutcomeCard
            title="Faster turn-around"
            desc="Track days-in-stock and focus on cars that must move."
          />
          <OutcomeCard
            title="Ready-to-print reports"
            desc="Ledger, P&L, and Balance Sheet ready for tax or partners."
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold">Features that close the loop</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <BulletCard title="Car Inventory Management" desc="Full details, photos, stock reports" />
          <BulletCard title="Sales with Auto-Journaling" desc="Margin tracking without manual accounting" />
          <BulletCard title="Car Purchase Tracking" desc="Vendor, buy price, and payment method" />
          <BulletCard title="Dashboard Overview" desc="Realtime KPIs across stock and profit" />
          <BulletCard title="Journal & Ledger" desc="Double-entry, unified transactions model" />
          <BulletCard title="P&L / Balance Sheet" desc="Date range and as-of snapshots" />
          <BulletCard title="PDF Export" desc="Clean, branded documents" />
          <BulletCard title="COA Management" desc="COA groups, per-company mapping" />
          <BulletCard title="User Roles" desc="Owner / Admin / Staff" />
        </div>
      </section>

      {/* Reports Preview */}
      <section id="reports" className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <h3 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
            <FaBalanceScale /> Financials you can trust
          </h3>
          <p className="mt-2 text-white/70">
            Sales and purchases auto-post to the journal. Ledger, P&L and Balance Sheet update instantly.
          </p>
          <div className="mt-6 grid sm:grid-cols-2 gap-5">
            <GlassPanel title="Journal Feed" subtitle="Traceable. Drill-down. Linked to source." />
            <GlassPanel title="P&L / Balance Sheet" subtitle="Clear sections and subtotals." />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold">Simple one-time pricing</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <PriceCard
            name="Starter"
            price="Rp5.000.000 – 7.000.000"
            points={[
              "Inventory + Sales",
              "PDF exports",
              "1 company, 3 users",
            ]}
          />
          <PriceCard
            name="Pro"
            price="Rp8.900.000 – 10.000.000"
            highlighted
            points={[
              "Add full accounting",
              "Ledger, P&L, Balance Sheet",
              "COA management",
            ]}
          />
          <PriceCard
            name="Enterprise"
            price="Rp12.000.000 – 15.000.000+"
            points={[
              "Multi-branch, multi-user",
              "Custom reporting & branding",
              "Optional public catalog",
            ]}
          />
        </div>
        <div className="mt-8 flex gap-4">
          <button
            onClick={handleTryDemo}
            className="px-6 py-3 rounded-xl bg-[#22C55E] text-[#0A0F1F] font-semibold hover:scale-[1.02] active:scale-[0.99] transition shadow-[0_20px_45px_-15px_rgba(34,197,94,0.6)]"
          >
            Try Demo
          </button>
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl border border-white/20 text-white/90 hover:border-white/40 transition"
          >
            Login
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-white/60 text-sm">© {new Date().getFullYear()} DealerPro. All rights reserved.</p>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            className="inline-flex items-center gap-2 text-[#25D366] hover:brightness-110"
          >
            <FaWhatsapp /> Chat sales
          </a>
        </div>
      </footer>
    </main>
  );
}

/* Components */

function FeatureCard({
  icon,
  title,
  desc,
  accent = "blue",
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  accent?: "blue" | "green" | "purple" | "rose";
}) {
  const accentMap = {
    blue: "from-[#1E3A8A]/50 to-transparent shadow-[0_20px_45px_-15px_rgba(59,130,246,0.35)]",
    green: "from-[#064E3B]/50 to-transparent shadow-[0_20px_45px_-15px_rgba(34,197,94,0.35)]",
    purple: "from-[#3B0764]/50 to-transparent shadow-[0_20px_45px_-15px_rgba(168,85,247,0.35)]",
    rose: "from-[#4C0519]/50 to-transparent shadow-[0_20px_45px_-15px_rgba(244,63,94,0.35)]",
  } as const;

  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur relative overflow-hidden`}>
      <div className={`absolute -top-10 -right-14 h-36 w-36 rotate-12 bg-gradient-to-br ${accentMap[accent]} blur-2xl`} />
      <div className="relative flex items-start gap-3">
        <div className="h-10 w-10 grid place-items-center rounded-lg bg-white/10">{icon}</div>
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-white/70 mt-1">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function OutcomeCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <h4 className="font-semibold">{title}</h4>
      <p className="text-white/70 mt-2 text-sm">{desc}</p>
    </div>
  );
}

function GlassPanel({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
      <h5 className="font-semibold">{title}</h5>
      <p className="text-white/70 text-sm mt-2">{subtitle}</p>
    </div>
  );
}

function PriceCard({
  name,
  price,
  points,
  highlighted = false,
}: {
  name: string;
  price: string;
  points: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 backdrop-blur ${
        highlighted
          ? "border-[#3B82F6]/40 bg-[#3B82F6]/10 shadow-[0_30px_60px_-20px_rgba(59,130,246,0.35)]"
          : "border-white/10 bg-white/5"
      }`}
    >
      <h4 className="text-lg font-semibold">{name}</h4>
      <p className="mt-1 text-sm text-white/70">One-time</p>
      <div className="mt-3 text-xl">{price}</div>
      <ul className="mt-4 space-y-2 text-sm text-white/80">
        {points.map((p) => (
          <li key={p} className="flex gap-2">
            <span>•</span> {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

function BulletCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur hover:bg-white/10 transition">
      <h4 className="font-semibold">{title}</h4>
      <p className="text-white/70 mt-2 text-sm">{desc}</p>
    </div>
  );
}

"use client"

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { useEffect, useRef, useState } from "react"

const api =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000"


export default function SalesChart() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [ready, setReady] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [range, setRange] = useState<7 | 30>(7)
  const [loading, setLoading] = useState(false)

  // برای مشکل اندازه
  useEffect(() => {
    if (!containerRef.current) return
    const r = new ResizeObserver(() => setReady(true))
    r.observe(containerRef.current)
    return () => r.disconnect()
  }, [])

  const fetchChart = async (selectedRange: number) => {
    try {
      setLoading(true)

  const token = localStorage.getItem("accessToken")


     const res = await fetch(
  `${api}/api/dashboard/sales/chart?range=${selectedRange}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
)


      const json = await res.json()

      if (json.success) {
        const formatted = json.chart.map((item: any) => ({
          name: item.label, // مثل عکس: فقط برچسب
          sales: item.sales,
        }))
        setData(formatted)
      }
    } catch (err) {
      console.error("chart error", err)
    } finally {
      setLoading(false)
    }
  }

  // وقتی range عوض شد → دوباره fetch کن
  useEffect(() => {
    fetchChart(range)
  }, [range])

  return (
    <div
      ref={containerRef}
      className="rounded-xl border border-white/10 bg-[#0f172a] p-6 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-semibold">نمودار فروش</h2>

        {/* دکمه‌های سوییچ */}
        <div className="flex gap-2">
          <button
            onClick={() => setRange(7)}
            className={`text-xs px-3 py-1 rounded ${
              range === 7
                ? "bg-blue-500 text-white"
                : "bg-white/5 text-gray-400"
            }`}
          >
            ۷ روز
          </button>

          <button
            onClick={() => setRange(30)}
            className={`text-xs px-3 py-1 rounded ${
              range === 30
                ? "bg-blue-500 text-white"
                : "bg-white/5 text-gray-400"
            }`}
          >
            ۳۰ روز
          </button>
        </div>
      </div>

      <div className="h-[300px] w-full relative">

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            در حال بارگذاری...
          </div>
        )}

        {ready && !loading && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              {/* گرادیان مثل UI قبل */}
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="4 4"
                stroke="#1e293b"
                opacity={0.5}
              />

              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={12}
              />

              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickFormatter={(v) =>
                  v.toLocaleString("fa-IR")
                }
              />

              <Tooltip
                formatter={(v: number) =>
                  `${v.toLocaleString("fa-IR")} تومان`
                }
                labelStyle={{ color: "#fff" }}
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: "8px",
                }}
              />

              <Area
                type="monotone"
                dataKey="sales"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorSales)"
                animationDuration={900}
                animationBegin={200}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

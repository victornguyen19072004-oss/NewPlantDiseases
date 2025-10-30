"use client"
import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export default function F1PerClass() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    fetch("/data/model_data.json")
      .then(r => r.json())
      .then(d => setData(d.f1_per_class))
  }, [])

  if (!data.length) return <div>Đang tải F1...</div>

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-bold mb-4">Top 10 Lớp - F1 Score</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="class" angle={-45} textAnchor="end" height={80} />
          <YAxis domain={[98, 100]} />
          <Tooltip formatter={(v: any) => `${v}%`} />
          <Bar dataKey="f1" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
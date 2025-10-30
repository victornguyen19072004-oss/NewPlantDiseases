"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"

interface EDAData {
  eda: {
    total_samples: number
    num_classes: number
    train_samples: number
    valid_samples: number
    imbalance_ratio: number
    max_class: string
    max_count: number
    min_class: string
    min_count: number
  }
  plant_table: Array<{
    "Loại cây": string
    "Lớp": string
    "Train": string
    "Valid": string
    "Tổng": string
  }>
}

export function EDASection() {
  const [data, setData] = useState<EDAData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null)

  useEffect(() => {
    fetch("/data/model_data.json")
      .then(r => r.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading || !data?.eda || !data?.plant_table) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-muted-foreground">
          {loading ? "Đang tải..." : "Lỗi: Thiếu plant_table. Chạy update_web_data.py"}
        </div>
      </div>
    )
  }

  const { eda, plant_table } = data
  const safeTable = Array.isArray(plant_table) ? plant_table : []

  // === THỐNG KÊ ===
  const stats = [
    { label: "Tổng ảnh", value: eda.total_samples.toLocaleString() },
    { label: "Số lớp", value: eda.num_classes },
    { label: "Train / Valid", value: `${eda.train_samples.toLocaleString()} / ${eda.valid_samples.toLocaleString()}` },
    { label: "Tỷ lệ mất cân bằng", value: `${eda.imbalance_ratio}:1` },
  ]

  // === TOP 5 + OTHERS ===
  const top5 = safeTable.slice(0, 5).map(r => ({
    name: r["Lớp"].split("___")[1] || r["Lớp"],
    value: parseInt(r["Tổng"] || "0")
  }))
  const others = eda.total_samples - top5.reduce((s, c) => s + c.value, 0)
  const classDistributionData = others > 0 ? [...top5, { name: "Others", value: others }] : top5

  // === TRAIN VS VALID ===
  const trainValidData = [
    { name: "Train", value: eda.train_samples, fill: "hsl(142, 71%, 45%)" },
    { name: "Valid", value: eda.valid_samples, fill: "hsl(160, 84%, 39%)" },
  ]

  // === TOP 10 / BOTTOM 10 ===
  const top10 = safeTable.slice(0, 10).map(r => ({
    class: r["Lớp"].split("___")[1] || r["Lớp"],
    count: parseInt(r["Tổng"] || "0")
  }))
  const bottom10 = safeTable.slice(-10).map(r => ({
    class: r["Lớp"].split("___")[1] || r["Lớp"],
    count: parseInt(r["Tổng"] || "0")
  }))

  // === SỐ BỆNH MỖI CÂY + CHI TIẾT ===
  const plantGroups = safeTable.reduce((acc, r) => {
    const plant = r["Loại cây"]
    if (!acc[plant]) acc[plant] = []
    acc[plant].push({
      disease: r["Lớp"].split("___")[1] || r["Lớp"],
      train: parseInt(r["Train"] || "0"),
      valid: parseInt(r["Valid"] || "0"),
      total: parseInt(r["Tổng"] || "0")
    })
    return acc
  }, {} as Record<string, Array<{ disease: string; train: number; valid: number; total: number }>>)

  const diseasesPerPlant = Object.entries(plantGroups)
    .map(([plant, diseases]) => ({ plant, diseases, count: diseases.length }))
    .sort((a, b) => b.count - a.count)

  const colors = { green: "hsl(142, 71%, 45%)", emerald: "hsl(160, 84%, 39%)", red: "hsl(0, 84%, 60%)", gray: "#6b7280" }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-green-700">Phân Tích Dữ Liệu (EDA)</h2>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">{s.label}</div>
              <div className="text-2xl font-bold text-green-600">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Max / Min */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Lớp nhiều nhất</CardTitle></CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <Badge variant="secondary" className="text-xs">{eda.max_class.split("___")[1]}</Badge>
              <span className="font-bold text-green-600">{eda.max_count}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Lớp ít nhất</CardTitle></CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <Badge variant="secondary" className="text-xs">{eda.min_class.split("___")[1]}</Badge>
              <span className="font-bold text-red-600">{eda.min_count}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Phân bố lớp (Top 5)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={classDistributionData} dataKey="value" label={({ name, percent }) => `${name}: ${(percent*100).toFixed(1)}%`} outerRadius={80}>
                  {classDistributionData.map((_, i) => <Cell key={i} fill={[colors.green, colors.emerald, "#10b981", "#059669", colors.gray][i % 5]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Train / Valid</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={trainValidData} dataKey="value" label={({ name, value }) => `${name}: ${value}`} outerRadius={80}>
                  {trainValidData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Top 10 lớp</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={top10}>
                <XAxis dataKey="class" angle={-45} height={90} tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={colors.green} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Bottom 10 lớp</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bottom10}>
                <XAxis dataKey="class" angle={-45} height={90} tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={colors.red} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* SỐ BỆNH MỖI CÂY + CHI TIẾT */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Số bệnh mỗi cây
              <Info className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={diseasesPerPlant} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="plant" />
                <YAxis />
                <Tooltip content={({ active, payload }) => {
                  if (active && payload?.[0]) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white p-2 border rounded shadow-sm text-sm">
                        <p className="font-semibold">{data.plant}</p>
                        <p>Số bệnh: <strong>{data.count}</strong></p>
                      </div>
                    )
                  }
                  return null
                }} />
                <Bar 
                  dataKey="count" 
                  fill={colors.emerald}
                  className="cursor-pointer"
                  onClick={(data: any) => setSelectedPlant(data.plant)}
                />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Nhấn vào cột để xem chi tiết các lớp bệnh
            </p>
          </CardContent>
        </Card>
      </div>

      {/* DIALOG CHI TIẾT LỚP BỆNH */}
      <Dialog open={!!selectedPlant} onOpenChange={() => setSelectedPlant(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedPlant} – Danh sách bệnh ({plantGroups[selectedPlant!]?.length || 0} lớp)
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Tên bệnh</TableHead>
                  <TableHead className="text-center">Train</TableHead>
                  <TableHead className="text-center">Valid</TableHead>
                  <TableHead className="text-center">Tổng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plantGroups[selectedPlant!]?.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{i + 1}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {item.disease}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{item.train}</TableCell>
                    <TableCell className="text-center">{item.valid}</TableCell>
                    <TableCell className="text-center font-semibold">{item.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
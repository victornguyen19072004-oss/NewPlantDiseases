// components/comparison-table.tsx
"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Model {
  name: string
  accuracy: number
  f1: number
  time: number
  size: number
}

export function ComparisonTable() {
  const [models, setModels] = useState<Model[]>([])
  const [bestModel, setBestModel] = useState<string>("")

  useEffect(() => {
    fetch("/data/model_data.json")
      .then(r => r.json())
      .then(data => {
        setModels(data.models)
        setBestModel(data.best_model)
      })
  }, [])

  if (models.length === 0) return <div className="text-center">Đang tải dữ liệu...</div>

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">So Sánh Hiệu Suất Mô Hình</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mô hình</TableHead>
            <TableHead className="text-center">Độ chính xác</TableHead>
            <TableHead className="text-center">F1-Score</TableHead>
            <TableHead className="text-center">Thời gian</TableHead>
            <TableHead className="text-center">Kích thước</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models.map(m => (
            <TableRow key={m.name} className={m.name === bestModel ? "bg-green-50 dark:bg-green-900/20" : ""}>
              <TableCell className="font-medium">{m.name}</TableCell>
              <TableCell className="text-center">{m.accuracy}%</TableCell>
              <TableCell className="text-center">{m.f1}%</TableCell>
              <TableCell className="text-center">{m.time}ms</TableCell>
              <TableCell className="text-center">{m.size}MB</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
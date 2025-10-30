"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TopClassesTableProps {
  data: {
    top_classes: Array<{
      class_name: string
      total_count: number
      percentage: number
    }>
  }
}

export default function TopClassesTable({ data }: TopClassesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Lớp Phổ Biến Nhất</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">STT</TableHead>
                <TableHead>Tên Lớp</TableHead>
                <TableHead className="text-right">Số Lượng Ảnh</TableHead>
                <TableHead className="text-right">Tỷ Lệ (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.top_classes.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{item.class_name}</TableCell>
                  <TableCell className="text-right">{item.total_count.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{item.percentage.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

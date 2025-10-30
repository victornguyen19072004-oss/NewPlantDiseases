"use client"
import { useEffect, useState } from "react"

export default function ConfusionMatrix() {
  const [matrix, setMatrix] = useState<number[][]>([])

  useEffect(() => {
    fetch("/data/model_data.json")
      .then(r => r.json())
      .then(d => setMatrix(d.confusion_matrix))
  }, [])

  if (!matrix.length) return <div>Đang tải ma trận...</div>

  const size = 10
  return (
    <div className="bg-white p-6 rounded-lg shadow overflow-auto">
      <h3 className="text-lg font-bold mb-4">Ma trận nhầm lẫn (Chuẩn hóa)</h3>
      <div style={{ width: `${matrix.length * size}px` }}>
        {matrix.map((row, i) => (
          <div key={i} style={{ display: "flex" }}>
            {row.map((val, j) => (
              <div
                key={j}
                title={`${(val * 100).toFixed(1)}%`}
                style={{
                  width: size, height: size,
                  backgroundColor: `hsl(${120 * (1 - val)}, 70%, 50%)`,
                  border: "1px solid #eee"
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
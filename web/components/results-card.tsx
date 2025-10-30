import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"

interface ResultsCardProps {
  imageData: string
  selectedModel: string
}

export function ResultsCard({ imageData, selectedModel }: ResultsCardProps) {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const predict = async () => {
      const blob = await fetch(imageData).then(r => r.blob())
      const formData = new FormData()
      formData.append("image", blob, "leaf.jpg")
      formData.append("model", selectedModel)

      try {
        const res = await fetch("http://localhost:5000/predict", {
          method: "POST",
          body: formData,
        })
        const data = await res.json()
        setResult(data)
      } catch (err) {
        setResult({ error: "Không kết nối được API" })
      } finally {
        setLoading(false)
      }
    }
    predict()
  }, [imageData, selectedModel])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Đang phân tích...</span>
        </CardContent>
      </Card>
    )
  }

  if (result?.error) {
    return <Card><CardContent className="py-8 text-red-600 text-center">{result.error}</CardContent></Card>
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Ảnh gốc</CardTitle>
        </CardHeader>
        <CardContent>
          <img src={imageData} alt="Original" className="w-full rounded-lg" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bản đồ nhiệt GradCAM</CardTitle>
        </CardHeader>
        <CardContent>
          <img src={result?.gradcam} alt="GradCAM" className="w-full rounded-lg" />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-2xl text-green-700">Kết quả dự đoán</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-lg font-medium">{result?.disease}</p>
            <p className="text-sm text-muted-foreground">Mô hình: {result?.model}</p>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Độ tin cậy</span>
              <span>{result?.confidence}%</span>
            </div>
            <Progress value={result?.confidence} className="h-3" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
import { useState } from "react"
import { Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ImageUploadProps {
  onImageUpload: (imageData: string) => void
}

export function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return
    setLoading(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      onImageUpload(reader.result as string)
      setLoading(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <Card className="p-8">
      <div
        className={`border-4 border-dashed rounded-xl p-12 text-center transition-colors ${
          dragActive ? "border-green-500 bg-green-50" : "border-gray-300"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false) }}
        onDrop={(e) => {
          e.preventDefault()
          setDragActive(false)
          if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
        }}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-green-600" />
        <p className="text-lg font-medium mb-2">Kéo thả ảnh lá cây vào đây</p>
        <p className="text-sm text-muted-foreground mb-4">hoặc click để chọn file</p>
        <Button asChild>
          <label>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            Chọn ảnh
          </label>
        </Button>
        {loading && <Loader2 className="w-6 h-6 animate-spin mx-auto mt-4" />}
      </div>
    </Card>
  )
}
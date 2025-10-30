import { Leaf } from "lucide-react"

export function Hero() {
  return (
    <section className="text-center py-12">
      <div className="flex justify-center mb-4">
        <Leaf className="w-16 h-16 text-green-600" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-green-700 mb-3">
        AI Phát Hiện Bệnh Cây Trồng
      </h1>
      <p className="text-lg text-muted-foreground">
        38 lớp bệnh • 70.295 ảnh • 4 mô hình 
      </p>
    </section>
  )
}
"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SampleImagesGridProps {
  data: {
    sample_images: Array<{
      class_name: string
      image_url: string
    }>
  }
}

export default function SampleImagesGrid({ data }: SampleImagesGridProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mẫu ảnh từ các lớp khác nhau</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.sample_images.map((sample, index) => (
            <div key={index} className="space-y-2">
              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted">
                <Image
                  src={sample.image_url || "/placeholder.svg"}
                  alt={sample.class_name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <p className="text-sm font-medium text-center text-muted-foreground truncate">{sample.class_name}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

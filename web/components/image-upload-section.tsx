"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ImageUploadSection() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
    }, 2000)
  }

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle>Upload Plant Image</CardTitle>
        <CardDescription>Drag and drop or click to upload an image for analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileSelect(e.target.files[0])
              }
            }}
          />

          {uploadedImage ? (
            <div className="space-y-4">
              <img
                src={uploadedImage || "/placeholder.svg"}
                alt="Uploaded plant"
                className="max-h-64 mx-auto rounded-lg object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setUploadedImage(null)
                }}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
                Remove image
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="mx-auto text-muted-foreground" size={32} />
              <div>
                <p className="font-medium text-foreground">Click to upload or drag and drop</p>
                <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          )}
        </div>

        {uploadedImage && (
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Image"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

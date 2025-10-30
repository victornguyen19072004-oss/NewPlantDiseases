"use client"

import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Hero } from "@/components/hero"
import { ModelSelector } from "@/components/model-selector"
import { ImageUpload } from "@/components/image-upload"
import { ResultsCard } from "@/components/results-card"
import { ComparisonTable } from "@/components/comparison-table"
import { EDASection } from "@/components/eda-section"
import { ChartsSection } from "@/components/charts-section"
import { Footer } from "@/components/footer"

export default function Home() {
  const [selectedModel, setSelectedModel] = useState("ResNet18")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)

  const handleImageUpload = (imageData: string) => {
    setUploadedImage(imageData)
    setShowResults(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with theme toggle */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600" />
            <h1 className="text-xl font-bold">PlantVillage AI</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <Hero />

        {/* Model Comparison Table */}
        <div className="mb-8">
          <ComparisonTable />
        </div>

        <div className="mb-8">
          <EDASection />
        </div>

        {/* Model Selector */}
        <div className="mb-8">
          <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
        </div>

        {/* Image Upload Section */}
        <div className="mb-8">
          <ImageUpload onImageUpload={handleImageUpload} />
        </div>

        {/* Results Section */}
        {showResults && uploadedImage && (
          <div className="mb-8">
            <ResultsCard imageData={uploadedImage} selectedModel={selectedModel} />
          </div>
        )}

        {/* Charts Section */}
        <div className="mb-8">
          <ChartsSection />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PredictionResultSection() {
  const prediction = {
    disease: "Early Blight",
    confidence: 92.5,
    topDiseases: [
      { name: "Early Blight", confidence: 92.5 },
      { name: "Late Blight", confidence: 5.2 },
      { name: "Healthy", confidence: 2.3 },
    ],
  }

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle>Prediction Result</CardTitle>
        <CardDescription>AI-powered disease classification</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Main Disease */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Detected Disease</p>
          <h2 className="text-4xl font-bold text-primary">{prediction.disease}</h2>
        </div>

        {/* Confidence */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Confidence Score</p>
            <p className="text-lg font-bold text-primary">{prediction.confidence}%</p>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${prediction.confidence}%` }}
            />
          </div>
        </div>

        {/* Top 3 Diseases */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Top 3 Possible Diseases</p>
          <div className="space-y-2">
            {prediction.topDiseases.map((disease, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">{disease.name}</span>
                <span className="text-sm text-muted-foreground">{disease.confidence}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

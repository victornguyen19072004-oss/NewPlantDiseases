"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// F1-Score per class data
const f1ScoreData = [
  { class: "Tomato___Healthy", f1: 0.998 },
  { class: "Tomato___Target_Spot", f1: 0.997 },
  { class: "Tomato___Powdery_Mildew", f1: 0.996 },
  { class: "Potato___Healthy", f1: 0.995 },
  { class: "Potato___Early_Blight", f1: 0.994 },
  { class: "Pepper___Healthy", f1: 0.993 },
]

// Precision vs Recall data
const precisionRecallData = [
  { precision: 0.99, recall: 0.991, class: "Tomato___Healthy" },
  { precision: 0.997, recall: 0.997, class: "Tomato___Target_Spot" },
  { precision: 0.996, recall: 0.996, class: "Tomato___Powdery_Mildew" },
  { precision: 0.995, recall: 0.995, class: "Potato___Healthy" },
  { precision: 0.994, recall: 0.994, class: "Potato___Early_Blight" },
  { precision: 0.993, recall: 0.993, class: "Pepper___Healthy" },
]

// Top 10 easy/hard classes
const classificationDifficultyData = [
  { class: "Tomato___Healthy", accuracy: 99.8, type: "Easy" },
  { class: "Potato___Healthy", accuracy: 99.5, type: "Easy" },
  { class: "Pepper___Healthy", accuracy: 99.3, type: "Easy" },
  { class: "Tomato___Target_Spot", accuracy: 99.7, type: "Easy" },
  { class: "Tomato___Powdery_Mildew", accuracy: 99.6, type: "Medium" },
  { class: "Potato___Early_Blight", accuracy: 99.4, type: "Medium" },
  { class: "Tomato___Septoria_Leaf_Spot", accuracy: 99.2, type: "Medium" },
  { class: "Potato___Late_Blight", accuracy: 99.1, type: "Hard" },
  { class: "Pepper___Bacterial_Spot", accuracy: 98.9, type: "Hard" },
  { class: "Tomato___Yellow_Leaf_Curl_Virus", accuracy: 98.7, type: "Hard" },
]

export function ChartsSection() {
  const chartColors = {
    green: "hsl(142, 71%, 45%)",
    emerald: "hsl(160, 84%, 39%)",
    teal: "hsl(174, 83%, 31%)",
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Model Performance Analytics</h2>

      {/* F1-Score Chart */}
      <Card className="border-green-200 dark:border-green-900/30">
        <CardHeader>
          <CardTitle>F1-Score per Class</CardTitle>
          <CardDescription>Performance metric across disease classes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={f1ScoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="class" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
              <YAxis domain={[0.99, 1]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Bar dataKey="f1" fill={chartColors.green} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Precision vs Recall Chart */}
      <Card className="border-green-200 dark:border-green-900/30">
        <CardHeader>
          <CardTitle>Precision vs Recall</CardTitle>
          <CardDescription>Trade-off analysis across classes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="precision" name="Precision" domain={[0.98, 1]} />
              <YAxis dataKey="recall" name="Recall" domain={[0.98, 1]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                }}
                cursor={{ strokeDasharray: "3 3" }}
              />
              <Scatter name="Classes" data={precisionRecallData} fill={chartColors.emerald} />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Classification Difficulty Chart */}
      <Card className="border-green-200 dark:border-green-900/30">
        <CardHeader>
          <CardTitle>Top 10 Classes by Difficulty</CardTitle>
          <CardDescription>Accuracy distribution across disease classes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={classificationDifficultyData} layout="vertical" margin={{ top: 5, right: 30, left: 200 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[98, 100]} />
              <YAxis dataKey="class" type="category" width={190} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Legend />
              <Bar dataKey="accuracy" fill={chartColors.teal} radius={[0, 8, 8, 0]} name="Accuracy (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

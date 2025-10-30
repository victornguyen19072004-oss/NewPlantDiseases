import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Timer, HardDrive, Zap } from "lucide-react"

interface Model {
  name: string
  bestValidAcc: string
  f1Score: string
  inferenceTime: string
  modelSize: string
  isBest?: boolean
}

export default function ModelCard({ model }: { model: Model }) {
  return (
    <Card className={`relative transition-all ${model.isBest ? "ring-2 ring-green-500 shadow-lg" : "hover:shadow-md"}`}>
      {model.isBest && (
        <div className="absolute -top-3 -right-3">
          <Badge className="bg-green-600 text-white flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Best
          </Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          {model.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Accuracy</span>
          <span className="font-bold text-green-600">{model.bestValidAcc}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">F1-Score</span>
          <span className="font-semibold">{model.f1Score}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Timer className="h-4 w-4" />
            Thời gian
          </div>
          <span className="font-medium">{model.inferenceTime}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <HardDrive className="h-4 w-4" />
            Kích thước
          </div>
          <span className="font-medium">{model.modelSize}</span>
        </div>
      </CardContent>
    </Card>
  )
}
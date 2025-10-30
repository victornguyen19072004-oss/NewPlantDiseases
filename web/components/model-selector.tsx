import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (model: string) => void
}

const models = [
  { value: "ResNet18", label: "ResNet18 (99.91%)" },
  { value: "MobileNetV2", label: "MobileNetV2 (99.86%)" },
  { value: "EfficientNetB0", label: "EfficientNetB0 (99.1%)" },
  { value: "CNN", label: "CNN (91.81%)" },
]

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <label className="font-medium">Chọn mô hình:</label>
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {models.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
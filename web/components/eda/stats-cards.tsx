"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsCardsProps {
  data: {
    total_train: number
    total_valid: number
    num_classes: number
    imbalance_ratio: string
  }
}

export default function StatsCards({ data }: StatsCardsProps) {
  const stats = [
    {
      title: "Tổng ảnh Train",
      value: data.total_train.toLocaleString(),
      icon: "📊",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Tổng ảnh Valid",
      value: data.total_valid.toLocaleString(),
      icon: "✓",
      color: "from-green-500 to-green-600",
    },
    {
      title: "Số lớp",
      value: data.num_classes,
      icon: "🏷️",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Tỷ lệ Imbalance",
      value: data.imbalance_ratio,
      icon: "⚖️",
      color: "from-orange-500 to-orange-600",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, index) => (
        <motion.div key={index} variants={itemVariants}>
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </CardHeader>
            <CardContent>
              <motion.div
                className="text-2xl font-bold"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              >
                {stat.value}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}

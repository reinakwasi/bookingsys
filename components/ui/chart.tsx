// components/ui/chart.tsx
import type React from "react"

interface BarChartProps {
  data: { name: string; value: number }[]
  index: string
  categories: string[]
  colors: string[]
  valueFormatter?: (value: number) => string
  className?: string
}

export const BarChart: React.FC<BarChartProps> = ({ data, index, categories, colors, valueFormatter, className }) => {
  return (
    <div className={className}>
      {/* Placeholder for BarChart */}
      <svg width="100%" height="100%">
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="16" fill="#6b7280">
          BarChart Placeholder
        </text>
      </svg>
    </div>
  )
}

interface PieChartProps {
  data: { name: string; value: number }[]
  index: string
  valueFormatter?: (value: number) => string
  className?: string
}

export const PieChart: React.FC<PieChartProps> = ({ data, index, valueFormatter, className }) => {
  return (
    <div className={className}>
      {/* Placeholder for PieChart */}
      <svg width="100%" height="100%">
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="16" fill="#6b7280">
          PieChart Placeholder
        </text>
      </svg>
    </div>
  )
}

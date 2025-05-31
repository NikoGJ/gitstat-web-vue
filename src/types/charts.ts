import type { ColoredElement } from './coloredElement'

export interface ChartData {
  x: Date
  y: number
}

export interface LineData {
  label: string
  data: ChartData[]
}

export type Line = ColoredElement & LineData

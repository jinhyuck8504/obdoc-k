export interface WeightRecord {
  id: string
  patientId: string
  weight: number
  date: string
  note?: string
  createdAt: string
  updatedAt: string
}

export interface WeightGoal {
  id: string
  patientId: string
  initialWeight: number
  targetWeight: number
  currentWeight: number
  targetDate?: string
  createdAt: string
  updatedAt: string
}

export interface HealthMetrics {
  currentWeight: number
  targetWeight: number
  initialWeight: number
  weightLoss: number
  progress: number
  remainingWeight: number
  bmi: number
  targetBMI: number
  height: number
}

export interface WeightFormData {
  weight: number
  date: string
  note?: string
}

export interface GoalFormData {
  targetWeight: number
  targetDate?: string
}
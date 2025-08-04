'use client'

import React, { useState, useEffect } from 'react'
import { X, Target, TrendingDown, Calendar, AlertCircle } from 'lucide-react'

interface GoalSettingModalProps {
  isOpen: boolean
  onClose: () => void
  currentMetrics: {
    currentWeight: number
    height: number
    targetWeight?: number
    targetDate?: string
  }
  onSave: (goalData: {
    targetWeight: number
    targetDate: string
    weeklyGoal: number
  }) => void
}

interface FormData {
  targetWeight: number
  targetDate: string
  weeklyGoal: number
}

interface FormErrors {
  targetWeight?: string
  targetDate?: string
  weeklyGoal?: string
}

export default function GoalSettingModal({
  isOpen,
  onClose,
  currentMetrics,
  onSave
}: GoalSettingModalProps) {
  const [formData, setFormData] = useState<FormData>({
    targetWeight: currentMetrics.targetWeight || 0,
    targetDate: currentMetrics.targetDate || '',
    weeklyGoal: 0.5
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 모달이 열릴 때 초기값 설정
  useEffect(() => {
    if (isOpen) {
      const today = new Date()
      const threeMonthsLater = new Date(today.getTime() + (90 * 24 * 60 * 60 * 1000))
      
      setFormData({
        targetWeight: currentMetrics.targetWeight || Math.max(currentMetrics.currentWeight - 10, 50),
        targetDate: currentMetrics.targetDate || threeMonthsLater.toISOString().split('T')[0],
        weeklyGoal: 0.5
      })
      setErrors({})
    }
  }, [isOpen, currentMetrics])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.targetWeight || formData.targetWeight <= 0) {
      newErrors.targetWeight = '목표 체중을 입력해주세요'
    } else if (formData.targetWeight < 30 || formData.targetWeight > 300) {
      newErrors.targetWeight = '목표 체중은 30kg에서 300kg 사이여야 합니다'
    } else if (formData.targetWeight >= currentMetrics.currentWeight) {
      newErrors.targetWeight = '목표 체중은 현재 체중보다 낮아야 합니다'
    }

    if (!formData.targetDate) {
      newErrors.targetDate = '목표 날짜를 선택해주세요'
    } else {
      const targetDate = new Date(formData.targetDate)
      const today = new Date()
      const maxDate = new Date(today.getTime() + (365 * 24 * 60 * 60 * 1000)) // 1년 후

      if (targetDate <= today) {
        newErrors.targetDate = '목표 날짜는 오늘 이후여야 합니다'
      } else if (targetDate > maxDate) {
        newErrors.targetDate = '목표 날짜는 1년 이내여야 합니다'
      }
    }

    if (!formData.weeklyGoal || formData.weeklyGoal <= 0) {
      newErrors.weeklyGoal = '주간 목표를 설정해주세요'
    } else if (formData.weeklyGoal < 0.1 || formData.weeklyGoal > 2) {
      newErrors.weeklyGoal = '주간 목표는 0.1kg에서 2kg 사이여야 합니다'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculateWeeksToGoal = (): number => {
    if (!formData.targetDate) return 0
    
    const today = new Date()
    const targetDate = new Date(formData.targetDate)
    const diffTime = targetDate.getTime() - today.getTime()
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
    
    return Math.max(diffWeeks, 1)
  }

  const calculateRecommendedWeeklyGoal = (): number => {
    const weightToLose = currentMetrics.currentWeight - formData.targetWeight
    const weeksToGoal = calculateWeeksToGoal()
    
    if (weeksToGoal <= 0 || weightToLose <= 0) return 0.5
    
    return Math.round((weightToLose / weeksToGoal) * 10) / 10
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('목표 설정 저장 실패:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const getBMI = (weight: number): number => {
    const heightInM = currentMetrics.height / 100
    return Math.round((weight / (heightInM * heightInM)) * 10) / 10
  }

  const getBMICategory = (bmi: number): { text: string; color: string } => {
    if (bmi < 18.5) return { text: '저체중', color: 'text-blue-600' }
    if (bmi < 25) return { text: '정상', color: 'text-green-600' }
    if (bmi < 30) return { text: '과체중', color: 'text-yellow-600' }
    return { text: '비만', color: 'text-red-600' }
  }

  if (!isOpen) return null

  const weeksToGoal = calculateWeeksToGoal()
  const recommendedWeeklyGoal = calculateRecommendedWeeklyGoal()
  const targetBMI = getBMI(formData.targetWeight)
  const targetBMICategory = getBMICategory(targetBMI)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            목표 설정
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 현재 상태 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">현재 상태</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">현재 체중</span>
                <p className="font-medium">{currentMetrics.currentWeight}kg</p>
              </div>
              <div>
                <span className="text-gray-500">키</span>
                <p className="font-medium">{currentMetrics.height}cm</p>
              </div>
            </div>
          </div>

          {/* 목표 체중 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              목표 체중 (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.targetWeight || ''}
              onChange={(e) => handleInputChange('targetWeight', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.targetWeight ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="목표 체중을 입력하세요"
            />
            {errors.targetWeight && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.targetWeight}
              </p>
            )}
            {formData.targetWeight > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                <p>목표 BMI: {targetBMI} ({targetBMICategory.text})</p>
                <p>감량 목표: {(currentMetrics.currentWeight - formData.targetWeight).toFixed(1)}kg</p>
              </div>
            )}
          </div>

          {/* 목표 날짜 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              목표 달성 날짜
            </label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => handleInputChange('targetDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.targetDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.targetDate && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.targetDate}
              </p>
            )}
            {formData.targetDate && (
              <p className="mt-1 text-sm text-gray-600">
                목표까지 {weeksToGoal}주 남음
              </p>
            )}
          </div>

          {/* 주간 목표 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주간 감량 목표 (kg/주)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.weeklyGoal || ''}
              onChange={(e) => handleInputChange('weeklyGoal', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.weeklyGoal ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="주간 감량 목표를 입력하세요"
            />
            {errors.weeklyGoal && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.weeklyGoal}
              </p>
            )}
            {recommendedWeeklyGoal > 0 && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <TrendingDown className="w-4 h-4 inline mr-1" />
                  권장 주간 목표: {recommendedWeeklyGoal}kg/주
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  건강한 감량을 위해 주당 0.5-1kg 감량을 권장합니다
                </p>
              </div>
            )}
          </div>

          {/* 목표 요약 */}
          {formData.targetWeight > 0 && formData.targetDate && formData.weeklyGoal > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                목표 요약
              </h3>
              <div className="text-sm text-green-700 space-y-1">
                <p>• 총 감량 목표: {(currentMetrics.currentWeight - formData.targetWeight).toFixed(1)}kg</p>
                <p>• 목표 기간: {weeksToGoal}주</p>
                <p>• 주간 목표: {formData.weeklyGoal}kg/주</p>
                <p>• 예상 달성일: {new Date(formData.targetDate).toLocaleDateString('ko-KR')}</p>
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '저장 중...' : '목표 설정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

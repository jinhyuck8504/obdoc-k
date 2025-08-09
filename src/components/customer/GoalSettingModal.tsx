'use client'
import React, { useState } from 'react'
// Removed lucide-react dependency - using emoji icons instead
import { GoalFormData, HealthMetrics } from '@/types/health'

interface GoalSettingModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: GoalFormData) => void
  currentMetrics: HealthMetrics
}

export default function GoalSettingModal({ 
  isOpen, 
  onClose, 
  onSave, 
  currentMetrics 
}: GoalSettingModalProps) {
  const [formData, setFormData] = useState<GoalFormData>({
    targetWeight: currentMetrics.targetWeight,
    targetDate: ''
  })
  const [errors, setErrors] = useState<{
    targetWeight?: string
    targetDate?: string
  }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const calculateBMI = (weight: number, height: number): number => {
    return weight / Math.pow(height / 100, 2)
  }

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return '저체중'
    if (bmi < 23) return '정상'
    if (bmi < 25) return '과체중'
    if (bmi < 30) return '비만'
    return '고도비만'
  }

  const validateForm = (): boolean => {
    const newErrors: {
      targetWeight?: string
      targetDate?: string
    } = {}

    if (!formData.targetWeight || formData.targetWeight <= 0) {
      newErrors.targetWeight = '목표 체중을 입력해주세요'
    } else if (formData.targetWeight < 30 || formData.targetWeight > 300) {
      newErrors.targetWeight = '목표 체중은 30kg에서 300kg 사이여야 합니다'
    } else if (formData.targetWeight >= currentMetrics.currentWeight) {
      newErrors.targetWeight = '목표 체중은 현재 체중보다 작아야 합니다'
    }

    if (formData.targetDate) {
      const targetDate = new Date(formData.targetDate)
      const today = new Date()
      if (targetDate <= today) {
        newErrors.targetDate = '목표 날짜는 오늘 이후여야 합니다'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('목표 저장 중 오류:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof GoalFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 에러 메시지 제거
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const targetBMI = formData.targetWeight ? calculateBMI(formData.targetWeight, currentMetrics.height) : 0
  const weightToLose = currentMetrics.currentWeight - (formData.targetWeight || 0)
  const isHealthyTarget = targetBMI >= 18.5 && targetBMI < 25

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-green-600">🎯</span>
            <h3 className="text-lg font-semibold text-gray-900">목표 설정</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <span>❌</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 현재 상태 표시 */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-2">현재 상태</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-700">현재 체중</p>
                <p className="font-semibold text-blue-900">{currentMetrics.currentWeight}kg</p>
              </div>
              <div>
                <p className="text-blue-700">현재 BMI</p>
                <p className="font-semibold text-blue-900">
                  {currentMetrics.bmi.toFixed(1)} ({getBMICategory(currentMetrics.bmi)})
                </p>
              </div>
            </div>
          </div>

          {/* 목표 체중 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              목표 체중 (kg) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🎯</span>
              <input
                type="number"
                step="0.1"
                value={formData.targetWeight || ''}
                onChange={(e) => handleInputChange('targetWeight', parseFloat(e.target.value) || 0)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.targetWeight ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="목표 체중을 입력하세요"
                min="30"
                max="300"
              />
            </div>
            {errors.targetWeight && (
              <p className="mt-1 text-sm text-red-600">{errors.targetWeight}</p>
            )}
          </div>

          {/* 목표 날짜 (선택사항) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              목표 달성 날짜 (선택사항)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📅</span>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => handleInputChange('targetDate', e.target.value)}
                min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.targetDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.targetDate && (
              <p className="mt-1 text-sm text-red-600">{errors.targetDate}</p>
            )}
          </div>

          {/* 목표 미리보기 */}
          {formData.targetWeight && formData.targetWeight > 0 && (
            <div className={`p-4 rounded-lg border ${
              isHealthyTarget ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
            }`}>
              <h4 className={`text-sm font-medium mb-2 ${
                isHealthyTarget ? 'text-green-900' : 'text-orange-900'
              }`}>
                목표 달성 시 예상 결과
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className={isHealthyTarget ? 'text-green-700' : 'text-orange-700'}>
                    감량할 체중
                  </p>
                  <p className={`font-semibold ${
                    isHealthyTarget ? 'text-green-900' : 'text-orange-900'
                  }`}>
                    {weightToLose.toFixed(1)}kg
                  </p>
                </div>
                <div>
                  <p className={isHealthyTarget ? 'text-green-700' : 'text-orange-700'}>
                    목표 BMI
                  </p>
                  <p className={`font-semibold ${
                    isHealthyTarget ? 'text-green-900' : 'text-orange-900'
                  }`}>
                    {targetBMI.toFixed(1)} ({getBMICategory(targetBMI)})
                  </p>
                </div>
              </div>
              {!isHealthyTarget && (
                <div className="mt-3 flex items-start space-x-2">
                  <span className="text-orange-600 mt-0.5 flex-shrink-0">⚠️</span>
                  <p className="text-xs text-orange-800">
                    {targetBMI < 18.5 
                      ? '목표 체중이 너무 낮을 수 있습니다. 건강한 체중 범위를 고려해보세요.'
                      : '목표 체중이 높을 수 있습니다. 더 낮은 목표를 설정해보세요.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 버튼 */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors flex items-center"
            >
              <span className="mr-2">💾</span>
              {isSubmitting ? '저장 중...' : '목표 설정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

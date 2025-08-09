'use client'

import React, { useState, useEffect } from 'react'
import { Customer, CustomerFormData } from '@/types/customer'
import { customerService } from '@/lib/customerService'

interface CustomerFormProps {
  customer?: Customer | null
  onSave: (data: CustomerFormData) => void
  onCancel: () => void
}

export default function CustomerForm({ customer, onSave, onCancel }: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: 'male',
    height: 0,
    initialWeight: 0,
    currentWeight: 0,
    targetWeight: 0,
    address: '',
    medicalHistory: '',
    allergies: '',
    medications: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone,
        birthDate: customer.birthDate,
        gender: customer.gender,
        height: customer.height,
        initialWeight: customer.initialWeight,
        currentWeight: customer.currentWeight,
        targetWeight: customer.targetWeight,
        address: customer.address || '',
        medicalHistory: customer.medicalHistory || '',
        allergies: customer.allergies || '',
        medications: customer.medications || '',
        emergencyContactName: customer.emergencyContact?.name || '',
        emergencyContactPhone: customer.emergencyContact?.phone || '',
        emergencyContactRelationship: customer.emergencyContact?.relationship || ''
      })
    }
  }, [customer])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // 필수 필드 검증
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요'
    } else if (!/^010-\d{4}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = '올바른 전화번호 형식이 아닙니다 (010-0000-0000)'
    }

    if (!formData.birthDate) {
      newErrors.birthDate = '생년월일을 선택해주세요'
    }

    if (formData.height <= 0) {
      newErrors.height = '키를 입력해주세요'
    }

    if (formData.initialWeight <= 0) {
      newErrors.initialWeight = '초기 체중을 입력해주세요'
    }

    if (formData.currentWeight <= 0) {
      newErrors.currentWeight = '현재 체중을 입력해주세요'
    }

    if (formData.targetWeight <= 0) {
      newErrors.targetWeight = '목표 체중을 입력해주세요'
    }

    // 체중 논리 검증
    if (formData.targetWeight >= formData.initialWeight) {
      newErrors.targetWeight = '목표 체중은 초기 체중보다 작아야 합니다'
    }

    // 이메일 형식 검증 (선택사항)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다'
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
      // 전화번호 형식 정규화
      const normalizedData = {
        ...formData,
        phone: formData.phone.replace(/[^\d]/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '010-$2-$3')
      }
      
      await onSave(normalizedData)
    } catch (error) {
      console.error('고객 저장 중 오류:', error)
      alert('고객 정보 저장에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof CustomerFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const calculateBMI = (weight: number, height: number): number => {
    if (weight <= 0 || height <= 0) return 0
    return weight / Math.pow(height / 100, 2)
  }

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return '저체중'
    if (bmi < 23) return '정상'
    if (bmi < 25) return '과체중'
    if (bmi < 30) return '비만'
    return '고도비만'
  }

  const currentBMI = calculateBMI(formData.currentWeight, formData.height)
  const targetBMI = calculateBMI(formData.targetWeight, formData.height)
  const age = calculateAge(formData.birthDate)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ←
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {customer ? '고객 정보 수정' : '새 고객 등록'}
            </h1>
            <p className="text-gray-600 mt-1">
              {customer ? '고객 정보를 수정하세요' : '새로운 고객의 정보를 입력하세요'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 기본 정보 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-blue-600">👤</span>
            <h2 className="text-lg font-semibold text-gray-900">기본 정보</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="고객 이름을 입력하세요"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* 성별 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                성별 <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="mr-2"
                  />
                  남성
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="mr-2"
                  />
                  여성
                </label>
              </div>
            </div>

            {/* 생년월일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                생년월일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.birthDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.birthDate && (
                <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>
              )}
              {age > 0 && (
                <p className="mt-1 text-sm text-gray-600">만 {age}세</p>
              )}
            </div>

            {/* 키 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                키 (cm) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📏</span>
                <input
                  type="number"
                  value={formData.height || ''}
                  onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 0)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.height ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="키를 입력하세요"
                  min="100"
                  max="250"
                />
              </div>
              {errors.height && (
                <p className="mt-1 text-sm text-red-600">{errors.height}</p>
              )}
            </div>
          </div>
        </div>

        {/* 연락처 정보 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-green-600">📞</span>
            <h2 className="text-lg font-semibold text-gray-900">연락처 정보</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 전화번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                전화번호 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📞</span>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="010-0000-0000"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📧</span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="이메일 주소 (선택사항)"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* 주소 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주소
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">📍</span>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={2}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="주소를 입력하세요 (선택사항)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 체중 정보 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-purple-600">⚖️</span>
            <h2 className="text-lg font-semibold text-gray-900">체중 정보</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 초기 체중 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                초기 체중 (kg) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">⚖️</span>
                <input
                  type="number"
                  value={formData.initialWeight || ''}
                  onChange={(e) => handleInputChange('initialWeight', parseFloat(e.target.value) || 0)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.initialWeight ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="초기 체중"
                  min="30"
                  max="300"
                  step="0.1"
                />
              </div>
              {errors.initialWeight && (
                <p className="mt-1 text-sm text-red-600">{errors.initialWeight}</p>
              )}
            </div>

            {/* 현재 체중 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                현재 체중 (kg) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">⚖️</span>
                <input
                  type="number"
                  value={formData.currentWeight || ''}
                  onChange={(e) => handleInputChange('currentWeight', parseFloat(e.target.value) || 0)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.currentWeight ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="현재 체중"
                  min="30"
                  max="300"
                  step="0.1"
                />
              </div>
              {errors.currentWeight && (
                <p className="mt-1 text-sm text-red-600">{errors.currentWeight}</p>
              )}
              {currentBMI > 0 && (
                <p className="mt-1 text-sm text-gray-600">
                  BMI: {currentBMI.toFixed(1)} ({getBMICategory(currentBMI)})
                </p>
              )}
            </div>

            {/* 목표 체중 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                목표 체중 (kg) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🎯</span>
                <input
                  type="number"
                  value={formData.targetWeight || ''}
                  onChange={(e) => handleInputChange('targetWeight', parseFloat(e.target.value) || 0)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.targetWeight ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="목표 체중"
                  min="30"
                  max="300"
                  step="0.1"
                />
              </div>
              {errors.targetWeight && (
                <p className="mt-1 text-sm text-red-600">{errors.targetWeight}</p>
              )}
              {targetBMI > 0 && (
                <p className="mt-1 text-sm text-gray-600">
                  목표 BMI: {targetBMI.toFixed(1)} ({getBMICategory(targetBMI)})
                </p>
              )}
            </div>
          </div>

          {/* 체중 감량 목표 */}
          {formData.initialWeight > 0 && formData.targetWeight > 0 && formData.targetWeight < formData.initialWeight && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>감량 목표:</strong> {(formData.initialWeight - formData.targetWeight).toFixed(1)}kg
              </p>
              {formData.currentWeight > 0 && (
                <p className="text-sm text-blue-700 mt-1">
                  <strong>현재 진행률:</strong> {Math.max(0, Math.min(100, ((formData.initialWeight - formData.currentWeight) / (formData.initialWeight - formData.targetWeight)) * 100)).toFixed(1)}%
                </p>
              )}
            </div>
          )}
        </div>

        {/* 의료 정보 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-red-600">📋</span>
            <h2 className="text-lg font-semibold text-gray-900">의료 정보</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 병력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                병력
              </label>
              <textarea
                value={formData.medicalHistory}
                onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="기존 질병이나 수술 이력을 입력하세요"
              />
            </div>

            {/* 알레르기 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                알레르기
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">⚠️</span>
                <textarea
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  rows={3}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="알레르기 정보를 입력하세요"
                />
              </div>
            </div>

            {/* 복용 약물 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                복용 약물
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">💊</span>
                <textarea
                  value={formData.medications}
                  onChange={(e) => handleInputChange('medications', e.target.value)}
                  rows={3}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="현재 복용 중인 약물을 입력하세요"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 비상 연락처 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-orange-600">👥</span>
            <h2 className="text-lg font-semibold text-gray-900">비상 연락처</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 비상 연락처 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <input
                type="text"
                value={formData.emergencyContactName}
                onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="비상 연락처 이름"
              />
            </div>

            {/* 비상 연락처 전화번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                전화번호
              </label>
              <input
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="010-0000-0000"
              />
            </div>

            {/* 관계 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                관계
              </label>
              <select
                value={formData.emergencyContactRelationship}
                onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">관계 선택</option>
                <option value="배우자">배우자</option>
                <option value="부모">부모</option>
                <option value="자녀">자녀</option>
                <option value="형제자매">형제자매</option>
                <option value="친구">친구</option>
                <option value="기타">기타</option>
              </select>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="inline mr-2">✕</span>
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center"
          >
            <span className="mr-2">💾</span>
            {isSubmitting ? '저장 중...' : (customer ? '수정하기' : '등록하기')}
          </button>
        </div>
      </form>
    </div>
  )
}

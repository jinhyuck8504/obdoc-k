'use client'

import React, { useState } from 'react'
import { Customer } from '@/types/customer'

interface CustomerDetailProps {
  customer: Customer
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function CustomerDetail({ customer, onBack, onEdit, onDelete }: CustomerDetailProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const calculateAge = (birthDate: string): number => {
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
    return weight / Math.pow(height / 100, 2)
  }

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return '저체중'
    if (bmi < 23) return '정상'
    if (bmi < 25) return '과체중'
    if (bmi < 30) return '비만'
    return '고도비만'
  }

  const calculateProgress = (): number => {
    const totalLoss = customer.initialWeight - customer.targetWeight
    const currentLoss = customer.initialWeight - customer.currentWeight
    return Math.max(0, Math.min(100, (currentLoss / totalLoss) * 100))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '진행중'
      case 'inactive':
        return '비활성'
      case 'completed':
        return '완료'
      default:
        return '알 수 없음'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const age = calculateAge(customer.birthDate)
  const currentBMI = calculateBMI(customer.currentWeight, customer.height)
  const targetBMI = calculateBMI(customer.targetWeight, customer.height)
  const progress = calculateProgress()
  const weightLoss = customer.initialWeight - customer.currentWeight
  const remainingWeight = customer.currentWeight - customer.targetWeight

  const handleDelete = () => {
    onDelete()
    setShowDeleteConfirm(false)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-gray-600">
                  {customer.gender === 'male' ? '남성' : '여성'} • 만 {age}세
                </span>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(customer.status)}`}>
                  {getStatusText(customer.status)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onEdit}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              <span className="mr-2">✏️</span>
              수정
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              <span className="mr-2">🗑️</span>
              삭제
            </button>
          </div>
        </div>
      </div>

      {/* 진행률 요약 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-blue-100 text-sm font-medium">초기 체중</p>
            <p className="text-3xl font-bold">{customer.initialWeight}kg</p>
          </div>
          <div className="text-center">
            <p className="text-blue-100 text-sm font-medium">현재 체중</p>
            <p className="text-3xl font-bold">{customer.currentWeight}kg</p>
            <div className="flex items-center justify-center mt-1">
              {weightLoss > 0 && (
                <div className="flex items-center text-green-200">
                  <span className="mr-1">📉</span>
                  -{weightLoss.toFixed(1)}kg
                </div>
              )}
            </div>
          </div>
          <div className="text-center">
            <p className="text-blue-100 text-sm font-medium">목표 체중</p>
            <p className="text-3xl font-bold">{customer.targetWeight}kg</p>
            <p className="text-blue-200 text-sm mt-1">
              {remainingWeight > 0 ? `${remainingWeight.toFixed(1)}kg 남음` : '목표 달성!'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-blue-100 text-sm font-medium">진행률</p>
            <p className="text-3xl font-bold">{progress.toFixed(0)}%</p>
            <div className="w-full bg-blue-400 rounded-full h-2 mt-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, progress)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 기본 정보 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 개인 정보 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <span className="text-blue-600">👤</span>
              <h2 className="text-lg font-semibold text-gray-900">개인 정보</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">생년월일</label>
                <div className="flex items-center text-gray-900">
                  <span className="mr-2 text-gray-400">📅</span>
                  {formatDate(customer.birthDate)} (만 {age}세)
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">성별</label>
                <p className="text-gray-900">{customer.gender === 'male' ? '남성' : '여성'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">키</label>
                <p className="text-gray-900">{customer.height}cm</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">등록일</label>
                <p className="text-gray-900">{formatDate(customer.startDate)}</p>
              </div>

              {customer.lastVisit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">최근 방문</label>
                  <p className="text-gray-900">{formatDate(customer.lastVisit)}</p>
                </div>
              )}
            </div>
          </div>

          {/* 연락처 정보 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <span className="text-green-600">📞</span>
              <h2 className="text-lg font-semibold text-gray-900">연락처 정보</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                <div className="flex items-center text-gray-900">
                  <span className="mr-2 text-gray-400">📞</span>
                  <a href={`tel:${customer.phone}`} className="hover:text-blue-600 transition-colors">
                    {customer.phone}
                  </a>
                </div>
              </div>

              {customer.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                  <div className="flex items-center text-gray-900">
                    <span className="mr-2 text-gray-400">📧</span>
                    <a href={`mailto:${customer.email}`} className="hover:text-blue-600 transition-colors">
                      {customer.email}
                    </a>
                  </div>
                </div>
              )}

              {customer.address && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                  <div className="flex items-start text-gray-900">
                    <span className="mr-2 text-gray-400 mt-0.5">📍</span>
                    <p>{customer.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 의료 정보 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <span className="text-red-600">📋</span>
              <h2 className="text-lg font-semibold text-gray-900">의료 정보</h2>
            </div>

            <div className="space-y-6">
              {customer.medicalHistory && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">병력</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{customer.medicalHistory}</p>
                  </div>
                </div>
              )}

              {customer.allergies && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">알레르기</label>
                  <div className="flex items-start p-3 bg-red-50 rounded-lg">
                    <span className="mr-2 text-red-500 mt-0.5">⚠️</span>
                    <p className="text-red-800 whitespace-pre-wrap">{customer.allergies}</p>
                  </div>
                </div>
              )}

              {customer.medications && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">복용 약물</label>
                  <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                    <span className="mr-2 text-blue-500 mt-0.5">💊</span>
                    <p className="text-blue-800 whitespace-pre-wrap">{customer.medications}</p>
                  </div>
                </div>
              )}

              {!customer.medicalHistory && !customer.allergies && !customer.medications && (
                <p className="text-gray-500 text-center py-4">등록된 의료 정보가 없습니다</p>
              )}
            </div>
          </div>

          {/* 비상 연락처 */}
          {customer.emergencyContact && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-orange-600">👥</span>
                <h2 className="text-lg font-semibold text-gray-900">비상 연락처</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                  <p className="text-gray-900">{customer.emergencyContact.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                  <div className="flex items-center text-gray-900">
                    <span className="mr-2 text-gray-400">📞</span>
                    <a href={`tel:${customer.emergencyContact.phone}`} className="hover:text-blue-600 transition-colors">
                      {customer.emergencyContact.phone}
                    </a>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">관계</label>
                  <p className="text-gray-900">{customer.emergencyContact.relationship}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 사이드바 - 체중 정보 및 통계 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 체중 정보 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <span className="text-purple-600">⚖️</span>
              <h2 className="text-lg font-semibold text-gray-900">체중 정보</h2>
            </div>

            <div className="space-y-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">현재 BMI</p>
                <p className="text-2xl font-bold text-purple-700">{currentBMI.toFixed(1)}</p>
                <p className="text-sm text-purple-600">{getBMICategory(currentBMI)}</p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">목표 BMI</p>
                <p className="text-2xl font-bold text-green-700">{targetBMI.toFixed(1)}</p>
                <p className="text-sm text-green-600">{getBMICategory(targetBMI)}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">감량 목표</span>
                  <span className="font-medium text-gray-900">
                    {(customer.initialWeight - customer.targetWeight).toFixed(1)}kg
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">현재 감량</span>
                  <span className="font-medium text-green-600">
                    {weightLoss.toFixed(1)}kg
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">남은 목표</span>
                  <span className="font-medium text-orange-600">
                    {Math.max(0, remainingWeight).toFixed(1)}kg
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 활동 요약 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <span className="text-blue-600">📊</span>
              <h2 className="text-lg font-semibold text-gray-900">활동 요약</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">등록 기간</span>
                <span className="font-medium text-gray-900">
                  {Math.ceil((new Date().getTime() - new Date(customer.startDate).getTime()) / (1000 * 60 * 60 * 24))}일
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">주간 평균 감량</span>
                <span className="font-medium text-gray-900">
                  {(weightLoss / Math.max(1, Math.ceil((new Date().getTime() - new Date(customer.startDate).getTime()) / (1000 * 60 * 60 * 24 * 7)))).toFixed(2)}kg
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">목표 달성률</span>
                <span className={`font-medium ${progress >= 100 ? 'text-green-600' : progress >= 50 ? 'text-blue-600' : 'text-orange-600'}`}>
                  {progress.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600">🗑️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">고객 삭제</h3>
                <p className="text-sm text-gray-600">이 작업은 되돌릴 수 없습니다</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              <strong>{customer.name}</strong> 고객의 모든 정보가 영구적으로 삭제됩니다. 
              정말로 삭제하시겠습니까?
            </p>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

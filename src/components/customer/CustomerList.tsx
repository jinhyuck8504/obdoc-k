'use client'

import React from 'react'
// Removed lucide-react dependency - using emoji icons instead
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import { Customer } from '@/types/customer'

interface CustomerListProps {
  customers: Customer[]
  loading: boolean
  onSelectCustomer: (customer: Customer) => void
  onEditCustomer: (customer: Customer) => void
  onDeleteCustomer: (customerId: string) => void
}

export default function CustomerList({
  customers,
  loading,
  onSelectCustomer,
  onEditCustomer,
  onDeleteCustomer
}: CustomerListProps) {
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

  const calculateProgress = (customer: Customer) => {
    const totalLoss = customer.initialWeight - customer.targetWeight
    const currentLoss = customer.initialWeight - customer.currentWeight
    return Math.max(0, Math.min(100, (currentLoss / totalLoss) * 100))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <LoadingSpinner size="lg" text="고객 목록을 불러오는 중..." />
      </div>
    )
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <EmptyState
          icon={<span className="text-6xl">👥</span>}
          title="등록된 고객이 없습니다"
          description="새 고객을 등록하여 관리를 시작하세요"
        />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* 테이블 헤더 */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
          <div className="col-span-3">고객 정보</div>
          <div className="col-span-2">연락처</div>
          <div className="col-span-2">체중 정보</div>
          <div className="col-span-2">진행률</div>
          <div className="col-span-2">상태</div>
          <div className="col-span-1">액션</div>
        </div>
      </div>

      {/* 테이블 바디 */}
      <div className="divide-y divide-gray-200">
        {customers.map((customer) => {
          const progress = calculateProgress(customer)
          const weightLoss = customer.initialWeight - customer.currentWeight

          return (
            <div
              key={customer.id}
              className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onSelectCustomer(customer)}
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* 고객 정보 */}
                <div className="col-span-3">
                  <div>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-600">
                      {customer.gender === 'male' ? '남성' : '여성'} • {customer.height}cm
                    </p>
                  </div>
                </div>

                {/* 연락처 */}
                <div className="col-span-2">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-1">📞</span>
                      {customer.phone}
                    </div>
                    {customer.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-1">📧</span>
                        {customer.email}
                      </div>
                    )}
                  </div>
                </div>

                {/* 체중 정보 */}
                <div className="col-span-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      {customer.currentWeight}kg
                    </p>
                    <p className="text-xs text-gray-600">
                      목표: {customer.targetWeight}kg
                    </p>
                    {weightLoss > 0 && (
                      <div className="flex items-center text-xs text-green-600">
                        <span className="mr-1">📉</span>
                        -{weightLoss.toFixed(1)}kg
                      </div>
                    )}
                  </div>
                </div>

                {/* 진행률 */}
                <div className="col-span-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">진행률</span>
                      <span className="font-medium text-gray-900">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          progress >= 100 ? 'bg-green-500' :
                          progress >= 70 ? 'bg-blue-500' :
                          progress >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* 상태 */}
                <div className="col-span-2">
                  <div className="space-y-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(customer.status)}`}>
                      {getStatusText(customer.status)}
                    </span>
                    <div className="flex items-center text-xs text-gray-600">
                      <span className="mr-1">📅</span>
                      {customer.lastVisit ? formatDate(customer.lastVisit) : '방문 기록 없음'}
                    </div>
                  </div>
                </div>

                {/* 액션 */}
                <div className="col-span-1">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectCustomer(customer)
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="상세 보기"
                    >
                      👁️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditCustomer(customer)
                      }}
                      className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="수정"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteCustomer(customer.id)
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 푸터 */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          총 {customers.length}명의 고객이 등록되어 있습니다
        </p>
      </div>
    </div>
  )
}

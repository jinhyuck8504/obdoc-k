'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, MoreHorizontal, Users, Calendar, CheckCircle, XCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { HospitalCode, CodeListResponse } from '@/types/hospitalCode'
import HospitalCodeForm from './HospitalCodeForm'

interface HospitalCodeManagerProps {
  doctorId: string
}

export default function HospitalCodeManager({ doctorId }: HospitalCodeManagerProps) {
  const [codes, setCodes] = useState<HospitalCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)

  // 코드 목록 불러오기
  const fetchCodes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/hospital-codes')
      
      if (!response.ok) {
        throw new Error('코드 목록을 불러오는데 실패했습니다.')
      }

      const data: CodeListResponse = await response.json()
      setCodes(data.codes)
    } catch (error) {
      console.error('Error fetching codes:', error)
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCodes()
  }, [])

  // 코드 생성 성공 핸들러
  const handleCodeCreated = (newCode: HospitalCode) => {
    setCodes(prev => [newCode, ...prev])
    setShowCreateForm(false)
  }

  // 코드 상태 토글
  const toggleCodeStatus = async (codeId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/hospital-codes/${codeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentStatus
        }),
      })

      if (!response.ok) {
        throw new Error('코드 상태 변경에 실패했습니다.')
      }

      const updatedCode = await response.json()
      setCodes(prev => prev.map(code => 
        code.id === codeId ? { ...code, isActive: updatedCode.isActive } : code
      ))
    } catch (error) {
      console.error('Error toggling code status:', error)
      setError(error instanceof Error ? error.message : '상태 변경 중 오류가 발생했습니다.')
    }
  }

  // 코드 삭제
  const deleteCode = async (codeId: string) => {
    if (!confirm('정말로 이 코드를 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/hospital-codes/${codeId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('코드 삭제에 실패했습니다.')
      }

      setCodes(prev => prev.filter(code => code.id !== codeId))
    } catch (error) {
      console.error('Error deleting code:', error)
      setError(error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다.')
    }
  }

  // 필터링된 코드 목록
  const filteredCodes = codes.filter(code => {
    const matchesSearch = code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (code.name || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'active' && code.isActive) ||
                         (filterStatus === 'inactive' && !code.isActive)

    return matchesSearch && matchesFilter
  })

  // 통계 계산
  const stats = {
    total: codes.length,
    active: codes.filter(code => code.isActive).length,
    inactive: codes.filter(code => !code.isActive).length,
    totalUsage: codes.reduce((sum, code) => sum + code.currentUses, 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">코드 목록을 불러오는 중...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">병원 가입 코드 관리</h1>
          <p className="text-gray-600 mt-1">환자들이 사용할 수 있는 가입 코드를 생성하고 관리하세요.</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          새 코드 생성
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">전체 코드</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">활성 코드</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">비활성 코드</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">총 사용 횟수</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsage}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="코드 또는 이름으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">전체</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </select>
          </div>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">오류 발생</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <Button
                  onClick={() => setError(null)}
                  className="bg-red-100 text-red-800 hover:bg-red-200"
                >
                  닫기
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 코드 목록 테이블 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  코드
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이름
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  사용 현황
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  만료일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  생성일
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCodes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || filterStatus !== 'all' 
                      ? '검색 조건에 맞는 코드가 없습니다.' 
                      : '생성된 코드가 없습니다. 새 코드를 생성해보세요.'
                    }
                  </td>
                </tr>
              ) : (
                filteredCodes.map((code) => (
                  <tr key={code.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono font-medium text-gray-900">
                        {code.code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {code.name || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        code.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {code.isActive ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {code.currentUses} / {code.maxUses || '무제한'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {code.expiresAt 
                        ? new Date(code.expiresAt).toLocaleDateString('ko-KR')
                        : '무기한'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(code.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          onClick={() => toggleCodeStatus(code.id, code.isActive)}
                          className={`text-xs px-3 py-1 ${
                            code.isActive
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {code.isActive ? '비활성화' : '활성화'}
                        </Button>
                        <Button
                          onClick={() => deleteCode(code.id)}
                          className="text-xs px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          삭제
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 코드 생성 모달 */}
      <HospitalCodeForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={handleCodeCreated}
      />
    </div>
  )
}

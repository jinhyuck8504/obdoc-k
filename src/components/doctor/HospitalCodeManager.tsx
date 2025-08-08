'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, Eye, EyeOff, Trash2, Users, Calendar, AlertCircle, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import HospitalCodeForm from './HospitalCodeForm'
import { HospitalCode } from '@/types/hospitalCode'

interface HospitalCodeManagerProps {
  className?: string
}

export default function HospitalCodeManager({ className = '' }: HospitalCodeManagerProps) {
  const [codes, setCodes] = useState<HospitalCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedCode, setSelectedCode] = useState<HospitalCode | null>(null)
  const [showUsageModal, setShowUsageModal] = useState(false)

  // 코드 목록 조회
  const fetchCodes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/hospital-codes')
      
      if (!response.ok) {
        throw new Error('코드 목록을 불러오는데 실패했습니다')
      }

      const data = await response.json()
      setCodes(data.codes || [])
    } catch (err) {
      console.error('Error fetching hospital codes:', err)
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchCodes()
  }, [])

  // 코드 상태 토글
  const handleToggleStatus = async (codeId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/hospital-codes/${codeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error('코드 상태 변경에 실패했습니다')
      }

      // 로컬 상태 업데이트
      setCodes(prevCodes =>
        prevCodes.map(code =>
          code.id === codeId
            ? { ...code, is_active: !currentStatus, updated_at: new Date().toISOString() }
            : code
        )
      )
    } catch (err) {
      console.error('Error toggling code status:', err)
      alert(err instanceof Error ? err.message : '상태 변경에 실패했습니다')
    }
  }

  // 코드 삭제
  const handleDeleteCode = async (codeId: string) => {
    if (!confirm('정말로 이 코드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return
    }

    try {
      const response = await fetch(`/api/hospital-codes/${codeId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('코드 삭제에 실패했습니다')
      }

      // 로컬 상태에서 제거
      setCodes(prevCodes => prevCodes.filter(code => code.id !== codeId))
    } catch (err) {
      console.error('Error deleting code:', err)
      alert(err instanceof Error ? err.message : '코드 삭제에 실패했습니다')
    }
  }

  // 사용 현황 보기
  const handleViewUsage = async (code: HospitalCode) => {
    setSelectedCode(code)
    setShowUsageModal(true)
  }

  // 코드 생성 성공 핸들러
  const handleCodeCreated = (newCode: HospitalCode) => {
    setCodes(prevCodes => [newCode, ...prevCodes])
    setShowCreateForm(false)
  }

  // 필터링된 코드 목록
  const filteredCodes = codes.filter(code => {
    const matchesSearch = code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         code.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'active' && code.is_active) ||
                         (filterStatus === 'inactive' && !code.is_active)
    
    return matchesSearch && matchesFilter
  })

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <Card className="p-6">
          <div className="flex items-center space-x-3 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <div>
              <h3 className="font-medium">오류가 발생했습니다</h3>
              <p className="text-sm text-red-500 mt-1">{error}</p>
            </div>
          </div>
          <Button
            onClick={fetchCodes}
            className="mt-4"
            variant="outline"
          >
            다시 시도
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">병원 가입 코드 관리</h1>
          <p className="text-gray-600 mt-1">고객이 회원가입할 때 사용할 코드를 생성하고 관리하세요</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          새 코드 생성
        </Button>
      </div>

      {/* 검색 및 필터 */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="코드 또는 이름으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">전체</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 코드 목록 */}
      {filteredCodes.length === 0 ? (
        <EmptyState
          icon={<Plus className="h-12 w-12" />}
          title={codes.length === 0 ? "아직 생성된 코드가 없습니다" : "검색 결과가 없습니다"}
          description={codes.length === 0 ? "첫 번째 병원 가입 코드를 생성해보세요" : "다른 검색어나 필터를 시도해보세요"}
          action={codes.length === 0 ? (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              코드 생성하기
            </Button>
          ) : undefined}
        />
      ) : (
        <div className="grid gap-4">
          {filteredCodes.map((code) => (
            <Card key={code.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl font-mono font-bold text-blue-600">
                      {code.code}
                    </span>
                    <Badge variant={code.is_active ? 'success' : 'secondary'}>
                      {code.is_active ? '활성' : '비활성'}
                    </Badge>
                    {code.expires_at && new Date(code.expires_at) < new Date() && (
                      <Badge variant="danger">만료됨</Badge>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {code.name}
                  </h3>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>사용 {code.usage_count}회</span>
                      {code.max_usage && (
                        <span>/ {code.max_usage}회</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>생성일: {formatDate(code.created_at)}</span>
                    </div>
                    {code.expires_at && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>만료일: {formatDate(code.expires_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewUsage(code)}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    사용 현황
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(code.id, code.is_active)}
                  >
                    {code.is_active ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        비활성화
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        활성화
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCode(code.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 코드 생성 모달 */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <HospitalCodeForm
              onSuccess={handleCodeCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {/* 사용 현황 모달 */}
      {showUsageModal && selectedCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">코드 사용 현황</h2>
                <button
                  onClick={() => setShowUsageModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-xl font-mono font-bold text-blue-600">
                    {selectedCode.code}
                  </span>
                  <Badge variant={selectedCode.is_active ? 'success' : 'secondary'}>
                    {selectedCode.is_active ? '활성' : '비활성'}
                  </Badge>
                </div>
                <p className="text-gray-600">{selectedCode.name}</p>
              </div>

              <div className="text-center py-8">
                <p className="text-gray-500">사용 현황 데이터를 불러오는 중...</p>
                <p className="text-sm text-gray-400 mt-2">
                  이 기능은 추후 구현될 예정입니다
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  Bell, 
  Search,
  Plus,
  TrendingUp,
  Clock,
  UserCheck,
  Key
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import TodayTasks from './widgets/TodayTasks'
import Calendar as CalendarWidget from './widgets/Calendar'
import QuickSearch from './widgets/QuickSearch'

interface DashboardStats {
  totalPatients: number
  todayAppointments: number
  pendingReports: number
  activeCodes: number
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: string
}

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [stats] = useState<DashboardStats>({
    totalPatients: 127,
    todayAppointments: 8,
    pendingReports: 3,
    activeCodes: 5
  })

  const quickActions: QuickAction[] = [
    {
      id: 'new-appointment',
      title: '새 예약 등록',
      description: '환자 예약을 등록하세요',
      icon: <Calendar className="h-5 w-5" />,
      href: '/dashboard/doctor/appointments/new',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'add-patient',
      title: '환자 추가',
      description: '새 환자를 등록하세요',
      icon: <UserCheck className="h-5 w-5" />,
      href: '/dashboard/doctor/patients/new',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'hospital-codes',
      title: '가입 코드 관리',
      description: '병원 가입 코드를 생성하고 관리하세요',
      icon: <Key className="h-5 w-5" />,
      href: '/dashboard/doctor/hospital-codes',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'create-report',
      title: '진료 기록 작성',
      description: '환자 진료 기록을 작성하세요',
      icon: <FileText className="h-5 w-5" />,
      href: '/dashboard/doctor/reports/new',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'appointment',
      message: '김민수 환자의 예약이 확정되었습니다',
      time: '10분 전',
      status: 'success'
    },
    {
      id: 2,
      type: 'report',
      message: '이영희 환자의 진료 기록이 업데이트되었습니다',
      time: '1시간 전',
      status: 'info'
    },
    {
      id: 3,
      type: 'code',
      message: '새로운 병원 가입 코드 "VIP123"이 생성되었습니다',
      time: '2시간 전',
      status: 'success'
    },
    {
      id: 4,
      type: 'patient',
      message: '박철수 환자가 새로 등록되었습니다',
      time: '3시간 전',
      status: 'info'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                안녕하세요, {user?.email?.split('@')[0]}님
              </h1>
              <p className="text-gray-600 mt-1">
                오늘도 환자들을 위한 최고의 진료를 제공해보세요
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                알림
                <Badge variant="danger" className="ml-2">3</Badge>
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                설정
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 환자 수</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">오늘 예약</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">대기 중인 기록</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingReports}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Key className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">활성 가입 코드</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCodes}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* 빠른 작업 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Card key={action.id} className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                <a href={action.href} className="block">
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-lg text-white ${action.color}`}>
                      {action.icon}
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </a>
              </Card>
            ))}
          </div>
        </div>

        {/* 메인 콘텐츠 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽 컬럼 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 오늘의 할 일 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">오늘의 할 일</h2>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  추가
                </Button>
              </div>
              <TodayTasks />
            </Card>

            {/* 최근 활동 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">최근 활동</h2>
                <Button size="sm" variant="outline">
                  전체 보기
                </Button>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-1 rounded-full ${
                      activity.status === 'success' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* 오른쪽 컬럼 */}
          <div className="space-y-8">
            {/* 빠른 검색 */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 검색</h2>
              <QuickSearch />
            </Card>

            {/* 캘린더 */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">캘린더</h2>
              <CalendarWidget />
            </Card>

            {/* 이번 주 통계 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">이번 주 통계</h2>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">완료된 진료</span>
                  <span className="text-sm font-medium text-gray-900">24건</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">신규 환자</span>
                  <span className="text-sm font-medium text-gray-900">7명</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">생성된 코드</span>
                  <span className="text-sm font-medium text-gray-900">3개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">평균 진료 시간</span>
                  <span className="text-sm font-medium text-gray-900">25분</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

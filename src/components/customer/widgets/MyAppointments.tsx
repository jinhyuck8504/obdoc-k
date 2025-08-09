'use client'

import React, { useState } from 'react'
import { Appointment } from '@/types/appointment'

interface MyAppointmentsProps {
  appointments: Appointment[]
  onRequestAppointment?: () => void
}

export default function MyAppointments({ appointments, onRequestAppointment }: MyAppointmentsProps) {
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past'>('upcoming')

  const now = new Date()
  const upcomingAppointments = appointments.filter(apt => {
    const appointmentDateTime = new Date(`${apt.date}T${apt.time}`)
    return appointmentDateTime >= now && apt.status !== 'cancelled'
  })

  const pastAppointments = appointments.filter(apt => {
    const appointmentDateTime = new Date(`${apt.date}T${apt.time}`)
    return appointmentDateTime < now || apt.status === 'completed'
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '예약됨'
      case 'confirmed':
        return '확정됨'
      case 'completed':
        return '완료됨'
      case 'cancelled':
        return '취소됨'
      default:
        return '알 수 없음'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="text-green-600">✅</span>
      case 'cancelled':
        return <span className="text-red-600">❌</span>
      case 'confirmed':
        return <span className="text-blue-600">✅</span>
      default:
        return <span className="text-yellow-600">⚠️</span>
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'initial':
        return '초기 상담'
      case 'consultation':
        return '일반 상담'
      case 'follow_up':
        return '추적 관찰'
      case 'emergency':
        return '응급'
      default:
        return '일반 상담'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    })
  }

  const formatTime = (time: string) => {
    return time
  }

  const isToday = (dateString: string) => {
    const today = new Date().toDateString()
    const appointmentDate = new Date(dateString).toDateString()
    return today === appointmentDate
  }

  const getTimeUntilAppointment = (date: string, time: string) => {
    const appointmentDateTime = new Date(`${date}T${time}`)
    const diffMs = appointmentDateTime.getTime() - now.getTime()

    if (diffMs < 0) return null

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours < 1) {
      return `${diffMinutes}분 후`
    } else if (diffHours < 24) {
      return `${diffHours}시간 후`
    } else {
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays}일 후`
    }
  }

  const displayAppointments = selectedTab === 'upcoming' ? upcomingAppointments : pastAppointments

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">내 예약</h2>
        {onRequestAppointment && (
          <button
            onClick={onRequestAppointment}
            className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <span className="mr-1">➕</span>
            예약 요청
          </button>
        )}
      </div>

      {/* 탭 */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setSelectedTab('upcoming')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${selectedTab === 'upcoming'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          예정된 예약 ({upcomingAppointments.length})
        </button>
        <button
          onClick={() => setSelectedTab('past')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${selectedTab === 'past'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          지난 예약 ({pastAppointments.length})
        </button>
      </div>

      {/* 예약 목록 */}
      {displayAppointments.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">📅</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {selectedTab === 'upcoming' ? '예정된 예약이 없습니다' : '지난 예약이 없습니다'}
          </h3>
          <p className="text-gray-600 mb-6">
            {selectedTab === 'upcoming'
              ? '새로운 예약을 요청해보세요'
              : '아직 완료된 예약이 없습니다'
            }
          </p>
          {selectedTab === 'upcoming' && onRequestAppointment && (
            <button
              onClick={onRequestAppointment}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <span className="mr-2">➕</span>
              예약 요청하기
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayAppointments.map((appointment) => {
            const appointmentToday = isToday(appointment.date)
            const timeUntil = selectedTab === 'upcoming' ? getTimeUntilAppointment(appointment.date, appointment.time) : null

            return (
              <div
                key={appointment.id}
                className={`p-4 rounded-lg border transition-all hover:shadow-sm ${appointmentToday ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">📅</span>
                        <span className={`font-medium ${appointmentToday ? 'text-blue-700' : 'text-gray-900'}`}>
                          {formatDate(appointment.date)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">🕐</span>
                        <span className="text-gray-700">
                          {formatTime(appointment.time)} ({appointment.duration}분)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 mb-3">
                      <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                        {getTypeText(appointment.type)}
                      </span>

                      <div className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        <span>{getStatusText(appointment.status)}</span>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="text-sm text-gray-600 bg-white p-2 rounded border mt-2">
                        <strong>메모:</strong> {appointment.notes}
                      </div>
                    )}

                    {timeUntil && (
                      <div className="mt-3 inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        <span className="mr-1">🕐</span>
                        {timeUntil}
                      </div>
                    )}
                  </div>

                  {/* 의사 정보 (간단히) */}
                  <div className="text-right">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>👨‍⚕️</span>
                      <span>담당의</span>
                    </div>
                  </div>
                </div>

                {/* 예약 액션 (예정된 예약만) */}
                {selectedTab === 'upcoming' && appointment.status === 'scheduled' && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        예약 확정을 기다리고 있습니다
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-sm text-red-600 hover:text-red-800 transition-colors">
                          취소 요청
                        </button>
                        <span className="text-gray-300">|</span>
                        <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                          변경 요청
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 완료된 예약 피드백 */}
                {selectedTab === 'past' && appointment.status === 'completed' && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-green-600">
                        ✓ 완료된 예약
                      </div>
                      <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                        후기 작성
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* 다음 예약 안내 */}
      {selectedTab === 'upcoming' && upcomingAppointments.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">⚠️</span>
            <div>
              <p className="text-sm font-medium text-blue-800">
                다음 예약: {formatDate(upcomingAppointments[0].date)} {formatTime(upcomingAppointments[0].time)}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                예약 시간 30분 전에 SMS로 알림을 보내드립니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useEffect, useCallback, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AlertTriangle, Clock, Shield } from 'lucide-react'

interface SessionManagerProps {
  children: React.ReactNode
  warningTime?: number // 경고 시간 (분)
  sessionTimeout?: number // 세션 타임아웃 (분)
}

export default function SessionManager({ 
  children, 
  warningTime = 5, 
  sessionTimeout = 30 
}: SessionManagerProps) {
  const { user, signOut } = useAuth()
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  const [lastActivity, setLastActivity] = useState(Date.now())

  // 경고 표시 함수
  const showWarning = useCallback(() => {
    setShowWarningModal(true)
    setRemainingTime(warningTime * 60) // 분을 초로 변환
  }, [warningTime])

  // 자동 로그아웃 처리
  const handleAutoLogout = useCallback(async () => {
    setShowWarningModal(false)
    await signOut()
    // 로그아웃 후 로그인 페이지로 리다이렉트
    window.location.href = '/login?reason=session_expired'
  }, [signOut])

  // 활동 감지 및 세션 타이머 관리
  useEffect(() => {
    if (!user) return

    let warningTimer: NodeJS.Timeout
    let logoutTimer: NodeJS.Timeout

    const resetTimers = () => {
      clearTimeout(warningTimer)
      clearTimeout(logoutTimer)
      setLastActivity(Date.now())
      setShowWarningModal(false)

      // 경고 타이머 설정
      warningTimer = setTimeout(() => {
        showWarning()
      }, (sessionTimeout - warningTime) * 60 * 1000)

      // 로그아웃 타이머 설정
      logoutTimer = setTimeout(() => {
        handleAutoLogout()
      }, sessionTimeout * 60 * 1000)
    }

    // 사용자 활동 감지 이벤트
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    const handleActivity = () => {
      resetTimers()
    }

    // 이벤트 리스너 등록
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    // 초기 타이머 설정
    resetTimers()

    return () => {
      clearTimeout(warningTimer)
      clearTimeout(logoutTimer)
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [user, sessionTimeout, warningTime, showWarning, handleAutoLogout])

  // 세션 연장
  const extendSession = useCallback(async () => {
    setShowWarningModal(false)
    setLastActivity(Date.now())
    
    // 서버에 세션 연장 요청 (선택사항)
    try {
      // await refreshSession()
      console.log('세션이 연장되었습니다')
    } catch (error) {
      console.error('세션 연장 실패:', error)
    }
  }, [])

  // 경고 모달의 카운트다운 타이머
  useEffect(() => {
    if (!showWarningModal) return

    const countdownTimer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer)
          handleAutoLogout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(countdownTimer)
  }, [showWarningModal, handleAutoLogout])

  // 시간 포맷팅
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <>
      {children}
      
      {/* 세션 만료 경고 모달 */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  세션 만료 경고
                </h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                보안을 위해 비활성 상태가 지속되어 세션이 곧 만료됩니다.
                계속 사용하시려면 세션을 연장해주세요.
              </p>
              
              <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                <Clock className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-lg font-mono font-bold text-red-600">
                  {formatTime(remainingTime)}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={extendSession}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                세션 연장
              </button>
              <button
                onClick={handleAutoLogout}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 세션 상태 표시 (개발 모드에서만) */}
      {process.env.NODE_ENV === 'development' && user && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-xs">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-green-500" />
            <div>
              <div className="font-medium">세션 활성</div>
              <div className="text-gray-500">
                마지막 활동: {new Date(lastActivity).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// 세션 상태 훅
export function useSessionStatus() {
  const { user } = useAuth()
  const [isActive, setIsActive] = useState(true)
  const [lastActivity, setLastActivity] = useState(Date.now())

  useEffect(() => {
    if (!user) return

    const handleActivity = () => {
      setLastActivity(Date.now())
      setIsActive(true)
    }

    const checkInactivity = () => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivity
      const inactiveThreshold = 5 * 60 * 1000 // 5분

      if (timeSinceLastActivity > inactiveThreshold) {
        setIsActive(false)
      }
    }

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity)
    })

    const inactivityTimer = setInterval(checkInactivity, 60000) // 1분마다 체크

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      clearInterval(inactivityTimer)
    }
  }, [user, lastActivity])

  return {
    isActive,
    lastActivity: new Date(lastActivity)
  }
}

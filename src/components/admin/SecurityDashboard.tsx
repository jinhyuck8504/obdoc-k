'use client'

import React, { useState, useEffect } from 'react'
import { Shield, AlertTriangle, Lock, Eye, Activity, Users } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface SecurityMetrics {
  failedLogins: number
  blockedIPs: number
  suspiciousActivity: number
  activeUsers: number
  lastSecurityScan: string
}

export default function SecurityDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    failedLogins: 0,
    blockedIPs: 0,
    suspiciousActivity: 0,
    activeUsers: 0,
    lastSecurityScan: new Date().toISOString()
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 더미 데이터로 초기화
    setTimeout(() => {
      setMetrics({
        failedLogins: 12,
        blockedIPs: 3,
        suspiciousActivity: 5,
        activeUsers: 247,
        lastSecurityScan: new Date().toISOString()
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">보안 대시보드</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* 실패한 로그인 */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">실패한 로그인</p>
              <p className="text-2xl font-bold text-red-600">{metrics.failedLogins}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </Card>

        {/* 차단된 IP */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">차단된 IP</p>
              <p className="text-2xl font-bold text-orange-600">{metrics.blockedIPs}</p>
            </div>
            <Lock className="w-8 h-8 text-orange-500" />
          </div>
        </Card>

        {/* 의심스러운 활동 */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">의심스러운 활동</p>
              <p className="text-2xl font-bold text-yellow-600">{metrics.suspiciousActivity}</p>
            </div>
            <Eye className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>

        {/* 활성 사용자 */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">활성 사용자</p>
              <p className="text-2xl font-bold text-green-600">{metrics.activeUsers}</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* 보안 활동 로그 */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">최근 보안 활동</h2>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-700">실패한 로그인 시도 감지</span>
            </div>
            <span className="text-xs text-gray-500">5분 전</span>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-700">IP 주소 차단됨</span>
            </div>
            <span className="text-xs text-gray-500">15분 전</span>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">보안 스캔 완료</span>
            </div>
            <span className="text-xs text-gray-500">1시간 전</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

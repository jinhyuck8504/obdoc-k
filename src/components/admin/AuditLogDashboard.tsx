'use client'
import React from 'react'

export default function AuditLogDashboard() {
  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          감사 로그 대시보드
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">시스템 감사 로그</h2>
          <p className="text-gray-600">
            이 페이지는 시스템 감사 로그를 관리하기 위한 대시보드입니다.
            현재는 간단한 버전으로 구성되어 있습니다.
          </p>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">감사 항목</h3>
            <ul className="text-blue-800 space-y-1">
              <li>• 사용자 로그인/로그아웃 기록</li>
              <li>• 데이터 변경 이력</li>
              <li>• 시스템 접근 기록</li>
              <li>• 보안 이벤트 로그</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

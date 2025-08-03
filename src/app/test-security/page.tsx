'use client'
import React from 'react'

export default function TestSecurityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          보안 테스트 페이지
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">보안 테스트</h2>
          <p className="text-gray-600">
            이 페이지는 보안 기능을 테스트하기 위한 페이지입니다.
            현재는 간단한 버전으로 구성되어 있습니다.
          </p>
          
          <div className="mt-6 p-4 bg-red-50 rounded-lg">
            <h3 className="font-medium text-red-900 mb-2">보안 검사 항목</h3>
            <ul className="text-red-800 space-y-1">
              <li>• XSS 공격 방어</li>
              <li>• CSRF 토큰 검증</li>
              <li>• SQL 인젝션 방어</li>
              <li>• 세션 보안</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

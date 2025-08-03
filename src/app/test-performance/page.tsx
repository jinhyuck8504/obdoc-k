'use client'
import React from 'react'

export default function TestPerformancePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          성능 테스트 페이지
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">성능 테스트</h2>
          <p className="text-gray-600">
            이 페이지는 성능 테스트를 위한 페이지입니다.
            현재는 간단한 버전으로 구성되어 있습니다.
          </p>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">테스트 항목</h3>
            <ul className="text-blue-800 space-y-1">
              <li>• 페이지 로딩 성능</li>
              <li>• 컴포넌트 렌더링 성능</li>
              <li>• 메모리 사용량</li>
              <li>• 네트워크 요청 성능</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

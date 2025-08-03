'use client'
import React from 'react'

export default function TestValidationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          유효성 검사 테스트 페이지
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">유효성 검사 테스트</h2>
          <p className="text-gray-600">
            이 페이지는 유효성 검사를 위한 테스트 페이지입니다.
            현재는 간단한 버전으로 구성되어 있습니다.
          </p>
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">검사 항목</h3>
            <ul className="text-green-800 space-y-1">
              <li>• 이메일 형식 검증</li>
              <li>• 비밀번호 강도 검증</li>
              <li>• 전화번호 형식 검증</li>
              <li>• 필수 필드 검증</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

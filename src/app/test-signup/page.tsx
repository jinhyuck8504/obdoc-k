'use client'
import React from 'react'

export default function TestSignupPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          회원가입 테스트 페이지
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">회원가입 테스트</h2>
          <p className="text-gray-600">
            이 페이지는 회원가입 기능을 테스트하기 위한 페이지입니다.
            현재는 간단한 버전으로 구성되어 있습니다.
          </p>
          
          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-purple-900 mb-2">테스트 기능</h3>
            <ul className="text-purple-800 space-y-1">
              <li>• 회원가입 폼 검증</li>
              <li>• 중복 이메일 확인</li>
              <li>• 비밀번호 확인</li>
              <li>• 약관 동의 확인</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

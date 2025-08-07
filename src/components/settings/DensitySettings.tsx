'use client'

import React from 'react'

export default function DensitySettings() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">밀도 설정</h3>
      </div>
      <div className="p-6 pt-0">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            밀도 설정 기능이 임시적으로 비활성화되었습니다.
          </p>
          <div className="flex space-x-2">
            <button 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 opacity-50 cursor-not-allowed"
              disabled
            >
              컴팩트
            </button>
            <button 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 opacity-50 cursor-not-allowed"
              disabled
            >
              보통
            </button>
            <button 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 opacity-50 cursor-not-allowed"
              disabled
            >
              넓음
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

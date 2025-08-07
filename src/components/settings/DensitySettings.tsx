'use client'

import React from 'react'
import { DensityCard, DensityCardContent, DensityCardHeader, DensityCardTitle } from '@/components/ui/DensityCard'
import { DensityButton } from '@/components/ui/DensityButton'

export default function DensitySettings() {
  return (
    <DensityCard>
      <DensityCardHeader>
        <DensityCardTitle>밀도 설정</DensityCardTitle>
      </DensityCardHeader>
      <DensityCardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            밀도 설정 기능이 임시적으로 비활성화되었습니다.
          </p>
          <div className="flex space-x-2">
            <DensityButton variant="outline" disabled>
              컴팩트
            </DensityButton>
            <DensityButton variant="outline" disabled>
              보통
            </DensityButton>
            <DensityButton variant="outline" disabled>
              넓음
            </DensityButton>
          </div>
        </div>
      </DensityCardContent>
    </DensityCard>
  )
}

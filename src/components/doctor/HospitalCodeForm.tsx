'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, AlertCircle, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { CreateHospitalCodeRequest, HospitalCode } from '@/types/hospitalCode'

const codeFormSchema = z.object({
  name: z.string().min(1, '코드 이름을 입력해주세요').max(100, '코드 이름은 100자 이하여야 합니다'),
  max_usage: z.number().min(1, '최소 1회 이상이어야 합니다').optional(),
  expires_at: z.string().optional(),
})

type CodeFormData = z.infer<typeof codeFormSchema>

interface HospitalCodeFormProps {
  onSuccess: (code: HospitalCode) => void
  onCancel: () => void
}

export default function HospitalCodeForm({ onSuccess, onCancel }: HospitalCodeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMaxUsage, setHasMaxUsage] = useState(false)
  const [hasExpiration, setHasExpiration] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CodeFormData>({
    resolver: zodResolver(codeFormSchema),
  })

  const onSubmit = async (data: CodeFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      // 요청 데이터 준비
      const requestData: CreateHospitalCodeRequest = {
        name: data.name.trim(),
        max_usage: hasMaxUsage ? data.max_usage : undefined,
        expires_at: hasExpiration && data.expires_at ? data.expires_at : undefined,
      }

      const response = await fetch('/api/hospital-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '코드 생성에 실패했습니다')
      }

      if (result.success && result.code) {
        onSuccess(result.code)
      } else {
        throw new Error(result.message || '코드 생성에 실패했습니다')
      }
    } catch (err) {
      console.error('Error creating hospital code:', err)
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 최소 날짜 (오늘)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">새 병원 가입 코드 생성</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-800">오류가 발생했습니다</h4>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 코드 이름 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            코드 이름 <span className="text-red-500">*</span>
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            placeholder="예: 신규 고객용, VIP 고객용"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.name.message}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            코드의 용도를 구분할 수 있는 이름을 입력하세요
          </p>
        </div>

        {/* 사용 횟수 제한 */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              id="hasMaxUsage"
              checked={hasMaxUsage}
              onChange={(e) => {
                setHasMaxUsage(e.target.checked)
                if (!e.target.checked) {
                  setValue('max_usage', undefined)
                }
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="hasMaxUsage" className="text-sm font-medium text-gray-700">
              사용 횟수 제한
            </label>
          </div>
          
          {hasMaxUsage && (
            <div className="ml-6">
              <input
                {...register('max_usage', { valueAsNumber: true })}
                type="number"
                min="1"
                placeholder="최대 사용 횟수"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.max_usage && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.max_usage.message}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                지정한 횟수만큼 사용되면 자동으로 비활성화됩니다
              </p>
            </div>
          )}
          
          {!hasMaxUsage && (
            <p className="ml-6 text-sm text-gray-500">
              무제한으로 사용할 수 있습니다
            </p>
          )}
        </div>

        {/* 만료일 설정 */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              id="hasExpiration"
              checked={hasExpiration}
              onChange={(e) => {
                setHasExpiration(e.target.checked)
                if (!e.target.checked) {
                  setValue('expires_at', undefined)
                }
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="hasExpiration" className="text-sm font-medium text-gray-700">
              만료일 설정
            </label>
          </div>
          
          {hasExpiration && (
            <div className="ml-6">
              <input
                {...register('expires_at')}
                type="date"
                min={today}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.expires_at && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.expires_at.message}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                지정한 날짜 이후에는 사용할 수 없습니다
              </p>
            </div>
          )}
          
          {!hasExpiration && (
            <p className="ml-6 text-sm text-gray-500">
              만료일 없이 계속 사용할 수 있습니다
            </p>
          )}
        </div>

        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <h4 className="font-medium mb-1">코드 생성 안내</h4>
              <ul className="space-y-1 text-blue-600">
                <li>• 8자리 영숫자 코드가 자동으로 생성됩니다 (예: ABC12345)</li>
                <li>• 생성된 코드는 고객에게 전달하여 회원가입 시 사용하게 하세요</li>
                <li>• 언제든지 코드를 활성화/비활성화할 수 있습니다</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                생성 중...
              </div>
            ) : (
              '코드 생성'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

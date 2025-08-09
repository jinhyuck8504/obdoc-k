'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, AlertCircle, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { CreateCodeRequest, HospitalCode } from '@/types/hospitalCode'

const codeFormSchema = z.object({
  name: z.string().min(1, '코드 이름을 입력해주세요').max(100, '코드 이름은 100자 이하여야 합니다'),
  description: z.string().optional(),
  maxUsage: z.number().min(1, '최대 사용 횟수는 1 이상이어야 합니다').max(1000, '최대 사용 횟수는 1000 이하여야 합니다'),
  expiresAt: z.string().optional(),
})

type CodeFormData = z.infer<typeof codeFormSchema>

interface HospitalCodeFormProps {
  onClose: () => void
  onSuccess: (code: HospitalCode) => void
  isOpen: boolean
}

export default function HospitalCodeForm({ onClose, onSuccess, isOpen }: HospitalCodeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CodeFormData>({
    resolver: zodResolver(codeFormSchema),
    defaultValues: {
      maxUsage: 10,
    }
  })

  const onSubmit = async (data: CodeFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const requestData: CreateCodeRequest = {
        name: data.name,
        maxUses: data.maxUsage,
        expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : undefined,
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
        throw new Error(result.message || '코드 생성에 실패했습니다.')
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess(result.code)
        reset()
        setSuccess(false)
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Code creation error:', error)
      setError(error instanceof Error ? error.message : '코드 생성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">코드 생성 완료!</h3>
            <p className="text-sm text-gray-500">새로운 병원 가입 코드가 생성되었습니다.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">새 가입 코드 생성</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">오류 발생</h4>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              코드 이름 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              placeholder="예: 2024년 1월 신규 고객용"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="maxUsage" className="block text-sm font-medium text-gray-700 mb-1">
              최대 사용 횟수 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('maxUsage', { valueAsNumber: true })}
              type="number"
              id="maxUsage"
              min="1"
              max="1000"
              placeholder="10"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.maxUsage && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.maxUsage.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-1">
              만료일 (선택사항)
            </label>
            <input
              {...register('expiresAt')}
              type="datetime-local"
              id="expiresAt"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.expiresAt && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.expiresAt.message}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              설정하지 않으면 무기한 사용 가능합니다.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
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
    </div>
  )
}

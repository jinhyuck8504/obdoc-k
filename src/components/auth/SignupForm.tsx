'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Building, Stethoscope, CheckCircle, AlertCircle, UserPlus, CreditCard } from 'lucide-react'
import { auth } from '@/lib/auth'
import Button from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

const signupSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
  confirmPassword: z.string(),
  role: z.enum(['doctor', 'customer']),
  hospitalName: z.string().optional(),
  hospitalType: z.string().optional(),
  subscriptionPlan: z.enum(['1month', '6months', '12months']).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
})

type SignupFormData = z.infer<typeof signupSchema>

export default function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [signupError, setSignupError] = useState<string | null>(null)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'customer'
    }
  })

  const selectedRole = watch('role')
  const selectedPlan = watch('subscriptionPlan')

  // URL 파라미터에서 플랜 정보 읽기
  useEffect(() => {
    const planParam = searchParams.get('plan')
    if (planParam && ['1month', '6months', '12months'].includes(planParam)) {
      setValue('subscriptionPlan', planParam as '1month' | '6months' | '12months')
    }
  }, [searchParams, setValue])

  // 플랜 정보 가져오기
  const getPlanInfo = (planId: string) => {
    const plans = {
      '1month': { name: '1개월 플랜', price: 199000, duration: '1개월', originalPrice: 199000, discount: 0 },
      '6months': { name: '6개월 플랜', price: 1015000, duration: '6개월', originalPrice: 1194000, discount: 15 },
      '12months': { name: '12개월 플랜', price: 1791000, duration: '12개월', originalPrice: 2388000, discount: 25 }
    }
    return plans[planId as keyof typeof plans]
  }

  const onSubmit = async (data: SignupFormData) => {
    try {
      setSignupError(null)

      // auth.signUp 사용 (개발 모드 지원)
      const { data: authData, error: authError } = await auth.signUp(
        data.email,
        data.password,
        {
          role: data.role,
          hospitalName: data.hospitalName,
          hospitalType: data.hospitalType,
          subscriptionPlan: data.subscriptionPlan
        }
      )

      if (authError) {
        setSignupError(authError.message)
        return
      }

      if (authData?.user) {
        // 개발 모드에서는 더미 데이터로 처리
        if (isDevelopment && isDummySupabase) {
          console.log('개발 모드: 더미 회원가입 완료')
        } else {
          // 실제 환경에서만 의사 프로필 생성
          if (data.role === 'doctor') {
            const { error: doctorError } = await supabase
              .from('doctors')
              .insert({
                user_id: authData.user.id,
                hospital_name: data.hospitalName || '',
                hospital_type: data.hospitalType || 'clinic',
                subscription_status: 'pending',
                subscription_plan: data.subscriptionPlan || '1month',
                is_approved: false
              })

            if (doctorError) {
              console.error('Doctor profile creation error:', doctorError)
              setSignupError('의사 프로필 생성에 실패했습니다.')
              return
            }
          }
        }

        setSignupSuccess(true)

        // 회원가입 후 자동 로그인 시도
        try {
          if (isDevelopment && isDummySupabase) {
            // 개발 모드에서는 바로 성공 처리
            setTimeout(() => {
              if (data.role === 'doctor') {
                router.push('/subscription')
              } else {
                router.push('/dashboard/customer')
              }
            }, 2000)
            return
          } else {
            const { error: loginError } = await supabase.auth.signInWithPassword({
              email: data.email,
              password: data.password,
            })

            if (!loginError) {
              // 자동 로그인 성공 시 역할에 따라 리디렉트
              setTimeout(() => {
                if (data.role === 'doctor') {
                  router.push('/subscription')
                } else {
                  router.push('/dashboard/customer')
                }
              }, 2000)
              return
            }
          }
        } catch (error) {
          console.error('Auto login failed:', error)
        }

        // 자동 로그인 실패 시 로그인 페이지로 이동
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (error) {
      console.error('Signup error:', error)
      setSignupError('회원가입 중 오류가 발생했습니다.')
    }
  }

  if (signupSuccess) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="p-8 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">회원가입 완료!</h3>
          <p className="text-sm text-gray-600 mb-4">
            Obdoc에 오신 것을 환영합니다!
            <br />
            로그인 페이지로 이동합니다...
          </p>
          <div className="animate-pulse">
            <div className="h-2 bg-blue-200 rounded-full">
              <div className="h-2 bg-blue-600 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 개발 환경 체크
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isDummySupabase = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('dummy-project') ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here')

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 개발 모드 안내 */}
      {isDevelopment && isDummySupabase && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">🚀 개발 모드</h4>
          <p className="text-sm text-blue-600">
            더미 회원가입을 사용합니다. 아무 이메일과 6자 이상의 비밀번호로 가입하세요.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {signupError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">회원가입 실패</h4>
              <p className="text-sm text-red-600 mt-1">{signupError}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* 역할 선택 */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              가입 유형
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${selectedRole === 'doctor' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                <input
                  {...register('role')}
                  type="radio"
                  value="doctor"
                  className="sr-only"
                />
                <div className="flex items-center">
                  <Stethoscope className={`h-5 w-5 mr-2 ${selectedRole === 'doctor' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div className="text-sm">
                    <div className={`font-medium ${selectedRole === 'doctor' ? 'text-blue-900' : 'text-gray-900'}`}>
                      의사(한의사)
                    </div>
                  </div>
                </div>
              </label>
              <label className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${selectedRole === 'customer' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                <input
                  {...register('role')}
                  type="radio"
                  value="customer"
                  className="sr-only"
                />
                <div className="flex items-center">
                  <User className={`h-5 w-5 mr-2 ${selectedRole === 'customer' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div className="text-sm">
                    <div className={`font-medium ${selectedRole === 'customer' ? 'text-blue-900' : 'text-gray-900'}`}>
                      고객
                    </div>
                  </div>
                </div>
              </label>
            </div>
            {errors.role && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.role.message}
              </p>
            )}
          </div>

          {/* 이메일 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              이메일 주소
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('email')}
                type="email"
                id="email"
                placeholder="example@obdoc.co.kr"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* 비밀번호 */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="최소 6자 이상"
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호 확인
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                placeholder="비밀번호를 다시 입력하세요"
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* 의사 전용 필드 */}
          {selectedRole === 'doctor' && (
            <div className="space-y-4">
              {/* 병원 정보 */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 flex items-center mb-4">
                  <Building className="h-4 w-4 mr-2" />
                  병원 정보
                </h4>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="hospitalName" className="block text-sm font-medium text-gray-700 mb-2">
                      병원명
                    </label>
                    <input
                      {...register('hospitalName')}
                      type="text"
                      id="hospitalName"
                      placeholder="예: 서울비만클리닉"
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="hospitalType" className="block text-sm font-medium text-gray-700 mb-2">
                      병원 유형
                    </label>
                    <select
                      {...register('hospitalType')}
                      id="hospitalType"
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="clinic">의원</option>
                      <option value="oriental_clinic">한의원</option>
                      <option value="hospital">병원</option>
                    </select>
                  </div>
                </div>
              </div>


            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              가입 중...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <UserPlus className="h-5 w-5 mr-2" />
              회원가입
            </div>
          )}
        </Button>
      </form>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Building, Stethoscope, CheckCircle, AlertCircle, UserPlus, Key } from 'lucide-react'
import { auth } from '@/lib/auth'
import Button from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { recordHospitalCodeUsage } from '@/lib/hospitalCodeService'

// Window 객체 확장
declare global {
  interface Window {
    verifiedHospitalCode?: {
      id: string
      code: string
      name?: string
      is_active: boolean
    }
  }
}

const signupSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
  confirmPassword: z.string(),
  role: z.enum(['doctor', 'customer']),
  hospitalCode: z.string().optional(), // 고객용 병원 가입 코드
  hospitalName: z.string().optional(),
  hospitalType: z.string().optional(),
  subscriptionPlan: z.enum(['1month', '6months', '12months']).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
}).refine((data) => {
  // 고객인 경우 병원 코드 필수
  if (data.role === 'customer' && !data.hospitalCode) {
    return false
  }
  return true
}, {
  message: "병원 가입 코드를 입력해주세요",
  path: ["hospitalCode"],
})

type SignupFormData = z.infer<typeof signupSchema>

export default function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [signupError, setSignupError] = useState<string | null>(null)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [codeVerifying, setCodeVerifying] = useState(false)
  const [codeVerified, setCodeVerified] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'customer'
    }
  })

  const selectedRole = watch('role')
  const hospitalCode = watch('hospitalCode')

  // URL 파라미터에서 플랜 정보 읽기
  useEffect(() => {
    const planParam = searchParams.get('plan')
    if (planParam && ['1month', '6months', '12months'].includes(planParam)) {
      setValue('subscriptionPlan', planParam as '1month' | '6months' | '12months')
    }
  }, [searchParams, setValue])

  // 병원 코드 실시간 검증
  useEffect(() => {
    if (selectedRole === 'customer' && hospitalCode && hospitalCode.length === 8) {
      verifyHospitalCodeRealtime(hospitalCode)
    } else {
      setCodeVerified(false)
      clearErrors('hospitalCode')
      if (window.verifiedHospitalCode) {
        delete window.verifiedHospitalCode
      }
    }
  }, [hospitalCode, selectedRole, clearErrors])

  // 실시간 코드 검증
  const verifyHospitalCodeRealtime = async (code: string) => {
    try {
      setCodeVerifying(true)
      clearErrors('hospitalCode')

      const response = await fetch('/api/hospital-codes/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.toUpperCase() })
      })

      const result = await response.json()

      if (response.ok && result.isValid) {
        setCodeVerified(true)
        window.verifiedHospitalCode = result.code
      } else {
        setCodeVerified(false)
        if (window.verifiedHospitalCode) {
          delete window.verifiedHospitalCode
        }
        
        // 에러 메시지 설정 (사용자에게 즉시 표시하지 않음)
        if (result.error) {
          const errorMessages: Record<string, string> = {
            'INVALID_CODE_FORMAT': '코드는 영문 3자리 + 숫자 5자리 형식이어야 합니다',
            'CODE_NOT_FOUND': '존재하지 않는 코드입니다',
            'CODE_INACTIVE': '비활성화된 코드입니다',
            'CODE_EXPIRED': '만료된 코드입니다',
            'CODE_USAGE_EXCEEDED': '사용 한도를 초과한 코드입니다'
          }
          // 실시간 검증에서는 에러를 표시하지 않고, 제출 시에만 표시
        }
      }
    } catch (error) {
      console.error('Real-time code verification error:', error)
      setCodeVerified(false)
      if (window.verifiedHospitalCode) {
        delete window.verifiedHospitalCode
      }
    } finally {
      setCodeVerifying(false)
    }
  }

  const onSubmit = async (data: SignupFormData) => {
    try {
      setSignupError(null)

      // 고객인 경우 병원 코드 최종 검증
      if (data.role === 'customer' && data.hospitalCode) {
        if (!window.verifiedHospitalCode) {
          setError('hospitalCode', { 
            type: 'manual', 
            message: '유효하지 않은 병원 가입 코드입니다' 
          })
          return
        }
      }

      // auth.signUp 사용
      const { data: authData, error: authError } = await auth.signUp(
        data.email,
        data.password,
        {
          role: data.role,
          hospitalCode: data.hospitalCode,
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
        // 개발 모드 체크
        const isDevelopment = process.env.NODE_ENV === 'development'
        const isDummySupabase = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
          process.env.NEXT_PUBLIC_SUPABASE_URL.includes('dummy-project') ||
          process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here')

        if (isDevelopment && isDummySupabase) {
          console.log('개발 모드: 더미 회원가입 완료')
        } else {
          // 실제 환경에서만 프로필 생성
          if (data.role === 'doctor') {
            try {
              console.log('의사 회원가입 완료, 프로필 생성 시작')

              const userId = authData.user.id
              console.log('사용자 ID:', userId)

              const { data: doctorData, error: doctorError } = await supabase
                .from('doctors')
                .insert({
                  user_id: userId,
                  hospital_name: data.hospitalName || '',
                  hospital_type: data.hospitalType || 'clinic',
                  subscription_status: 'pending',
                  subscription_plan: data.subscriptionPlan || '1month',
                  is_approved: false
                })
                .select()

              if (doctorError) {
                console.error('Doctor profile creation error:', doctorError)
                setSignupError(`의사 프로필 생성에 실패했습니다: ${doctorError.message}`)
                return
              }

              console.log('의사 프로필 생성 완료:', doctorData)

              // 자동 로그인 시도
              const { error: loginError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
              })

              if (loginError) {
                console.error('자동 로그인 실패:', loginError)
              }
            } catch (error) {
              console.error('Unexpected error during doctor profile creation:', error)
              setSignupError('의사 프로필 생성 중 예상치 못한 오류가 발생했습니다.')
              return
            }
          } else if (data.role === 'customer') {
            try {
              // 고객 프로필 생성
              const { data: customerData, error: customerError } = await supabase
                .from('customers')
                .insert({
                  user_id: authData.user.id,
                  hospital_code: data.hospitalCode,
                  name: '', // 나중에 프로필에서 입력
                })
                .select()

              if (customerError) {
                console.error('Customer profile creation error:', customerError)
                setSignupError('고객 프로필 생성에 실패했습니다.')
                return
              }

              // 병원 코드 사용 기록 (검증된 코드가 있는 경우)
              if (window.verifiedHospitalCode && customerData?.[0]) {
                try {
                  const success = await recordHospitalCodeUsage(
                    authData.user.id,
                    window.verifiedHospitalCode.id
                  )
                  
                  if (!success) {
                    console.error('Failed to record hospital code usage')
                  }
                } catch (error) {
                  console.error('Code usage recording error:', error)
                  // 에러가 발생해도 회원가입은 계속 진행
                }
              }

              // 자동 로그인 시도
              const { error: loginError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
              })

              if (loginError) {
                console.error('자동 로그인 실패:', loginError)
              }
            } catch (error) {
              console.error('Unexpected error during customer profile creation:', error)
              setSignupError('고객 프로필 생성 중 예상치 못한 오류가 발생했습니다.')
              return
            }
          }
        }

        setSignupSuccess(true)

        // 회원가입 후 리디렉트
        setTimeout(() => {
          if (data.role === 'doctor') {
            router.push('/subscription')
          } else {
            router.push('/dashboard/customer')
          }
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
            대시보드로 이동합니다...
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

          {/* 고객용 병원 가입 코드 */}
          {selectedRole === 'customer' && (
            <div>
              <label htmlFor="hospitalCode" className="block text-sm font-medium text-gray-700 mb-2">
                병원 가입 코드 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('hospitalCode')}
                  type="text"
                  id="hospitalCode"
                  placeholder="예: ABC12345"
                  maxLength={8}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors uppercase"
                  style={{ textTransform: 'uppercase' }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {codeVerifying && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  )}
                  {!codeVerifying && codeVerified && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {!codeVerifying && hospitalCode && hospitalCode.length === 8 && !codeVerified && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
              {errors.hospitalCode && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.hospitalCode.message}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                💡 병원에서 제공받은 8자리 가입 코드를 입력하세요 (영문 3자리 + 숫자 5자리)
              </p>
            </div>
          )}

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
          disabled={isSubmitting || (selectedRole === 'customer' && hospitalCode && hospitalCode.length === 8 && !codeVerified)}
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

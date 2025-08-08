import { supabase } from './supabase'
import { generateHospitalCode } from './codeGenerator'
import type { HospitalCode, CreateCodeRequest } from '@/types/hospitalCode'

// 병원 코드 생성
export async function createHospitalCode(
  doctorId: string,
  data: CreateCodeRequest
): Promise<HospitalCode> {
  const code = generateHospitalCode()
  
  const { data: newCode, error } = await supabase
    .from('hospital_signup_codes')
    .insert({
      doctor_id: doctorId,
      code,
      name: data.name || '기본 코드',
      max_uses: data.maxUses || null,
      expires_at: data.expiresAt || null
    })
    .select()
    .single()

  if (error) {
    throw new Error(`코드 생성 실패: ${error.message}`)
  }

  return {
    id: newCode.id,
    code: newCode.code,
    name: newCode.name,
    doctorId: newCode.doctor_id,
    maxUses: newCode.max_uses,
    currentUses: newCode.current_uses,
    isActive: newCode.is_active,
    expiresAt: newCode.expires_at,
    createdAt: newCode.created_at,
    updatedAt: newCode.updated_at
  }
}

// 의사의 병원 코드 목록 조회
export async function getDoctorHospitalCodes(doctorId: string): Promise<HospitalCode[]> {
  const { data, error } = await supabase
    .from('hospital_signup_codes')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`코드 목록 조회 실패: ${error.message}`)
  }

  return data.map(code => ({
    id: code.id,
    code: code.code,
    name: code.name,
    doctorId: code.doctor_id,
    maxUses: code.max_uses,
    currentUses: code.current_uses,
    isActive: code.is_active,
    expiresAt: code.expires_at,
    createdAt: code.created_at,
    updatedAt: code.updated_at
  }))
}

// 병원 코드 상태 토글
export async function toggleHospitalCodeStatus(
  codeId: string,
  doctorId: string
): Promise<HospitalCode> {
  // 먼저 현재 상태 조회
  const { data: currentCode, error: fetchError } = await supabase
    .from('hospital_signup_codes')
    .select('is_active')
    .eq('id', codeId)
    .eq('doctor_id', doctorId)
    .single()

  if (fetchError) {
    throw new Error(`코드 조회 실패: ${fetchError.message}`)
  }

  // 상태 토글
  const { data: updatedCode, error: updateError } = await supabase
    .from('hospital_signup_codes')
    .update({ is_active: !currentCode.is_active })
    .eq('id', codeId)
    .eq('doctor_id', doctorId)
    .select()
    .single()

  if (updateError) {
    throw new Error(`코드 상태 업데이트 실패: ${updateError.message}`)
  }

  return {
    id: updatedCode.id,
    code: updatedCode.code,
    name: updatedCode.name,
    doctorId: updatedCode.doctor_id,
    maxUses: updatedCode.max_uses,
    currentUses: updatedCode.current_uses,
    isActive: updatedCode.is_active,
    expiresAt: updatedCode.expires_at,
    createdAt: updatedCode.created_at,
    updatedAt: updatedCode.updated_at
  }
}

// 코드별 고객 목록 조회
export async function getCodeCustomers(codeId: string, doctorId: string) {
  // 먼저 해당 코드가 의사의 것인지 확인
  const { data: codeData, error: codeError } = await supabase
    .from('hospital_signup_codes')
    .select('id')
    .eq('id', codeId)
    .eq('doctor_id', doctorId)
    .single()

  if (codeError) {
    throw new Error(`코드 권한 확인 실패: ${codeError.message}`)
  }

  // 해당 코드를 사용한 고객 목록 조회
  const { data, error } = await supabase
    .from('hospital_signup_code_usage')
    .select(`
      used_at,
      customers!inner(
        id,
        name,
        user_id,
        users!inner(email)
      )
    `)
    .eq('code_id', codeId)
    .order('used_at', { ascending: false })

  if (error) {
    throw new Error(`고객 목록 조회 실패: ${error.message}`)
  }

  return data.map(item => ({
    customerId: item.customers.id,
    customerName: item.customers.name,
    customerEmail: item.customers.users.email,
    usedAt: item.used_at
  }))
}

// 병원 코드 검증
export async function verifyHospitalCode(code: string) {
  const { data, error } = await supabase
    .from('hospital_signup_codes')
    .select(`
      id,
      code,
      name,
      doctor_id,
      max_uses,
      current_uses,
      is_active,
      expires_at,
      doctors!inner(
        hospital_name,
        hospital_type
      )
    `)
    .eq('code', code)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('유효하지 않은 코드입니다.')
    }
    throw new Error(`코드 검증 실패: ${error.message}`)
  }

  // 만료 확인
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    throw new Error('만료된 코드입니다.')
  }

  // 사용 횟수 확인
  if (data.max_uses && data.current_uses >= data.max_uses) {
    throw new Error('사용 횟수가 초과된 코드입니다.')
  }

  return {
    id: data.id,
    code: data.code,
    name: data.name,
    doctorId: data.doctor_id,
    hospitalName: data.doctors.hospital_name,
    hospitalType: data.doctors.hospital_type,
    maxUses: data.max_uses,
    currentUses: data.current_uses,
    expiresAt: data.expires_at
  }
}

// 병원 코드 사용 기록
export async function useHospitalCode(codeId: string, customerId: string) {
  // 트랜잭션으로 처리
  const { error: usageError } = await supabase
    .from('hospital_signup_code_usage')
    .insert({
      code_id: codeId,
      customer_id: customerId
    })

  if (usageError) {
    throw new Error(`코드 사용 기록 실패: ${usageError.message}`)
  }

  // 사용 횟수 증가
  const { error: incrementError } = await supabase
    .rpc('increment_code_usage', { code_id: codeId })

  if (incrementError) {
    throw new Error(`사용 횟수 업데이트 실패: ${incrementError.message}`)
  }
}

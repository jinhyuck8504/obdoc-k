/**
 * 코드 사용 기록
 */
export async function recordCodeUsage(
  codeId: string,
  customerId: string
): Promise<boolean> {
  try {
    // 트랜잭션으로 사용 기록 추가 및 사용 횟수 증가
    const { error: usageError } = await supabase
      .from('hospital_signup_code_usage')
      .insert({
        code_id: codeId,
        customer_id: customerId
      })

    if (usageError) {
      throw new Error(`사용 기록 저장 실패: ${usageError.message}`)
    }

    // 사용 횟수 증가
    const { error: updateError } = await supabase
      .rpc('increment_code_usage', { code_id: codeId })

    if (updateError) {
      console.error('Usage count increment error:', updateError)
      // 사용 기록은 저장되었으므로 에러를 던지지 않음
    }

    return true
  } catch (error) {
    console.error('Record code usage error:', error)
    return false
  }
}

/**
 * 병원 코드 사용 기록 (별칭)
 */
export const recordHospitalCodeUsage = recordCodeUsage

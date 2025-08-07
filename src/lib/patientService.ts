import { supabase } from './supabase'
import { Customer } from '@/types/customer'

/**
 * 환자/고객 서비스 - 프로덕션 최적화 버전
 * 모든 더미 데이터 제거, 실제 데이터베이스 연동만 유지
 */
export const patientService = {
  /**
   * 고객 목록 조회 (실제 데이터베이스에서만)
   */
  async getPatients(): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('고객 목록 조회 실패:', error)
        throw new Error(`고객 목록 조회 실패: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('고객 목록 조회 중 오류:', error)
      // 프로덕션에서는 빈 배열 반환으로 안정성 확보
      return []
    }
  },

  /**
   * 고객 상세 정보 조회
   */
  async getPatient(id: string): Promise<Customer | null> {
    if (!id) {
      console.warn('고객 ID가 제공되지 않았습니다')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // 데이터가 없는 경우
          return null
        }
        console.error('고객 정보 조회 실패:', error)
        throw new Error(`고객 정보 조회 실패: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('고객 정보 조회 중 오류:', error)
      return null
    }
  },

  /**
   * 고객 등록
   */
  async createPatient(patientData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    try {
      // 필수 필드 검증
      if (!patientData.name || !patientData.phone) {
        throw new Error('이름과 전화번호는 필수 입력 항목입니다')
      }

      // 중복 전화번호 확인
      const existingPatient = await this.findPatientByPhone(patientData.phone)
      if (existingPatient) {
        throw new Error('이미 등록된 전화번호입니다')
      }

      const { data, error } = await supabase
        .from('patients')
        .insert([{
          ...patientData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('고객 등록 실패:', error)
        throw new Error(`고객 등록 실패: ${error.message}`)
      }

      console.log('고객 등록 성공:', data.name)
      return data
    } catch (error) {
      console.error('고객 등록 중 오류:', error)
      throw error
    }
  },

  /**
   * 고객 정보 수정
   */
  async updatePatient(id: string, updates: Partial<Customer>): Promise<Customer> {
    if (!id) {
      throw new Error('고객 ID가 필요합니다')
    }

    try {
      // 기존 고객 존재 확인
      const existingPatient = await this.getPatient(id)
      if (!existingPatient) {
        throw new Error('수정할 고객을 찾을 수 없습니다')
      }

      // 전화번호 중복 확인 (다른 고객과)
      if (updates.phone && updates.phone !== existingPatient.phone) {
        const duplicatePatient = await this.findPatientByPhone(updates.phone)
        if (duplicatePatient && duplicatePatient.id !== id) {
          throw new Error('이미 사용 중인 전화번호입니다')
        }
      }

      const { data, error } = await supabase
        .from('patients')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('고객 정보 수정 실패:', error)
        throw new Error(`고객 정보 수정 실패: ${error.message}`)
      }

      console.log('고객 정보 수정 성공:', data.name)
      return data
    } catch (error) {
      console.error('고객 정보 수정 중 오류:', error)
      throw error
    }
  },

  /**
   * 고객 삭제
   */
  async deletePatient(id: string): Promise<void> {
    if (!id) {
      throw new Error('고객 ID가 필요합니다')
    }

    try {
      // 기존 고객 존재 확인
      const existingPatient = await this.getPatient(id)
      if (!existingPatient) {
        throw new Error('삭제할 고객을 찾을 수 없습니다')
      }

      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('고객 삭제 실패:', error)
        throw new Error(`고객 삭제 실패: ${error.message}`)
      }

      console.log('고객 삭제 성공:', existingPatient.name)
    } catch (error) {
      console.error('고객 삭제 중 오류:', error)
      throw error
    }
  },

  /**
   * 고객 검색
   */
  async searchPatients(query: string): Promise<Customer[]> {
    if (!query || query.trim().length === 0) {
      return []
    }

    try {
      const searchTerm = query.trim()
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(50) // 검색 결과 제한

      if (error) {
        console.error('고객 검색 실패:', error)
        throw new Error(`고객 검색 실패: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('고객 검색 중 오류:', error)
      return []
    }
  },

  /**
   * 전화번호로 고객 찾기 (중복 확인용)
   */
  async findPatientByPhone(phone: string): Promise<Customer | null> {
    if (!phone) return null

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('phone', phone)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // 데이터가 없는 경우
        }
        console.error('전화번호 검색 실패:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('전화번호 검색 중 오류:', error)
      return null
    }
  },

  /**
   * 고객 체중 업데이트
   */
  async updatePatientWeight(id: string, weight: number): Promise<Customer> {
    if (!id || !weight || weight <= 0) {
      throw new Error('유효한 고객 ID와 체중이 필요합니다')
    }

    try {
      const customer = await this.getPatient(id)
      if (!customer) {
        throw new Error('고객을 찾을 수 없습니다')
      }

      // 진행률 계산 (안전한 계산)
      let progress = 0
      if (customer.initialWeight && customer.targetWeight && customer.initialWeight !== customer.targetWeight) {
        const weightLoss = customer.initialWeight - weight
        const totalWeightLoss = customer.initialWeight - customer.targetWeight
        progress = Math.min(Math.max((weightLoss / totalWeightLoss) * 100, 0), 100)
      }

      const updates = {
        currentWeight: weight,
        lastWeightUpdate: new Date().toISOString(),
        progress: Math.round(progress * 10) / 10 // 소수점 1자리로 반올림
      }

      return await this.updatePatient(id, updates)
    } catch (error) {
      console.error('체중 업데이트 중 오류:', error)
      throw error
    }
  },

  /**
   * 의사별 고객 목록 조회
   */
  async getPatientsByDoctor(doctorId: string): Promise<Customer[]> {
    if (!doctorId) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('의사별 고객 조회 실패:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('의사별 고객 조회 중 오류:', error)
      return []
    }
  },

  /**
   * 활성 고객 수 조회
   */
  async getActivePatientCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      if (error) {
        console.error('활성 고객 수 조회 실패:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('활성 고객 수 조회 중 오류:', error)
      return 0
    }
  },

  /**
   * 최근 등록된 고객 목록 조회
   */
  async getRecentPatients(limit: number = 5): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('최근 고객 조회 실패:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('최근 고객 조회 중 오류:', error)
      return []
    }
  }
}

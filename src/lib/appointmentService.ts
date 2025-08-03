import { supabase } from './supabase'
import { Appointment, AppointmentFormData, TimeSlot } from '@/types/appointment'

// 개발 환경 체크
const isDevelopment = process.env.NODE_ENV === 'development'
const isDummySupabase = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('dummy-project') ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here')

// 더미 예약 데이터
const dummyAppointments: Appointment[] = [
  {
    id: 'apt-1',
    customerId: 'customer-1',
    doctorId: 'doctor1',
    customerName: '김고객',
    customerPhone: '010-1234-5678',
    date: '2024-01-25',
    time: '09:00',
    duration: 30,
    type: 'consultation',
    status: 'scheduled',
    notes: '정기 상담 예약',
    symptoms: '체중 감량 상담',
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z'
  },
  {
    id: 'apt-2',
    customerId: 'customer-2',
    doctorId: 'doctor1',
    customerName: '이고객',
    customerPhone: '010-9876-5432',
    date: '2024-01-25',
    time: '10:30',
    duration: 45,
    type: 'follow_up',
    status: 'confirmed',
    notes: '혈당 수치 확인',
    symptoms: '당뇨 관리 상담',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-22T14:30:00Z'
  },
  {
    id: 'apt-3',
    customerId: 'customer-3',
    doctorId: 'doctor1',
    customerName: '박회원',
    customerPhone: '010-5555-7777',
    date: '2024-01-24',
    time: '14:00',
    duration: 30,
    type: 'consultation',
    status: 'completed',
    notes: '목표 달성 축하',
    symptoms: '유지 관리 상담',
    diagnosis: '목표 체중 달성',
    treatment: '유지 관리 계획 수립',
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-01-24T15:00:00Z'
  },
  {
    id: 'apt-4',
    customerId: 'customer-4',
    doctorId: 'doctor1',
    customerName: '최사용자',
    customerPhone: '010-3333-4444',
    date: '2024-01-26',
    time: '16:00',
    duration: 60,
    type: 'initial',
    status: 'scheduled',
    notes: '초기 상담',
    symptoms: '체중 감량 시작',
    createdAt: '2024-01-22T09:00:00Z',
    updatedAt: '2024-01-22T09:00:00Z'
  },
  {
    id: 'apt-5',
    customerId: 'customer-1',
    doctorId: 'doctor1',
    customerName: '김고객',
    customerPhone: '010-1234-5678',
    date: '2024-01-23',
    time: '11:00',
    duration: 30,
    type: 'follow_up',
    status: 'cancelled',
    notes: '고객 사정으로 취소',
    symptoms: '정기 검진',
    createdAt: '2024-01-20T12:00:00Z',
    updatedAt: '2024-01-23T08:00:00Z'
  }
]

export const appointmentService = {
  // 예약 목록 조회
  async getAppointments(doctorId?: string, date?: string): Promise<Appointment[]> {
    if (isDevelopment && isDummySupabase) {
      console.log('개발 모드: 더미 예약 데이터 사용')
      let filtered = [...dummyAppointments]
      
      if (doctorId) {
        filtered = filtered.filter(apt => apt.doctorId === doctorId)
      }
      
      if (date) {
        filtered = filtered.filter(apt => apt.date === date)
      }
      
      return filtered.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date)
        if (dateCompare !== 0) return dateCompare
        return a.time.localeCompare(b.time)
      })
    }

    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          customers!inner(name, phone)
        `)
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      if (doctorId) {
        query = query.eq('doctor_id', doctorId)
      }

      if (date) {
        query = query.eq('date', date)
      }

      const { data, error } = await query

      if (error) throw error

      return data?.map((apt: any) => ({
        id: apt.id,
        customerId: apt.customer_id,
        doctorId: apt.doctor_id,
        customerName: apt.customers.name,
        customerPhone: apt.customers.phone,
        date: apt.date,
        time: apt.time,
        duration: apt.duration,
        type: apt.type,
        status: apt.status,
        notes: apt.notes,
        symptoms: apt.symptoms,
        diagnosis: apt.diagnosis,
        treatment: apt.treatment,
        nextAppointment: apt.next_appointment,
        createdAt: apt.created_at,
        updatedAt: apt.updated_at
      })) || []
    } catch (error) {
      console.error('예약 목록 조회 실패:', error)
      throw error
    }
  },

  // 특정 예약 조회
  async getAppointment(id: string): Promise<Appointment | null> {
    if (isDevelopment && isDummySupabase) {
      const appointment = dummyAppointments.find(apt => apt.id === id)
      return appointment || null
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          customers!inner(name, phone)
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      if (!data) return null

      return {
        id: data.id,
        customerId: data.customer_id,
        doctorId: data.doctor_id,
        customerName: data.customers.name,
        customerPhone: data.customers.phone,
        date: data.date,
        time: data.time,
        duration: data.duration,
        type: data.type,
        status: data.status,
        notes: data.notes,
        symptoms: data.symptoms,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        nextAppointment: data.next_appointment,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      console.error('예약 정보 조회 실패:', error)
      return null
    }
  },

  // 예약 생성
  async createAppointment(appointmentData: AppointmentFormData & { doctorId: string }): Promise<Appointment> {
    if (isDevelopment && isDummySupabase) {
      // 고객 정보 가져오기 (customerService에서)
      const customerService = await import('./customerService')
      const customer = await customerService.customerService.getCustomer(appointmentData.customerId)
      
      const newAppointment: Appointment = {
        id: `apt-${Date.now()}`,
        ...appointmentData,
        customerName: customer?.name || '알 수 없음',
        customerPhone: customer?.phone || '',
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      dummyAppointments.push(newAppointment)
      console.log('개발 모드: 예약 생성 완료', newAppointment)
      return newAppointment
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          customer_id: appointmentData.customerId,
          doctor_id: appointmentData.doctorId,
          date: appointmentData.date,
          time: appointmentData.time,
          duration: appointmentData.duration,
          type: appointmentData.type,
          status: 'scheduled',
          notes: appointmentData.notes,
          symptoms: appointmentData.symptoms
        }])
        .select(`
          *,
          customers!inner(name, phone)
        `)
        .single()

      if (error) throw error

      return {
        id: data.id,
        customerId: data.customer_id,
        doctorId: data.doctor_id,
        customerName: data.customers.name,
        customerPhone: data.customers.phone,
        date: data.date,
        time: data.time,
        duration: data.duration,
        type: data.type,
        status: data.status,
        notes: data.notes,
        symptoms: data.symptoms,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        nextAppointment: data.next_appointment,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      console.error('예약 생성 실패:', error)
      throw error
    }
  },

  // 예약 수정
  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    if (isDevelopment && isDummySupabase) {
      const index = dummyAppointments.findIndex(apt => apt.id === id)
      if (index === -1) {
        throw new Error('예약을 찾을 수 없습니다')
      }
      
      dummyAppointments[index] = {
        ...dummyAppointments[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      console.log('개발 모드: 예약 수정 완료', dummyAppointments[index])
      return dummyAppointments[index]
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          customers!inner(name, phone)
        `)
        .single()

      if (error) throw error

      return {
        id: data.id,
        customerId: data.customer_id,
        doctorId: data.doctor_id,
        customerName: data.customers.name,
        customerPhone: data.customers.phone,
        date: data.date,
        time: data.time,
        duration: data.duration,
        type: data.type,
        status: data.status,
        notes: data.notes,
        symptoms: data.symptoms,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        nextAppointment: data.next_appointment,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      console.error('예약 수정 실패:', error)
      throw error
    }
  },

  // 예약 삭제
  async deleteAppointment(id: string): Promise<void> {
    if (isDevelopment && isDummySupabase) {
      const index = dummyAppointments.findIndex(apt => apt.id === id)
      if (index === -1) {
        throw new Error('예약을 찾을 수 없습니다')
      }
      
      dummyAppointments.splice(index, 1)
      console.log('개발 모드: 예약 삭제 완료', id)
      return
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('예약 삭제 실패:', error)
      throw error
    }
  },

  // 특정 날짜의 시간대 조회
  async getTimeSlots(doctorId: string, date: string): Promise<TimeSlot[]> {
    const appointments = await this.getAppointments(doctorId, date)
    
    // 9:00 ~ 18:00, 30분 간격으로 시간대 생성
    const timeSlots: TimeSlot[] = []
    const startHour = 9
    const endHour = 18
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const appointment = appointments.find(apt => 
          apt.time === time && apt.status !== 'cancelled'
        )
        
        timeSlots.push({
          time,
          available: !appointment,
          appointmentId: appointment?.id
        })
      }
    }
    
    return timeSlots
  },

  // 예약 검색
  async searchAppointments(query: string, doctorId?: string): Promise<Appointment[]> {
    if (isDevelopment && isDummySupabase) {
      let filtered = [...dummyAppointments]
      
      if (doctorId) {
        filtered = filtered.filter(apt => apt.doctorId === doctorId)
      }
      
      if (query) {
        filtered = filtered.filter(apt =>
          apt.customerName.toLowerCase().includes(query.toLowerCase()) ||
          apt.customerPhone.includes(query) ||
          apt.symptoms?.toLowerCase().includes(query.toLowerCase()) ||
          apt.notes?.toLowerCase().includes(query.toLowerCase())
        )
      }
      
      return filtered
    }

    try {
      let queryBuilder = supabase
        .from('appointments')
        .select(`
          *,
          customers!inner(name, phone)
        `)

      if (doctorId) {
        queryBuilder = queryBuilder.eq('doctor_id', doctorId)
      }

      if (query) {
        queryBuilder = queryBuilder.or(`
          customers.name.ilike.%${query}%,
          customers.phone.ilike.%${query}%,
          symptoms.ilike.%${query}%,
          notes.ilike.%${query}%
        `)
      }

      const { data, error } = await queryBuilder
        .order('date', { ascending: false })
        .order('time', { ascending: true })

      if (error) throw error

      return data?.map((apt: any) => ({
        id: apt.id,
        customerId: apt.customer_id,
        doctorId: apt.doctor_id,
        customerName: apt.customers.name,
        customerPhone: apt.customers.phone,
        date: apt.date,
        time: apt.time,
        duration: apt.duration,
        type: apt.type,
        status: apt.status,
        notes: apt.notes,
        symptoms: apt.symptoms,
        diagnosis: apt.diagnosis,
        treatment: apt.treatment,
        nextAppointment: apt.next_appointment,
        createdAt: apt.created_at,
        updatedAt: apt.updated_at
      })) || []
    } catch (error) {
      console.error('예약 검색 실패:', error)
      throw error
    }
  }
}
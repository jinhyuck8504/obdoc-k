/**
 * Dashboard Data Synchronization Service
 * 대시보드 위젯 간 데이터 동기화를 관리합니다.
 */

export interface PatientData {
  id: string
  name: string
  phone: string
  email?: string
  lastVisit?: string
  status: 'active' | 'inactive'
  notes?: string
}

export interface AppointmentData {
  id: string
  patientId: string
  patientName: string
  date: string
  time: string
  type: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

export interface TaskData {
  id: string
  title: string
  time: string
  patientId?: string
  patientName?: string
  type?: string
  status: 'pending' | 'completed' | 'urgent'
}

export interface DashboardData {
  patients: PatientData[]
  appointments: AppointmentData[]
  tasks: TaskData[]
  lastUpdated: Date
}

type DataChangeListener = (data: DashboardData) => void

class DashboardDataService {
  private static instance: DashboardDataService
  private data: DashboardData = {
    patients: [],
    appointments: [],
    tasks: [],
    lastUpdated: new Date()
  }
  private listeners: Set<DataChangeListener> = new Set()
  private updateTimeout: NodeJS.Timeout | null = null

  static getInstance(): DashboardDataService {
    if (!DashboardDataService.instance) {
      DashboardDataService.instance = new DashboardDataService()
    }
    return DashboardDataService.instance
  }

  /**
   * 데이터 변경 리스너 등록
   */
  subscribe(listener: DataChangeListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * 현재 데이터 반환
   */
  getData(): DashboardData {
    return { ...this.data }
  }

  /**
   * 환자 데이터 업데이트
   */
  updatePatients(patients: PatientData[]): void {
    this.data.patients = patients
    this.data.lastUpdated = new Date()
    this.notifyListeners()
  }

  /**
   * 예약 데이터 업데이트
   */
  updateAppointments(appointments: AppointmentData[]): void {
    this.data.appointments = appointments
    this.data.lastUpdated = new Date()
    this.notifyListeners()
  }

  /**
   * 작업 데이터 업데이트
   */
  updateTasks(tasks: TaskData[]): void {
    this.data.tasks = tasks
    this.data.lastUpdated = new Date()
    this.notifyListeners()
  }

  /**
   * 특정 환자 정보 업데이트
   */
  updatePatient(patientId: string, updates: Partial<PatientData>): void {
    this.data.patients = this.data.patients.map(patient =>
      patient.id === patientId ? { ...patient, ...updates } : patient
    )
    this.data.lastUpdated = new Date()
    this.notifyListeners()
  }

  /**
   * 환자 검색
   */
  searchPatients(query: string): PatientData[] {
    if (!query.trim()) return this.data.patients

    const searchTerm = query.toLowerCase()
    return this.data.patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm) ||
      patient.phone.includes(searchTerm) ||
      patient.email?.toLowerCase().includes(searchTerm)
    )
  }

  /**
   * 특정 환자의 예약 목록 반환
   */
  getPatientAppointments(patientId: string): AppointmentData[] {
    return this.data.appointments.filter(apt => apt.patientId === patientId)
  }

  /**
   * 오늘 예약 목록 반환
   */
  getTodayAppointments(): AppointmentData[] {
    const today = new Date().toISOString().split('T')[0]
    return this.data.appointments.filter(apt => apt.date === today)
  }

  /**
   * 최근 활동 데이터 반환 (환자 기반)
   */
  getRecentActivity(): Array<{
    type: 'appointment' | 'task'
    patientId: string
    patientName: string
    description: string
    timestamp: string
  }> {
    const activities: Array<{
      type: 'appointment' | 'task'
      patientId: string
      patientName: string
      description: string
      timestamp: string
    }> = []

    // 최근 완료된 예약
    this.data.appointments
      .filter(apt => apt.status === 'completed')
      .slice(0, 5)
      .forEach(apt => {
        activities.push({
          type: 'appointment',
          patientId: apt.patientId,
          patientName: apt.patientName,
          description: `${apt.type} 완료`,
          timestamp: `${apt.date} ${apt.time}`
        })
      })

    // 최근 완료된 작업
    this.data.tasks
      .filter(task => task.status === 'completed' && task.patientId)
      .slice(0, 5)
      .forEach(task => {
        activities.push({
          type: 'task',
          patientId: task.patientId!,
          patientName: task.patientName!,
          description: task.title,
          timestamp: task.time
        })
      })

    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 10)
  }

  /**
   * 실시간 데이터 동기화 (디바운스 적용)
   */
  private notifyListeners(): void {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout)
    }

    this.updateTimeout = setTimeout(() => {
      this.listeners.forEach(listener => listener(this.getData()))
    }, 100) // 100ms 디바운스
  }

  /**
   * 전체 데이터 새로고침
   */
  async refreshAllData(): Promise<void> {
    try {
      // 실제 구현에서는 API 호출
      const [patients, appointments, tasks] = await Promise.all([
        this.fetchPatients(),
        this.fetchAppointments(),
        this.fetchTasks()
      ])

      this.data = {
        patients,
        appointments,
        tasks,
        lastUpdated: new Date()
      }

      this.notifyListeners()
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error)
      throw error
    }
  }

  /**
   * 환자 데이터 가져오기 (API 호출)
   */
  private async fetchPatients(): Promise<PatientData[]> {
    // TODO: 실제 API 호출로 교체
    return [
      {
        id: '1',
        name: '김철수',
        phone: '010-1234-5678',
        email: 'kim@example.com',
        lastVisit: '2024-01-15',
        status: 'active'
      },
      {
        id: '2',
        name: '이영희',
        phone: '010-2345-6789',
        email: 'lee@example.com',
        lastVisit: '2024-01-14',
        status: 'active'
      }
    ]
  }

  /**
   * 예약 데이터 가져오기 (API 호출)
   */
  private async fetchAppointments(): Promise<AppointmentData[]> {
    // TODO: 실제 API 호출로 교체
    return [
      {
        id: '1',
        patientId: '1',
        patientName: '김철수',
        date: '2024-01-15',
        time: '10:00',
        type: '상담',
        status: 'scheduled'
      }
    ]
  }

  /**
   * 작업 데이터 가져오기 (API 호출)
   */
  private async fetchTasks(): Promise<TaskData[]> {
    // TODO: 실제 API 호출로 교체
    return [
      {
        id: '1',
        title: '김철수 고객 상담',
        time: '10:00',
        patientId: '1',
        patientName: '김철수',
        type: '상담',
        status: 'pending'
      }
    ]
  }
}

// 인스턴스 생성 및 export
const dashboardDataServiceInstance = DashboardDataService.getInstance()

export { dashboardDataServiceInstance as dashboardDataService }
export default dashboardDataServiceInstance

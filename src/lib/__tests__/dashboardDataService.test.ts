import { dashboardDataService, PatientData, AppointmentData, TaskData } from '../dashboardDataService'

describe('DashboardDataService', () => {
  beforeEach(() => {
    // 각 테스트 전에 데이터 초기화
    dashboardDataService.updatePatients([])
    dashboardDataService.updateAppointments([])
    dashboardDataService.updateTasks([])
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = dashboardDataService
      const instance2 = dashboardDataService
      expect(instance1).toBe(instance2)
    })
  })

  describe('Patient Data Management', () => {
    const mockPatients: PatientData[] = [
      {
        id: '1',
        name: '김철수',
        phone: '010-1234-5678',
        email: 'kim@test.com',
        status: 'active'
      },
      {
        id: '2', 
        name: '이영희',
        phone: '010-2345-6789',
        status: 'active'
      }
    ]

    it('should update and retrieve patient data', () => {
      dashboardDataService.updatePatients(mockPatients)
      const data = dashboardDataService.getData()
      
      expect(data.patients).toEqual(mockPatients)
      expect(data.patients).toHaveLength(2)
    })

    it('should update individual patient', () => {
      dashboardDataService.updatePatients(mockPatients)
      
      dashboardDataService.updatePatient('1', { 
        name: '김철수 수정',
        email: 'updated@test.com' 
      })
      
      const data = dashboardDataService.getData()
      const updatedPatient = data.patients.find(p => p.id === '1')
      
      expect(updatedPatient?.name).toBe('김철수 수정')
      expect(updatedPatient?.email).toBe('updated@test.com')
      expect(updatedPatient?.phone).toBe('010-1234-5678') // 기존 값 유지
    })

    it('should search patients by name and phone', () => {
      dashboardDataService.updatePatients(mockPatients)
      
      // 이름으로 검색
      const nameResults = dashboardDataService.searchPatients('김철수')
      expect(nameResults).toHaveLength(1)
      expect(nameResults[0].name).toBe('김철수')
      
      // 전화번호로 검색
      const phoneResults = dashboardDataService.searchPatients('010-2345')
      expect(phoneResults).toHaveLength(1)
      expect(phoneResults[0].name).toBe('이영희')
      
      // 빈 검색어
      const emptyResults = dashboardDataService.searchPatients('')
      expect(emptyResults).toEqual(mockPatients)
    })
  })

  describe('Appointment Data Management', () => {
    const mockAppointments: AppointmentData[] = [
      {
        id: '1',
        patientId: '1',
        patientName: '김철수',
        date: '2024-01-15',
        time: '10:00',
        type: '상담',
        status: 'scheduled'
      },
      {
        id: '2',
        patientId: '1', 
        patientName: '김철수',
        date: '2024-01-16',
        time: '14:00',
        type: '진료',
        status: 'completed'
      }
    ]

    it('should update and retrieve appointment data', () => {
      dashboardDataService.updateAppointments(mockAppointments)
      const data = dashboardDataService.getData()
      
      expect(data.appointments).toEqual(mockAppointments)
    })

    it('should get patient appointments', () => {
      dashboardDataService.updateAppointments(mockAppointments)
      
      const patientAppointments = dashboardDataService.getPatientAppointments('1')
      expect(patientAppointments).toHaveLength(2)
      expect(patientAppointments.every(apt => apt.patientId === '1')).toBe(true)
    })

    it('should get today appointments', () => {
      const today = new Date().toISOString().split('T')[0]
      const todayAppointments: AppointmentData[] = [
        {
          id: '3',
          patientId: '2',
          patientName: '이영희',
          date: today,
          time: '09:00',
          type: '상담',
          status: 'scheduled'
        }
      ]
      
      dashboardDataService.updateAppointments([...mockAppointments, ...todayAppointments])
      
      const results = dashboardDataService.getTodayAppointments()
      expect(results).toHaveLength(1)
      expect(results[0].date).toBe(today)
    })
  })

  describe('Task Data Management', () => {
    const mockTasks: TaskData[] = [
      {
        id: '1',
        title: '김철수 상담',
        time: '10:00',
        patientId: '1',
        patientName: '김철수',
        type: '상담',
        status: 'pending'
      },
      {
        id: '2',
        title: '이영희 체중측정',
        time: '14:00',
        patientId: '2',
        patientName: '이영희',
        type: '체중측정',
        status: 'completed'
      }
    ]

    it('should update and retrieve task data', () => {
      dashboardDataService.updateTasks(mockTasks)
      const data = dashboardDataService.getData()
      
      expect(data.tasks).toEqual(mockTasks)
    })
  })

  describe('Recent Activity', () => {
    beforeEach(() => {
      const appointments: AppointmentData[] = [
        {
          id: '1',
          patientId: '1',
          patientName: '김철수',
          date: '2024-01-15',
          time: '10:00',
          type: '상담',
          status: 'completed'
        }
      ]
      
      const tasks: TaskData[] = [
        {
          id: '1',
          title: '이영희 체중측정',
          time: '14:00',
          patientId: '2',
          patientName: '이영희',
          type: '체중측정',
          status: 'completed'
        }
      ]
      
      dashboardDataService.updateAppointments(appointments)
      dashboardDataService.updateTasks(tasks)
    })

    it('should get recent activity', () => {
      const activities = dashboardDataService.getRecentActivity()
      
      expect(activities.length).toBeGreaterThan(0)
      expect(activities[0]).toHaveProperty('type')
      expect(activities[0]).toHaveProperty('patientName')
      expect(activities[0]).toHaveProperty('description')
      expect(activities[0]).toHaveProperty('timestamp')
    })

    it('should include both appointments and tasks in activity', () => {
      const activities = dashboardDataService.getRecentActivity()
      
      const appointmentActivities = activities.filter(a => a.type === 'appointment')
      const taskActivities = activities.filter(a => a.type === 'task')
      
      expect(appointmentActivities.length).toBeGreaterThan(0)
      expect(taskActivities.length).toBeGreaterThan(0)
    })
  })

  describe('Data Subscription', () => {
    it('should notify subscribers on data change', () => {
      const mockListener = jest.fn()
      
      const unsubscribe = dashboardDataService.subscribe(mockListener)
      
      const testPatients: PatientData[] = [
        { id: '1', name: '테스트', phone: '010-0000-0000', status: 'active' }
      ]
      
      dashboardDataService.updatePatients(testPatients)
      
      // 디바운스 때문에 약간의 지연 후 확인
      setTimeout(() => {
        expect(mockListener).toHaveBeenCalled()
        unsubscribe()
      }, 150)
    })

    it('should unsubscribe correctly', () => {
      const mockListener = jest.fn()
      
      const unsubscribe = dashboardDataService.subscribe(mockListener)
      unsubscribe()
      
      dashboardDataService.updatePatients([])
      
      setTimeout(() => {
        expect(mockListener).not.toHaveBeenCalled()
      }, 150)
    })
  })

  describe('Data Timestamps', () => {
    it('should update lastUpdated timestamp on data changes', () => {
      const initialData = dashboardDataService.getData()
      const initialTimestamp = initialData.lastUpdated
      
      // 약간의 지연 후 데이터 업데이트
      setTimeout(() => {
        dashboardDataService.updatePatients([
          { id: '1', name: '테스트', phone: '010-0000-0000', status: 'active' }
        ])
        
        const updatedData = dashboardDataService.getData()
        expect(updatedData.lastUpdated.getTime()).toBeGreaterThan(initialTimestamp.getTime())
      }, 10)
    })
  })
})
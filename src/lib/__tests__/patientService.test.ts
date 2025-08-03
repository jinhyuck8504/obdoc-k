import { 
  getPatients, 
  getPatientById, 
  createPatient, 
  updatePatient, 
  deletePatient,
  addHealthRecord 
} from '../customerService'
import { supabase } from '../supabase'

// Mock Supabase
jest.mock('../supabase')
const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe('Patient Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getPatients', () => {
    it('should fetch patients successfully', async () => {
      const mockPatients = [
        { id: '1', name: '김고객', email: 'patient1@test.com', phone: '010-1234-5678' },
        { id: '2', name: '이고객', email: 'patient2@test.com', phone: '010-2345-6789' }
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: mockPatients,
          error: null
        })
      } as any)

      const result = await getPatients('doctor-id')

      expect(mockSupabase.from).toHaveBeenCalledWith('patients')
      expect(result.data).toEqual(mockPatients)
      expect(result.error).toBeNull()
    })

    it('should handle fetch error', async () => {
      const mockError = { message: 'Database error' }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      } as any)

      const result = await getPatients('doctor-id')

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('getPatientById', () => {
    it('should fetch patient by id successfully', async () => {
      const mockPatient = { 
        id: '1', 
        name: '김고객', 
        email: 'patient@test.com',
        health_records: []
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockPatient,
          error: null
        })
      } as any)

      const result = await getPatientById('1')

      expect(mockSupabase.from).toHaveBeenCalledWith('patients')
      expect(result.data).toEqual(mockPatient)
      expect(result.error).toBeNull()
    })

    it('should handle patient not found', async () => {
      const mockError = { message: 'Patient not found' }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      } as any)

      const result = await getPatientById('999')

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('createPatient', () => {
    it('should create patient successfully', async () => {
      const patientData = {
        name: '새고객',
        email: 'new@test.com',
        phone: '010-9999-9999',
        birth_date: '1990-01-01',
        gender: 'male' as const,
        doctor_id: 'doctor-id'
      }

      const mockCreatedPatient = { id: '3', ...patientData }

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockCreatedPatient,
          error: null
        })
      } as any)

      const result = await createPatient(patientData)

      expect(mockSupabase.from).toHaveBeenCalledWith('patients')
      expect(result.data).toEqual(mockCreatedPatient)
      expect(result.error).toBeNull()
    })

    it('should handle validation errors', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        email: 'invalid-email', // Invalid: bad email format
        phone: '123', // Invalid: bad phone format
        birth_date: '1990-01-01',
        gender: 'male' as const,
        doctor_id: 'doctor-id'
      }

      const result = await createPatient(invalidData)

      expect(result.error).toBeTruthy()
      expect(result.error?.message).toContain('validation')
    })
  })

  describe('updatePatient', () => {
    it('should update patient successfully', async () => {
      const updateData = {
        name: '수정된고객',
        phone: '010-8888-8888'
      }

      const mockUpdatedPatient = { id: '1', ...updateData }

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockUpdatedPatient,
          error: null
        })
      } as any)

      const result = await updatePatient('1', updateData)

      expect(mockSupabase.from).toHaveBeenCalledWith('patients')
      expect(result.data).toEqual(mockUpdatedPatient)
      expect(result.error).toBeNull()
    })
  })

  describe('deletePatient', () => {
    it('should delete patient successfully', async () => {
      mockSupabase.from.mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      } as any)

      const result = await deletePatient('1')

      expect(mockSupabase.from).toHaveBeenCalledWith('patients')
      expect(result.error).toBeNull()
    })

    it('should handle delete error', async () => {
      const mockError = { message: 'Cannot delete patient with active appointments' }

      mockSupabase.from.mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      } as any)

      const result = await deletePatient('1')

      expect(result.error).toEqual(mockError)
    })
  })

  describe('addHealthRecord', () => {
    it('should add health record successfully', async () => {
      const healthData = {
        patient_id: '1',
        weight: 70.5,
        height: 175,
        blood_pressure_systolic: 120,
        blood_pressure_diastolic: 80,
        notes: '정상 범위'
      }

      const mockHealthRecord = { id: 'hr-1', ...healthData, created_at: new Date().toISOString() }

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockHealthRecord,
          error: null
        })
      } as any)

      const result = await addHealthRecord(healthData)

      expect(mockSupabase.from).toHaveBeenCalledWith('health_records')
      expect(result.data).toEqual(mockHealthRecord)
      expect(result.error).toBeNull()
    })

    it('should validate health record data', async () => {
      const invalidData = {
        patient_id: '',
        weight: -10, // Invalid: negative weight
        height: 0, // Invalid: zero height
        blood_pressure_systolic: 300, // Invalid: too high
        blood_pressure_diastolic: -10, // Invalid: negative
        notes: ''
      }

      const result = await addHealthRecord(invalidData)

      expect(result.error).toBeTruthy()
      expect(result.error?.message).toContain('validation')
    })
  })
})
import { customerService } from '../customerService'
import { supabase } from '../supabase'

// Mock Supabase
jest.mock('../supabase')
const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe('Customer Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCustomers', () => {
    it('should fetch customers successfully', async () => {
      const mockCustomers = [
        { id: '1', name: '김고객', email: 'customer1@test.com', phone: '010-1234-5678' },
        { id: '2', name: '이고객', email: 'customer2@test.com', phone: '010-2345-6789' }
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockCustomers,
          error: null
        })
      } as any)

      const result = await customerService.getCustomers()

      expect(mockSupabase.from).toHaveBeenCalledWith('customers')
      expect(result).toEqual(mockCustomers)
    })

    it('should handle fetch error', async () => {
      const mockError = { message: 'Database error' }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      } as any)

      await expect(customerService.getCustomers()).rejects.toThrow()
    })
  })

  describe('getCustomer', () => {
    it('should fetch customer by id successfully', async () => {
      const mockCustomer = { 
        id: '1', 
        name: '김고객', 
        email: 'customer@test.com'
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockCustomer,
          error: null
        })
      } as any)

      const result = await customerService.getCustomer('1')

      expect(mockSupabase.from).toHaveBeenCalledWith('customers')
      expect(result).toEqual(mockCustomer)
    })

    it('should handle customer not found', async () => {
      const mockError = { message: 'Customer not found' }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      } as any)

      const result = await customerService.getCustomer('999')

      expect(result).toBeNull()
    })
  })

  describe('createCustomer', () => {
    it('should create customer successfully', async () => {
      const customerData = {
        name: '새고객',
        email: 'new@test.com',
        phone: '010-9999-9999',
        birthDate: '1990-01-01',
        gender: 'male' as const,
        height: 175,
        initialWeight: 70,
        currentWeight: 70,
        targetWeight: 65,
        address: '서울시 강남구',
        medicalHistory: '없음',
        allergies: '없음',
        medications: '없음',
        status: 'active' as const,
        startDate: '2024-01-01',
        doctorId: 'doctor-id'
      }

      const mockCreatedCustomer = { id: '3', ...customerData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockCreatedCustomer,
          error: null
        })
      } as any)

      const result = await customerService.createCustomer(customerData)

      expect(mockSupabase.from).toHaveBeenCalledWith('customers')
      expect(result).toEqual(mockCreatedCustomer)
    })
  })

  describe('updateCustomer', () => {
    it('should update customer successfully', async () => {
      const updateData = {
        name: '수정된고객',
        phone: '010-8888-8888'
      }

      const mockUpdatedCustomer = { id: '1', ...updateData }

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockUpdatedCustomer,
          error: null
        })
      } as any)

      const result = await customerService.updateCustomer('1', updateData)

      expect(mockSupabase.from).toHaveBeenCalledWith('customers')
      expect(result).toEqual(mockUpdatedCustomer)
    })
  })

  describe('deleteCustomer', () => {
    it('should delete customer successfully', async () => {
      mockSupabase.from.mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      } as any)

      await expect(customerService.deleteCustomer('1')).resolves.not.toThrow()

      expect(mockSupabase.from).toHaveBeenCalledWith('customers')
    })

    it('should handle delete error', async () => {
      const mockError = { message: 'Cannot delete customer with active appointments' }

      mockSupabase.from.mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      } as any)

      await expect(customerService.deleteCustomer('1')).rejects.toThrow()
    })
  })

  describe('searchCustomers', () => {
    it('should search customers successfully', async () => {
      const mockCustomers = [
        { id: '1', name: '김고객', email: 'customer1@test.com', phone: '010-1234-5678' }
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockCustomers,
          error: null
        })
      } as any)

      const result = await customerService.searchCustomers('김고객')

      expect(mockSupabase.from).toHaveBeenCalledWith('customers')
      expect(result).toEqual(mockCustomers)
    })
  })

  describe('updateCustomerWeight', () => {
    it('should update customer weight successfully', async () => {
      const mockCustomer = {
        id: '1',
        name: '김고객',
        initialWeight: 80,
        currentWeight: 75,
        targetWeight: 70
      }

      // Mock getCustomer
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockCustomer,
          error: null
        })
      } as any)

      // Mock updateCustomer
      const mockUpdatedCustomer = { ...mockCustomer, currentWeight: 72 }
      mockSupabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockUpdatedCustomer,
          error: null
        })
      } as any)

      const result = await customerService.updateCustomerWeight('1', 72)

      expect(result.currentWeight).toBe(72)
    })
  })
})
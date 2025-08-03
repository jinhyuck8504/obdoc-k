import { signIn, signUp, signOut, getCurrentUser } from '../auth'
import { supabase } from '../supabase'

// Mock Supabase
jest.mock('../supabase')

const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        user_metadata: { role: 'doctor' }
      }

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null
      } as any)

      const result = await signIn('test@example.com', 'password123')

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(result.user).toEqual(mockUser)
      expect(result.error).toBeNull()
    })

    it('should handle sign in error', async () => {
      const mockError = { message: 'Invalid credentials' }

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      } as any)

      const result = await signIn('test@example.com', 'wrongpassword')

      expect(result.user).toBeNull()
      expect(result.error).toEqual(mockError)
    })

    it('should validate email format', async () => {
      const result = await signIn('invalid-email', 'password123')

      expect(result.error).toEqual({ message: 'Invalid email format' })
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled()
    })

    it('should validate password length', async () => {
      const result = await signIn('test@example.com', '123')

      expect(result.error).toEqual({ message: 'Password must be at least 6 characters' })
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled()
    })
  })

  describe('signUp', () => {
    it('should sign up user successfully', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        user_metadata: { role: 'doctor', name: 'Dr. Test' }
      }

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null
      } as any)

      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Dr. Test',
        role: 'doctor' as const
      }

      const result = await signUp(userData)

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role
          }
        }
      })
      expect(result.user).toEqual(mockUser)
      expect(result.error).toBeNull()
    })

    it('should handle sign up error', async () => {
      const mockError = { message: 'Email already exists' }

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      } as any)

      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Dr. Test',
        role: 'doctor' as const
      }

      const result = await signUp(userData)

      expect(result.user).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null
      } as any)

      const result = await signOut()

      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
      expect(result.error).toBeNull()
    })

    it('should handle sign out error', async () => {
      const mockError = { message: 'Sign out failed' }

      mockSupabase.auth.signOut.mockResolvedValue({
        error: mockError
      } as any)

      const result = await signOut()

      expect(result.error).toEqual(mockError)
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        user_metadata: { role: 'doctor' }
      }

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null
      } as any)

      const result = await getCurrentUser()

      expect(mockSupabase.auth.getSession).toHaveBeenCalled()
      expect(result.user).toEqual(mockUser)
      expect(result.error).toBeNull()
    })

    it('should handle no session', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      } as any)

      const result = await getCurrentUser()

      expect(result.user).toBeNull()
      expect(result.error).toBeNull()
    })
  })
})
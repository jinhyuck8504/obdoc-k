import { hydrationErrorLogger } from '../errorLogger'

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn()
}
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
})

// Mock fetch
global.fetch = jest.fn()

describe('HydrationErrorLogger', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    mockSessionStorage.getItem.mockReturnValue(null)
  })

  describe('logError', () => {
    it('logs error to console in development', () => {
      const consoleSpy = jest.spyOn(console, 'group').mockImplementation()
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation()

      // Mock development environment
      process.env.NODE_ENV = 'development'

      const testError = new Error('Test hydration error')
      hydrationErrorLogger.logError(testError, 'TestComponent', 'user123')

      expect(consoleSpy).toHaveBeenCalledWith('🚨 Hydration Error Log')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', 'Test hydration error')
      expect(consoleGroupEndSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
      consoleErrorSpy.mockRestore()
      consoleGroupEndSpy.mockRestore()
    })

    it('saves error to localStorage when remote logging fails', () => {
      const testError = new Error('Test error')
      
      // Mock existing logs
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([]))
      
      hydrationErrorLogger.logError(testError, 'TestComponent')

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'hydration_error_logs',
        expect.stringContaining('Test error')
      )
    })

    it('limits localStorage to 100 logs', () => {
      const existingLogs = Array.from({ length: 100 }, (_, i) => ({
        timestamp: new Date(),
        component: `Component${i}`,
        error: `Error ${i}`,
        userAgent: 'test',
        url: 'test',
        sessionId: 'test'
      }))

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingLogs))

      const testError = new Error('New error')
      hydrationErrorLogger.logError(testError, 'NewComponent')

      const setItemCall = mockLocalStorage.setItem.mock.calls[0]
      const savedLogs = JSON.parse(setItemCall[1])
      
      expect(savedLogs).toHaveLength(100)
      expect(savedLogs[99].error).toBe('New error')
    })
  })

  describe('getStoredLogs', () => {
    it('returns empty array when no logs exist', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const logs = hydrationErrorLogger.getStoredLogs()
      
      expect(logs).toEqual([])
    })

    it('returns parsed logs from localStorage', () => {
      const testLogs = [
        {
          timestamp: new Date().toISOString(),
          component: 'TestComponent',
          error: 'Test error',
          userAgent: 'test',
          url: 'test',
          sessionId: 'test'
        }
      ]

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testLogs))
      
      const logs = hydrationErrorLogger.getStoredLogs()
      
      expect(logs).toHaveLength(1)
      expect(logs[0].error).toBe('Test error')
    })

    it('handles corrupted localStorage data gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockLocalStorage.getItem.mockReturnValue('invalid json')
      
      const logs = hydrationErrorLogger.getStoredLogs()
      
      expect(logs).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to retrieve stored error logs:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('clearStoredLogs', () => {
    it('removes logs from localStorage', () => {
      hydrationErrorLogger.clearStoredLogs()
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('hydration_error_logs')
    })

    it('handles localStorage errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage error')
      })
      
      hydrationErrorLogger.clearStoredLogs()
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to clear stored error logs:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('session management', () => {
    it('generates new session ID when none exists', () => {
      mockSessionStorage.getItem.mockReturnValue(null)
      
      const testError = new Error('Test error')
      hydrationErrorLogger.logError(testError, 'TestComponent')
      
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'hydration_session_id',
        expect.stringMatching(/^session_\d+_[a-z0-9]+$/)
      )
    })

    it('reuses existing session ID', () => {
      const existingSessionId = 'session_123_abc'
      mockSessionStorage.getItem.mockReturnValue(existingSessionId)
      
      const testError = new Error('Test error')
      hydrationErrorLogger.logError(testError, 'TestComponent')
      
      // Should not create new session ID
      expect(mockSessionStorage.setItem).not.toHaveBeenCalledWith(
        'hydration_session_id',
        expect.any(String)
      )
    })
  })
})
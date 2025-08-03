import { cn, formatDate, formatPhoneNumber, validateEmail, validatePassword } from '../utils'

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional')
    })

    it('should handle undefined and null values', () => {
      expect(cn('base', undefined, null, 'end')).toBe('base end')
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      expect(formatDate(date)).toBe('2024-01-15')
    })

    it('should handle date string input', () => {
      expect(formatDate('2024-01-15')).toBe('2024-01-15')
    })

    it('should handle invalid date', () => {
      expect(formatDate('invalid')).toBe('Invalid Date')
    })
  })

  describe('formatPhoneNumber', () => {
    it('should format Korean phone number correctly', () => {
      expect(formatPhoneNumber('01012345678')).toBe('010-1234-5678')
    })

    it('should handle phone number with dashes', () => {
      expect(formatPhoneNumber('010-1234-5678')).toBe('010-1234-5678')
    })

    it('should handle invalid phone number', () => {
      expect(formatPhoneNumber('123')).toBe('123')
    })

    it('should handle empty string', () => {
      expect(formatPhoneNumber('')).toBe('')
    })
  })

  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name+tag@domain.co.kr')).toBe(true)
    })

    it('should reject invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      expect(validatePassword('StrongPass123!')).toBe(true)
      expect(validatePassword('MyPassword1@')).toBe(true)
    })

    it('should reject weak passwords', () => {
      expect(validatePassword('weak')).toBe(false) // too short
      expect(validatePassword('onlylowercase')).toBe(false) // no uppercase/numbers
      expect(validatePassword('ONLYUPPERCASE')).toBe(false) // no lowercase/numbers
      expect(validatePassword('NoNumbers!')).toBe(false) // no numbers
      expect(validatePassword('nonumbers123')).toBe(false) // no uppercase
    })

    it('should handle empty password', () => {
      expect(validatePassword('')).toBe(false)
    })
  })
})
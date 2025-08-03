import {
  getInitials,
  getAvatarColor,
  normalizeDisplayName,
  getAvatarSizeClasses,
  getProfileImageUrl,
  uploadProfileImage,
  deleteProfileImage
} from '../imageUtils'

describe('imageUtils', () => {
  describe('getInitials', () => {
    it('should return ? for empty or undefined name', () => {
      expect(getInitials()).toBe('?')
      expect(getInitials('')).toBe('?')
      expect(getInitials('   ')).toBe('?')
    })

    it('should return first letter for single name', () => {
      expect(getInitials('홍길동')).toBe('홍')
      expect(getInitials('John')).toBe('J')
    })

    it('should return first and last initials for multiple names', () => {
      expect(getInitials('홍 길동')).toBe('홍동')
      expect(getInitials('John Doe')).toBe('JD')
      expect(getInitials('홍 길 동')).toBe('홍동')
      expect(getInitials('John Michael Doe')).toBe('JD')
    })

    it('should handle extra whitespace', () => {
      expect(getInitials('  홍길동  ')).toBe('홍')
      expect(getInitials('홍   길   동')).toBe('홍동')
      expect(getInitials('  John    Doe  ')).toBe('JD')
    })

    it('should convert to uppercase', () => {
      expect(getInitials('john doe')).toBe('JD')
      expect(getInitials('jane smith')).toBe('JS')
    })
  })

  describe('getAvatarColor', () => {
    it('should return default color for empty name', () => {
      expect(getAvatarColor()).toBe('bg-gray-100 text-gray-600')
      expect(getAvatarColor('')).toBe('bg-gray-100 text-gray-600')
    })

    it('should return consistent color for same name', () => {
      const color1 = getAvatarColor('홍길동')
      const color2 = getAvatarColor('홍길동')
      expect(color1).toBe(color2)
    })

    it('should return different colors for different names', () => {
      const color1 = getAvatarColor('홍길동')
      const color2 = getAvatarColor('김철수')
      expect(color1).not.toBe(color2)
    })

    it('should return valid Tailwind color classes', () => {
      const color = getAvatarColor('테스트')
      expect(color).toMatch(/^bg-\w+-100 text-\w+-700$/)
    })
  })

  describe('normalizeDisplayName', () => {
    it('should return trimmed name when name is provided', () => {
      expect(normalizeDisplayName('  홍길동  ')).toBe('홍길동')
      expect(normalizeDisplayName('John Doe')).toBe('John Doe')
    })

    it('should extract name from email when name is empty', () => {
      expect(normalizeDisplayName('', 'john.doe@example.com')).toBe('John Doe')
      expect(normalizeDisplayName(undefined, 'jane_smith@test.com')).toBe('Jane Smith')
      expect(normalizeDisplayName('', 'user-name@domain.org')).toBe('User Name')
    })

    it('should return default when both name and email are empty', () => {
      expect(normalizeDisplayName()).toBe('사용자')
      expect(normalizeDisplayName('', '')).toBe('사용자')
    })

    it('should prefer name over email', () => {
      expect(normalizeDisplayName('홍길동', 'test@example.com')).toBe('홍길동')
    })
  })

  describe('getAvatarSizeClasses', () => {
    it('should return correct classes for each size', () => {
      expect(getAvatarSizeClasses('xs')).toBe('w-6 h-6 text-xs')
      expect(getAvatarSizeClasses('sm')).toBe('w-8 h-8 text-xs')
      expect(getAvatarSizeClasses('md')).toBe('w-10 h-10 text-sm')
      expect(getAvatarSizeClasses('lg')).toBe('w-12 h-12 text-base')
      expect(getAvatarSizeClasses('xl')).toBe('w-16 h-16 text-lg')
    })

    it('should return default size for invalid input', () => {
      expect(getAvatarSizeClasses('invalid' as any)).toBe('w-10 h-10 text-sm')
    })
  })

  describe('deprecated functions', () => {
    let consoleSpy: jest.SpyInstance

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('should warn and return null for getProfileImageUrl', () => {
      const result = getProfileImageUrl()
      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('getProfileImageUrl is deprecated. Profile images have been removed.')
    })

    it('should warn and return null for uploadProfileImage', async () => {
      const result = await uploadProfileImage()
      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('uploadProfileImage is deprecated. Profile images have been removed.')
    })

    it('should warn and return void for deleteProfileImage', async () => {
      const result = await deleteProfileImage()
      expect(result).toBeUndefined()
      expect(consoleSpy).toHaveBeenCalledWith('deleteProfileImage is deprecated. Profile images have been removed.')
    })
  })
})
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { DensityProvider, useDensity, DENSITY_CONFIGS } from '@/contexts/DensityContext'

// 테스트용 컴포넌트
function TestComponent() {
  const { density, config, setDensity, getDensityClass } = useDensity()
  
  return (
    <div>
      <div data-testid="current-density">{density}</div>
      <div data-testid="font-size">{config.fontSize.base}</div>
      <div data-testid="spacing">{config.spacing.md}</div>
      <div data-testid="density-class">{getDensityClass('button')}</div>
      
      <button 
        data-testid="set-compact" 
        onClick={() => setDensity('compact')}
      >
        Set Compact
      </button>
      <button 
        data-testid="set-comfortable" 
        onClick={() => setDensity('comfortable')}
      >
        Set Comfortable
      </button>
      <button 
        data-testid="set-spacious" 
        onClick={() => setDensity('spacious')}
      >
        Set Spacious
      </button>
    </div>
  )
}

// localStorage mock
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// CSS 변수 설정을 위한 document.documentElement mock
const mockSetProperty = jest.fn()
Object.defineProperty(document, 'documentElement', {
  value: {
    style: {
      setProperty: mockSetProperty
    }
  }
})

describe('DensityContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('should provide default comfortable density', () => {
    render(
      <DensityProvider>
        <TestComponent />
      </DensityProvider>
    )

    expect(screen.getByTestId('current-density')).toHaveTextContent('comfortable')
    expect(screen.getByTestId('font-size')).toHaveTextContent('1rem')
    expect(screen.getByTestId('spacing')).toHaveTextContent('1rem')
  })

  it('should use custom default density', () => {
    render(
      <DensityProvider defaultDensity="compact">
        <TestComponent />
      </DensityProvider>
    )

    expect(screen.getByTestId('current-density')).toHaveTextContent('compact')
  })

  it('should load density from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('spacious')

    render(
      <DensityProvider>
        <TestComponent />
      </DensityProvider>
    )

    expect(screen.getByTestId('current-density')).toHaveTextContent('spacious')
    expect(localStorageMock.getItem).toHaveBeenCalledWith('ui-density')
  })

  it('should change density and save to localStorage', () => {
    render(
      <DensityProvider>
        <TestComponent />
      </DensityProvider>
    )

    act(() => {
      fireEvent.click(screen.getByTestId('set-compact'))
    })

    expect(screen.getByTestId('current-density')).toHaveTextContent('compact')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('ui-density', 'compact')
  })

  it('should update CSS variables when density changes', () => {
    render(
      <DensityProvider>
        <TestComponent />
      </DensityProvider>
    )

    act(() => {
      fireEvent.click(screen.getByTestId('set-compact'))
    })

    // CSS 변수가 설정되었는지 확인
    expect(mockSetProperty).toHaveBeenCalledWith('--density-spacing-xs', DENSITY_CONFIGS.compact.spacing.xs)
    expect(mockSetProperty).toHaveBeenCalledWith('--density-font-base', DENSITY_CONFIGS.compact.fontSize.base)
  })

  it('should generate correct density classes', () => {
    render(
      <DensityProvider>
        <TestComponent />
      </DensityProvider>
    )

    expect(screen.getByTestId('density-class')).toHaveTextContent('density-comfortable button-comfortable')

    act(() => {
      fireEvent.click(screen.getByTestId('set-compact'))
    })

    expect(screen.getByTestId('density-class')).toHaveTextContent('density-compact button-compact')
  })

  it('should update config when density changes', () => {
    render(
      <DensityProvider>
        <TestComponent />
      </DensityProvider>
    )

    // 초기 comfortable 설정 확인
    expect(screen.getByTestId('font-size')).toHaveTextContent('1rem')
    expect(screen.getByTestId('spacing')).toHaveTextContent('1rem')

    act(() => {
      fireEvent.click(screen.getByTestId('set-compact'))
    })

    // compact 설정으로 변경 확인
    expect(screen.getByTestId('font-size')).toHaveTextContent('0.875rem')
    expect(screen.getByTestId('spacing')).toHaveTextContent('0.75rem')

    act(() => {
      fireEvent.click(screen.getByTestId('set-spacious'))
    })

    // spacious 설정으로 변경 확인
    expect(screen.getByTestId('font-size')).toHaveTextContent('1.125rem')
    expect(screen.getByTestId('spacing')).toHaveTextContent('1.5rem')
  })

  it('should throw error when useDensity is used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useDensity must be used within a DensityProvider')

    consoleSpy.mockRestore()
  })

  it('should ignore invalid localStorage values', () => {
    localStorageMock.getItem.mockReturnValue('invalid-density')

    render(
      <DensityProvider>
        <TestComponent />
      </DensityProvider>
    )

    // 기본값인 comfortable이 사용되어야 함
    expect(screen.getByTestId('current-density')).toHaveTextContent('comfortable')
  })
})

describe('DENSITY_CONFIGS', () => {
  it('should have correct structure for all density levels', () => {
    const levels = ['compact', 'comfortable', 'spacious'] as const
    
    levels.forEach(level => {
      const config = DENSITY_CONFIGS[level]
      
      expect(config).toHaveProperty('level', level)
      expect(config).toHaveProperty('spacing')
      expect(config).toHaveProperty('padding')
      expect(config).toHaveProperty('fontSize')
      expect(config).toHaveProperty('lineHeight')
      expect(config).toHaveProperty('borderRadius')
      
      // spacing 속성 확인
      expect(config.spacing).toHaveProperty('xs')
      expect(config.spacing).toHaveProperty('sm')
      expect(config.spacing).toHaveProperty('md')
      expect(config.spacing).toHaveProperty('lg')
      expect(config.spacing).toHaveProperty('xl')
      
      // fontSize 속성 확인
      expect(config.fontSize).toHaveProperty('xs')
      expect(config.fontSize).toHaveProperty('sm')
      expect(config.fontSize).toHaveProperty('base')
      expect(config.fontSize).toHaveProperty('lg')
      expect(config.fontSize).toHaveProperty('xl')
    })
  })

  it('should have progressive sizing from compact to spacious', () => {
    const compact = DENSITY_CONFIGS.compact
    const comfortable = DENSITY_CONFIGS.comfortable
    const spacious = DENSITY_CONFIGS.spacious

    // spacing이 점진적으로 증가하는지 확인
    expect(parseFloat(compact.spacing.md)).toBeLessThan(parseFloat(comfortable.spacing.md))
    expect(parseFloat(comfortable.spacing.md)).toBeLessThan(parseFloat(spacious.spacing.md))

    // fontSize가 점진적으로 증가하는지 확인
    expect(parseFloat(compact.fontSize.base)).toBeLessThanOrEqual(parseFloat(comfortable.fontSize.base))
    expect(parseFloat(comfortable.fontSize.base)).toBeLessThan(parseFloat(spacious.fontSize.base))
  })
})
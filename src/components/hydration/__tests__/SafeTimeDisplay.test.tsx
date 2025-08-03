import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import SafeTimeDisplay from '../SafeTimeDisplay'

// Mock Date for consistent testing
const mockDate = new Date('2024-01-15T10:30:45.000Z')
jest.useFakeTimers()
jest.setSystemTime(mockDate)

describe('SafeTimeDisplay', () => {
  beforeEach(() => {
    jest.clearAllTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('renders placeholder initially', () => {
    render(<SafeTimeDisplay />)
    
    expect(screen.getByText('날짜 및 시간 로딩 중...')).toBeInTheDocument()
  })

  it('renders custom placeholder when provided', () => {
    render(<SafeTimeDisplay placeholder="시간 준비 중..." />)
    
    expect(screen.getByText('시간 준비 중...')).toBeInTheDocument()
  })

  it('renders time format correctly after hydration', async () => {
    render(<SafeTimeDisplay format="time" />)
    
    await waitFor(() => {
      expect(screen.getByText(/10:30:45/)).toBeInTheDocument()
    })
  })

  it('renders date format correctly after hydration', async () => {
    render(<SafeTimeDisplay format="date" locale="ko-KR" />)
    
    await waitFor(() => {
      expect(screen.getByText(/2024년 1월 15일/)).toBeInTheDocument()
    })
  })

  it('renders datetime format correctly after hydration', async () => {
    render(<SafeTimeDisplay format="datetime" locale="ko-KR" />)
    
    await waitFor(() => {
      const element = screen.getByText(/2024년 1월 15일.*10:30:45/)
      expect(element).toBeInTheDocument()
    })
  })

  it('updates time when interval elapses', async () => {
    render(<SafeTimeDisplay format="time" updateInterval={1000} />)
    
    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText(/10:30:45/)).toBeInTheDocument()
    })

    // Advance time by 1 second
    jest.setSystemTime(new Date('2024-01-15T10:30:46.000Z'))
    jest.advanceTimersByTime(1000)

    await waitFor(() => {
      expect(screen.getByText(/10:30:46/)).toBeInTheDocument()
    })
  })

  it('applies custom className', async () => {
    const { container } = render(
      <SafeTimeDisplay className="custom-time-class" />
    )
    
    await waitFor(() => {
      const timeElement = container.querySelector('.custom-time-class')
      expect(timeElement).toBeInTheDocument()
    })
  })

  it('uses custom locale for formatting', async () => {
    render(<SafeTimeDisplay format="date" locale="en-US" />)
    
    await waitFor(() => {
      expect(screen.getByText(/January 15, 2024/)).toBeInTheDocument()
    })
  })

  it('uses custom options for formatting', async () => {
    const customOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }

    render(
      <SafeTimeDisplay 
        format="time" 
        locale="en-US" 
        options={customOptions} 
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText(/10:30 AM/)).toBeInTheDocument()
    })
  })

  it('handles different format placeholders correctly', () => {
    const { rerender } = render(<SafeTimeDisplay format="date" />)
    expect(screen.getByText('날짜 로딩 중...')).toBeInTheDocument()

    rerender(<SafeTimeDisplay format="time" />)
    expect(screen.getByText('시간 로딩 중...')).toBeInTheDocument()

    rerender(<SafeTimeDisplay format="datetime" />)
    expect(screen.getByText('날짜 및 시간 로딩 중...')).toBeInTheDocument()
  })
})
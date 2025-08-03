import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import HydrationBoundary from '../HydrationBoundary'

// Mock useEffect to control hydration state
const mockUseEffect = jest.fn()
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: (fn: () => void, deps: any[]) => mockUseEffect(fn, deps)
}))

describe('HydrationBoundary', () => {
  beforeEach(() => {
    mockUseEffect.mockClear()
  })

  it('renders fallback content initially', () => {
    const TestComponent = () => <div>Hydrated Content</div>
    const fallback = <div>Loading...</div>

    render(
      <HydrationBoundary fallback={fallback}>
        <TestComponent />
      </HydrationBoundary>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders children after hydration', async () => {
    const TestComponent = () => <div>Hydrated Content</div>
    const fallback = <div>Loading...</div>

    // Mock hydration completion
    mockUseEffect.mockImplementation((fn) => {
      setTimeout(fn, 0) // Simulate hydration
    })

    render(
      <HydrationBoundary fallback={fallback}>
        <TestComponent />
      </HydrationBoundary>
    )

    await waitFor(() => {
      expect(screen.getByText('Hydrated Content')).toBeInTheDocument()
    })
  })

  it('applies suppressHydrationWarning when specified', () => {
    const TestComponent = () => <div>Test Content</div>

    const { container } = render(
      <HydrationBoundary suppressHydrationWarning={true}>
        <TestComponent />
      </HydrationBoundary>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveAttribute('suppressHydrationWarning')
  })

  it('renders null fallback when no fallback provided', () => {
    const TestComponent = () => <div>Test Content</div>

    const { container } = render(
      <HydrationBoundary>
        <TestComponent />
      </HydrationBoundary>
    )

    // Should render empty div initially
    expect(container.firstChild).toBeInTheDocument()
  })
})
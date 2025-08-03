import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ClientOnly from '../ClientOnly'

describe('ClientOnly', () => {
  it('renders fallback content initially', () => {
    const TestComponent = () => <div>Client Content</div>
    const fallback = <div>Server Content</div>

    render(
      <ClientOnly fallback={fallback}>
        <TestComponent />
      </ClientOnly>
    )

    expect(screen.getByText('Server Content')).toBeInTheDocument()
    expect(screen.queryByText('Client Content')).not.toBeInTheDocument()
  })

  it('renders children after mounting on client', async () => {
    const TestComponent = () => <div>Client Content</div>
    const fallback = <div>Server Content</div>

    render(
      <ClientOnly fallback={fallback}>
        <TestComponent />
      </ClientOnly>
    )

    // Wait for useEffect to run
    await waitFor(() => {
      expect(screen.getByText('Client Content')).toBeInTheDocument()
    })

    expect(screen.queryByText('Server Content')).not.toBeInTheDocument()
  })

  it('renders null fallback when no fallback provided', () => {
    const TestComponent = () => <div>Client Content</div>

    const { container } = render(
      <ClientOnly>
        <TestComponent />
      </ClientOnly>
    )

    // Initially should render nothing
    expect(container.firstChild).toBeEmptyDOMElement()
  })

  it('handles complex children correctly', async () => {
    const ComplexComponent = () => (
      <div>
        <h1>Title</h1>
        <p>Description</p>
        <button>Click me</button>
      </div>
    )

    render(
      <ClientOnly>
        <ComplexComponent />
      </ClientOnly>
    )

    await waitFor(() => {
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })
  })
})
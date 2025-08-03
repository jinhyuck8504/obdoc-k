import { render, screen, fireEvent } from '@testing-library/react'
import Input from '../Input'

describe('Input Component', () => {
  it('should render input with label', () => {
    render(<Input label="Email" />)
    
    const input = screen.getByLabelText(/email/i)
    expect(input).toBeInTheDocument()
  })

  it('should handle value changes', () => {
    const handleChange = jest.fn()
    render(<Input label="Email" onChange={handleChange} />)
    
    const input = screen.getByLabelText(/email/i)
    fireEvent.change(input, { target: { value: 'test@example.com' } })
    
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({
        value: 'test@example.com'
      })
    }))
  })

  it('should show error message', () => {
    render(<Input label="Email" error="Invalid email" />)
    
    const errorMessage = screen.getByText(/invalid email/i)
    expect(errorMessage).toBeInTheDocument()
    expect(errorMessage).toHaveClass('error-message')
  })

  it('should show helper text', () => {
    render(<Input label="Password" helperText="Must be at least 8 characters" />)
    
    const helperText = screen.getByText(/must be at least 8 characters/i)
    expect(helperText).toBeInTheDocument()
    expect(helperText).toHaveClass('helper-text')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Input label="Email" disabled />)
    
    const input = screen.getByLabelText(/email/i)
    expect(input).toBeDisabled()
  })

  it('should be required when required prop is true', () => {
    render(<Input label="Email" required />)
    
    const input = screen.getByLabelText(/email/i)
    expect(input).toBeRequired()
    
    const label = screen.getByText(/email/i)
    expect(label).toHaveTextContent('*')
  })

  it('should apply custom className', () => {
    render(<Input label="Email" className="custom-input" />)
    
    const input = screen.getByLabelText(/email/i)
    expect(input).toHaveClass('custom-input')
  })

  it('should render with different types', () => {
    const { rerender } = render(<Input label="Password" type="password" />)
    let input = screen.getByLabelText(/password/i)
    expect(input).toHaveAttribute('type', 'password')

    rerender(<Input label="Email" type="email" />)
    input = screen.getByLabelText(/email/i)
    expect(input).toHaveAttribute('type', 'email')

    rerender(<Input label="Phone" type="tel" />)
    input = screen.getByLabelText(/phone/i)
    expect(input).toHaveAttribute('type', 'tel')
  })

  it('should show placeholder text', () => {
    render(<Input label="Email" placeholder="Enter your email" />)
    
    const input = screen.getByPlaceholderText(/enter your email/i)
    expect(input).toBeInTheDocument()
  })

  it('should handle focus and blur events', () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()
    
    render(<Input label="Email" onFocus={handleFocus} onBlur={handleBlur} />)
    
    const input = screen.getByLabelText(/email/i)
    
    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalledTimes(1)
    
    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('should forward refs correctly', () => {
    const ref = jest.fn()
    render(<Input ref={ref} label="Email" />)
    
    expect(ref).toHaveBeenCalled()
  })

  it('should have proper accessibility attributes', () => {
    render(<Input label="Email" error="Invalid email" helperText="Enter valid email" />)
    
    const input = screen.getByLabelText(/email/i)
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby')
  })
})
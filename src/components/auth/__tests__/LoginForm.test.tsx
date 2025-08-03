import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider } from '@/contexts/AuthContext'
import LoginForm from '../LoginForm'

// Mock the auth context
const mockSignIn = jest.fn()
const mockAuthContext = {
  user: null,
  loading: false,
  signIn: mockSignIn,
  signOut: jest.fn(),
  signUp: jest.fn(),
}

jest.mock('@/contexts/AuthContext', () => ({
  ...jest.requireActual('@/contexts/AuthContext'),
  useAuth: () => mockAuthContext,
}))

const renderWithAuth = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  )
}

describe('LoginForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render login form', () => {
    renderWithAuth(<LoginForm />)
    
    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /로그인/i })).toBeInTheDocument()
  })

  it('should handle form submission with valid data', async () => {
    mockSignIn.mockResolvedValue({ user: { id: '123' }, error: null })
    
    renderWithAuth(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/이메일/i)
    const passwordInput = screen.getByLabelText(/비밀번호/i)
    const submitButton = screen.getByRole('button', { name: /로그인/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('should show validation errors for empty fields', async () => {
    renderWithAuth(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /로그인/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/이메일을 입력해주세요/i)).toBeInTheDocument()
      expect(screen.getByText(/비밀번호를 입력해주세요/i)).toBeInTheDocument()
    })
  })

  it('should show validation error for invalid email', async () => {
    renderWithAuth(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/이메일/i)
    const submitButton = screen.getByRole('button', { name: /로그인/i })
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/올바른 이메일 형식을 입력해주세요/i)).toBeInTheDocument()
    })
  })

  it('should show error message on login failure', async () => {
    mockSignIn.mockResolvedValue({ 
      user: null, 
      error: { message: '이메일 또는 비밀번호가 올바르지 않습니다' } 
    })
    
    renderWithAuth(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/이메일/i)
    const passwordInput = screen.getByLabelText(/비밀번호/i)
    const submitButton = screen.getByRole('button', { name: /로그인/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/이메일 또는 비밀번호가 올바르지 않습니다/i)).toBeInTheDocument()
    })
  })

  it('should show loading state during submission', async () => {
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    renderWithAuth(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/이메일/i)
    const passwordInput = screen.getByLabelText(/비밀번호/i)
    const submitButton = screen.getByRole('button', { name: /로그인/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/로그인 중.../i)).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    renderWithAuth(<LoginForm />)
    
    const form = screen.getByRole('form')
    expect(form).toHaveAttribute('aria-label', '로그인 폼')
    
    const emailInput = screen.getByLabelText(/이메일/i)
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('autocomplete', 'email')
    
    const passwordInput = screen.getByLabelText(/비밀번호/i)
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('autocomplete', 'current-password')
  })

  it('should toggle password visibility', () => {
    renderWithAuth(<LoginForm />)
    
    const passwordInput = screen.getByLabelText(/비밀번호/i)
    const toggleButton = screen.getByRole('button', { name: /비밀번호 보기/i })
    
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
    
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})
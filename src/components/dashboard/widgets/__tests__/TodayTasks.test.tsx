import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodayTasks from '../TodayTasks'

// Mock 아이콘들
jest.mock('lucide-react', () => ({
  CheckCircle: () => <div data-testid=\"check-circle\" />,
  Clock: () => <div data-testid=\"clock\" />,
  AlertCircle: () => <div data-testid=\"alert-circle\" />,
  Plus: () => <div data-testid=\"plus\" />,
  X: () => <div data-testid=\"x\" />,
  Save: () => <div data-testid=\"save\" />,
  Edit2: () => <div data-testid=\"edit2\" />,
  Check: () => <div data-testid=\"check\" />
}))

describe('TodayTasks', () => {
  beforeEach(() => {
    // 각 테스트 전에 confirm mock 설정
    window.confirm = jest.fn(() => true)
    window.alert = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should render task list with initial tasks', () => {
    render(<TodayTasks />)
    
    expect(screen.getByText('오늘 할 일')).toBeInTheDocument()
    expect(screen.getByText('김철수 고객 상담')).toBeInTheDocument()
    expect(screen.getByText('이영희 고객 체중 측정')).toBeInTheDocument()
    expect(screen.getByText('박민수 고객 식단 검토')).toBeInTheDocument()
  })

  it('should show progress bar with correct percentage', () => {
    render(<TodayTasks />)
    
    // 초기 상태: 4개 작업 중 1개 완료 (25%)
    expect(screen.getByText('1/4 완료')).toBeInTheDocument()
    expect(screen.getByText('25%')).toBeInTheDocument()
  })

  it('should toggle task completion status', async () => {
    const user = userEvent.setup()
    render(<TodayTasks />)
    
    // 대기 중인 작업의 체크 버튼 클릭
    const checkButtons = screen.getAllByTestId('check-circle')
    await user.click(checkButtons[1]) // 두 번째 작업 (이영희)
    
    // 진행률이 업데이트되어야 함 (2/4 = 50%)
    await waitFor(() => {
      expect(screen.getByText('2/4 완료')).toBeInTheDocument()
      expect(screen.getByText('50%')).toBeInTheDocument()
    })
  })

  it('should open add task modal', async () => {
    const user = userEvent.setup()
    render(<TodayTasks />)
    
    const addButton = screen.getByTitle('새 작업 추가')
    await user.click(addButton)
    
    expect(screen.getByText('새 작업 추가')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('작업 제목을 입력하세요')).toBeInTheDocument()
  })

  it('should add new task', async () => {
    const user = userEvent.setup()
    render(<TodayTasks />)
    
    // 모달 열기
    const addButton = screen.getByTitle('새 작업 추가')
    await user.click(addButton)
    
    // 폼 입력
    await user.type(screen.getByPlaceholderText('작업 제목을 입력하세요'), '새로운 작업')
    await user.type(screen.getByDisplayValue(''), '15:00')
    await user.type(screen.getByPlaceholderText('고객명 (선택사항)'), '홍길동')
    
    // 저장 버튼 클릭
    const saveButton = screen.getByRole('button', { name: /저장/ })
    await user.click(saveButton)
    
    // 새 작업이 추가되었는지 확인
    await waitFor(() => {
      expect(screen.getByText('새로운 작업')).toBeInTheDocument()
      expect(screen.getByText('5/5 완료')).toBeInTheDocument() // 총 작업 수 증가
    })
  })

  it('should validate required fields when adding task', async () => {
    const user = userEvent.setup()
    render(<TodayTasks />)
    
    // 모달 열기
    const addButton = screen.getByTitle('새 작업 추가')
    await user.click(addButton)
    
    // 제목 없이 저장 시도
    const saveButton = screen.getByRole('button', { name: /저장/ })
    await user.click(saveButton)
    
    // 경고 메시지 확인
    expect(window.alert).toHaveBeenCalledWith('제목과 시간을 입력해주세요.')
  })

  it('should delete task with confirmation', async () => {
    const user = userEvent.setup()
    render(<TodayTasks />)
    
    const initialTaskCount = screen.getAllByTestId('x').length
    
    // 삭제 버튼 클릭
    const deleteButtons = screen.getAllByTitle('작업 삭제')
    await user.click(deleteButtons[0])
    
    // confirm이 호출되었는지 확인
    expect(window.confirm).toHaveBeenCalledWith('이 작업을 삭제하시겠습니까?')
    
    // 작업이 삭제되었는지 확인
    await waitFor(() => {
      const remainingDeleteButtons = screen.getAllByTestId('x')
      expect(remainingDeleteButtons.length).toBe(initialTaskCount - 1)
    })
  })

  it('should not delete task if user cancels confirmation', async () => {
    const user = userEvent.setup()
    // confirm을 false로 설정
    window.confirm = jest.fn(() => false)
    
    render(<TodayTasks />)
    
    const initialTaskCount = screen.getAllByTestId('x').length
    
    // 삭제 버튼 클릭
    const deleteButtons = screen.getAllByTitle('작업 삭제')
    await user.click(deleteButtons[0])
    
    // 작업이 삭제되지 않았는지 확인
    const remainingDeleteButtons = screen.getAllByTestId('x')
    expect(remainingDeleteButtons.length).toBe(initialTaskCount)
  })

  it('should enter edit mode for task', async () => {
    const user = userEvent.setup()
    render(<TodayTasks />)
    
    // 편집 버튼 클릭
    const editButtons = screen.getAllByTitle('작업 수정')
    await user.click(editButtons[0])
    
    // 편집 폼이 나타나는지 확인
    expect(screen.getByDisplayValue('김철수 고객 상담')).toBeInTheDocument()
    expect(screen.getByDisplayValue('10:00')).toBeInTheDocument()
  })

  it('should save edited task', async () => {
    const user = userEvent.setup()
    render(<TodayTasks />)
    
    // 편집 모드 진입
    const editButtons = screen.getAllByTitle('작업 수정')
    await user.click(editButtons[0])
    
    // 제목 수정
    const titleInput = screen.getByDisplayValue('김철수 고객 상담')
    await user.clear(titleInput)
    await user.type(titleInput, '김철수 고객 상담 수정됨')
    
    // 저장 버튼 클릭
    const saveButton = screen.getByRole('button', { name: /저장/ })
    await user.click(saveButton)
    
    // 수정된 내용이 반영되었는지 확인
    await waitFor(() => {
      expect(screen.getByText('김철수 고객 상담 수정됨')).toBeInTheDocument()
    })
  })

  it('should cancel edit mode', async () => {
    const user = userEvent.setup()
    render(<TodayTasks />)
    
    // 편집 모드 진입
    const editButtons = screen.getAllByTitle('작업 수정')
    await user.click(editButtons[0])
    
    // 취소 버튼 클릭
    const cancelButton = screen.getByRole('button', { name: /취소/ })
    await user.click(cancelButton)
    
    // 편집 폼이 사라지고 원래 내용이 유지되는지 확인
    expect(screen.getByText('김철수 고객 상담')).toBeInTheDocument()
    expect(screen.queryByDisplayValue('김철수 고객 상담')).not.toBeInTheDocument()
  })

  it('should display correct status icons and colors', () => {
    render(<TodayTasks />)
    
    // 완료된 작업은 체크 아이콘
    expect(screen.getAllByTestId('check-circle')).toHaveLength(4) // 모든 작업의 체크 버튼
    
    // 긴급 작업은 경고 아이콘 (상태에 따라)
    expect(screen.getAllByTestId('alert-circle')).toHaveLength(0) // 초기 데이터에는 긴급 작업 없음
  })

  it('should sort tasks by time when adding new task', async () => {
    const user = userEvent.setup()
    render(<TodayTasks />)
    
    // 새 작업 추가 (시간: 08:00 - 가장 이른 시간)
    const addButton = screen.getByTitle('새 작업 추가')
    await user.click(addButton)
    
    await user.type(screen.getByPlaceholderText('작업 제목을 입력하세요'), '아침 작업')
    await user.type(screen.getByDisplayValue(''), '08:00')
    
    const saveButton = screen.getByRole('button', { name: /저장/ })
    await user.click(saveButton)
    
    // 작업이 시간순으로 정렬되어 첫 번째에 나타나는지 확인
    await waitFor(() => {
      const taskElements = screen.getAllByText(/고객|작업/)
      expect(taskElements[0]).toHaveTextContent('아침 작업')
    })
  })
})
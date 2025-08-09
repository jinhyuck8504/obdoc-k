'use client'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6">
        <h1 className="text-2xl font-bold text-center mb-6">로그인</h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">이메일</label>
            <input 
              type="email" 
              className="w-full p-3 border rounded-lg"
              placeholder="이메일을 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">비밀번호</label>
            <input 
              type="password" 
              className="w-full p-3 border rounded-lg"
              placeholder="비밀번호를 입력하세요"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  )
}

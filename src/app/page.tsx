export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">OBDOC MVP</h1>
        <p className="text-xl text-gray-600 mb-8">비만 관리 플랫폼</p>
        <div className="space-y-4">
          <a 
            href="/login" 
            className="block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            로그인
          </a>
          <a 
            href="/signup" 
            className="block bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
          >
            회원가입
          </a>
        </div>
      </div>
    </div>
  )
}

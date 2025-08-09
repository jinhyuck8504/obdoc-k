export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="card max-w-md w-full">
        <div className="card-header">
          <h1 className="text-2xl font-bold text-center">시스템 설정</h1>
        </div>
        <div className="card-body text-center">
          <p className="text-gray-600 mb-4">시스템 설정 기능은 현재 개발 중입니다.</p>
          <a href="/" className="btn btn-primary">
            홈으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="card max-w-md w-full">
        <div className="card-body text-center">
          <div className="text-6xl mb-6">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600 mb-6">
            이 페이지에 접근할 권한이 없습니다. 
            로그인하거나 적절한 권한을 확인해주세요.
          </p>
          
          <div className="space-y-3">
            <a href="/login" className="btn btn-primary w-full">
              로그인하기
            </a>
            <a href="/" className="btn btn-outline w-full">
              홈으로 돌아가기
            </a>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>문제가 지속되면 관리자에게 문의하세요.</p>
            <p>이메일: support@obdoc.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

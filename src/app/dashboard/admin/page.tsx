export default function DashboardAdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="card">
          <div className="card-header">
            <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
          </div>
          
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="card">
                <div className="card-body text-center">
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className="text-lg font-semibold mb-2">사용자 관리</h3>
                  <p className="text-gray-600 mb-4">시스템 사용자를 관리합니다.</p>
                  <button className="btn btn-primary">관리하기</button>
                </div>
              </div>

              <div className="card">
                <div className="card-body text-center">
                  <div className="text-4xl mb-4">⚙️</div>
                  <h3 className="text-lg font-semibold mb-2">시스템 설정</h3>
                  <p className="text-gray-600 mb-4">시스템 전반적인 설정을 관리합니다.</p>
                  <button className="btn btn-primary">설정하기</button>
                </div>
              </div>

              <div className="card">
                <div className="card-body text-center">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-lg font-semibold mb-2">통계</h3>
                  <p className="text-gray-600 mb-4">시스템 사용 통계를 확인합니다.</p>
                  <button className="btn btn-primary">보기</button>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold">최근 활동</h2>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span>새로운 사용자 등록</span>
                      <span className="text-sm text-gray-500">2시간 전</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span>시스템 설정 변경</span>
                      <span className="text-sm text-gray-500">5시간 전</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span>데이터베이스 백업 완료</span>
                      <span className="text-sm text-gray-500">1일 전</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

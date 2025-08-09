export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ObDoc MVP
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            비만 전문의를 위한 환자 관리 시스템
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="text-xl font-semibold mb-4">의사 로그인</h3>
              <p className="text-gray-600 mb-6">
                의료진을 위한 전용 대시보드에 접속하세요.
              </p>
              <a href="/login" className="btn btn-primary w-full">
                의사 로그인
              </a>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <h3 className="text-xl font-semibold mb-4">환자 로그인</h3>
              <p className="text-gray-600 mb-6">
                개인 건강 관리 페이지에 접속하세요.
              </p>
              <a href="/login" className="btn btn-secondary w-full">
                환자 로그인
              </a>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <h3 className="text-xl font-semibold mb-4">회원가입</h3>
              <p className="text-gray-600 mb-6">
                새로운 계정을 생성하세요.
              </p>
              <a href="/signup" className="btn btn-outline w-full">
                회원가입
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="card max-w-2xl mx-auto">
            <div className="card-header">
              <h2 className="text-2xl font-semibold">시스템 특징</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">환자 관리</h4>
                  <p className="text-gray-600 text-sm">
                    체계적인 환자 정보 관리 및 진료 기록 추적
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">예약 시스템</h4>
                  <p className="text-gray-600 text-sm">
                    효율적인 진료 예약 및 일정 관리
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">건강 모니터링</h4>
                  <p className="text-gray-600 text-sm">
                    실시간 건강 데이터 추적 및 분석
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">보안</h4>
                  <p className="text-gray-600 text-sm">
                    의료 정보 보안 표준을 준수한 안전한 시스템
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

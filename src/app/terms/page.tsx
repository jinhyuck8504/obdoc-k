export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-12">
        <div className="max-w-4xl mx-auto">
          <div className="card">
            <div className="card-header text-center">
              <h1 className="text-3xl font-bold text-gray-900">이용약관</h1>
              <p className="text-gray-600 mt-2">최종 업데이트: 2024년 1월 1일</p>
            </div>
            
            <div className="card-body">
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">제1조 (목적)</h2>
                <p className="text-gray-700 mb-6">
                  이 약관은 ObDoc MVP(이하 "회사")가 제공하는 서비스의 이용조건 및 절차, 
                  회사와 이용자의 권리, 의무, 책임사항과 기타 필요한 사항을 규정함을 목적으로 합니다.
                </p>

                <h2 className="text-xl font-semibold mb-4">제2조 (정의)</h2>
                <p className="text-gray-700 mb-6">
                  이 약관에서 사용하는 용어의 정의는 다음과 같습니다.
                </p>
                <ul className="list-disc pl-6 mb-6 text-gray-700">
                  <li>"서비스"라 함은 회사가 제공하는 모든 서비스를 의미합니다.</li>
                  <li>"이용자"라 함은 회사의 서비스에 접속하여 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
                  <li>"회원"이라 함은 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며, 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
                </ul>

                <h2 className="text-xl font-semibold mb-4">제3조 (약관의 효력 및 변경)</h2>
                <p className="text-gray-700 mb-6">
                  이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다.
                </p>

                <h2 className="text-xl font-semibold mb-4">제4조 (서비스의 제공 및 변경)</h2>
                <p className="text-gray-700 mb-6">
                  회사는 다음과 같은 업무를 수행합니다.
                </p>
                <ul className="list-disc pl-6 mb-6 text-gray-700">
                  <li>의료진과 환자를 위한 플랫폼 서비스</li>
                  <li>건강 관리 및 모니터링 서비스</li>
                  <li>예약 및 진료 관리 서비스</li>
                  <li>기타 회사가 정하는 업무</li>
                </ul>

                <h2 className="text-xl font-semibold mb-4">제5조 (서비스의 중단)</h2>
                <p className="text-gray-700 mb-6">
                  회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 
                  서비스의 제공을 일시적으로 중단할 수 있습니다.
                </p>

                <div className="mt-8 text-center">
                  <a href="/" className="btn btn-primary">
                    홈으로 돌아가기
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

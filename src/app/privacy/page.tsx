export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-12">
        <div className="max-w-4xl mx-auto">
          <div className="card">
            <div className="card-header text-center">
              <h1 className="text-3xl font-bold text-gray-900">개인정보처리방침</h1>
              <p className="text-gray-600 mt-2">최종 업데이트: 2024년 1월 1일</p>
            </div>
            
            <div className="card-body">
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">1. 개인정보의 처리 목적</h2>
                <p className="text-gray-700 mb-6">
                  ObDoc MVP는 다음의 목적을 위하여 개인정보를 처리합니다. 
                  처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 
                  이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 
                  필요한 조치를 이행할 예정입니다.
                </p>

                <h2 className="text-xl font-semibold mb-4">2. 개인정보의 처리 및 보유기간</h2>
                <p className="text-gray-700 mb-6">
                  회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 
                  수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
                </p>

                <h2 className="text-xl font-semibold mb-4">3. 개인정보의 제3자 제공</h2>
                <p className="text-gray-700 mb-6">
                  회사는 정보주체의 개인정보를 개인정보의 처리 목적에서 명시한 범위 내에서만 처리하며, 
                  정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조에 해당하는 경우에만 
                  개인정보를 제3자에게 제공합니다.
                </p>

                <h2 className="text-xl font-semibold mb-4">4. 개인정보처리의 위탁</h2>
                <p className="text-gray-700 mb-6">
                  회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
                </p>

                <h2 className="text-xl font-semibold mb-4">5. 정보주체의 권리·의무 및 행사방법</h2>
                <p className="text-gray-700 mb-6">
                  정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
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

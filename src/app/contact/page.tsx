export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-12">
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <div className="card-header text-center">
              <h1 className="text-3xl font-bold text-gray-900">문의하기</h1>
              <p className="text-gray-600 mt-2">궁금한 점이 있으시면 언제든 연락주세요.</p>
            </div>
            
            <div className="card-body">
              <div className="grid gap-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">📧 이메일</h3>
                  <p className="text-gray-600">support@obdoc.com</p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">📞 전화</h3>
                  <p className="text-gray-600">02-1234-5678</p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">🏢 주소</h3>
                  <p className="text-gray-600">서울특별시 강남구 테헤란로 123</p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">🕒 운영시간</h3>
                  <p className="text-gray-600">평일 09:00 - 18:00</p>
                </div>
              </div>
              
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
  );
}

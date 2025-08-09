export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">ObDoc MVP</h3>
            <p className="text-gray-300 text-sm">
              비만 전문의를 위한 환자 관리 시스템
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">서비스</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/dashboard" className="text-gray-300 hover:text-white">대시보드</a></li>
              <li><a href="/appointments" className="text-gray-300 hover:text-white">예약 관리</a></li>
              <li><a href="/patients" className="text-gray-300 hover:text-white">환자 관리</a></li>
              <li><a href="/community" className="text-gray-300 hover:text-white">커뮤니티</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">지원</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/contact" className="text-gray-300 hover:text-white">문의하기</a></li>
              <li><a href="/help" className="text-gray-300 hover:text-white">도움말</a></li>
              <li><a href="/faq" className="text-gray-300 hover:text-white">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">법적 고지</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/privacy" className="text-gray-300 hover:text-white">개인정보처리방침</a></li>
              <li><a href="/terms" className="text-gray-300 hover:text-white">이용약관</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300 text-sm">
            © {currentYear} ObDoc MVP. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

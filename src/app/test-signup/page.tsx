'use client';

import { useState } from 'react';

export default function TestSignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 간단한 유효성 검사
    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      setIsLoading(false);
      return;
    }
    
    // 테스트용 회원가입 로직
    setTimeout(() => {
      setIsLoading(false);
      alert('테스트 회원가입이 완료되었습니다!');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-12">
        <div className="max-w-md mx-auto">
          <div className="card">
            <div className="card-header text-center">
              <h1 className="text-2xl font-bold text-gray-900">테스트 회원가입</h1>
              <p className="text-gray-600 mt-2">회원가입 기능을 테스트해보세요</p>
            </div>
            
            <div className="card-body">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">이름</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="이름을 입력하세요"
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">이메일</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="이메일을 입력하세요"
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">비밀번호</label>
                  <input
                    type="password"
                    className="form-input"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="비밀번호를 입력하세요"
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">비밀번호 확인</label>
                  <input
                    type="password"
                    className="form-input"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="비밀번호를 다시 입력하세요"
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">역할</label>
                  <select
                    className="form-input"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="patient">환자</option>
                    <option value="doctor">의사</option>
                  </select>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-full"
                >
                  {isLoading ? '가입 중...' : '회원가입'}
                </button>
              </form>
              
              <div className="mt-6 text-center">
                <a href="/login" className="text-blue-600 hover:text-blue-700 block mb-2">
                  이미 계정이 있으신가요? 로그인
                </a>
                <a href="/" className="text-gray-600 hover:text-gray-700">
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

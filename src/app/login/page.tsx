'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 간단한 로그인 로직 (실제로는 API 호출)
    setTimeout(() => {
      setIsLoading(false);
      alert('로그인 기능은 현재 개발 중입니다.');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="card max-w-md w-full">
        <div className="card-header text-center">
          <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
          <p className="text-gray-600 mt-2">계정에 로그인하세요</p>
        </div>
        
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">이메일</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                required
              />
            </div>
            
            <div>
              <label className="form-label">비밀번호</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>
          
          <div className="mt-6 text-center space-y-2">
            <a href="/signup" className="text-blue-600 hover:text-blue-700 block">
              계정이 없으신가요? 회원가입
            </a>
            <a href="/" className="text-gray-600 hover:text-gray-700 block">
              홈으로 돌아가기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

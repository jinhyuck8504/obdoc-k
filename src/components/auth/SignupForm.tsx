'use client';

import { useState } from 'react';

export default function SignupForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    hospitalCode: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    if (formData.role === 'doctor' && !formData.hospitalCode.trim()) {
      newErrors.hospitalCode = '의사는 병원 코드를 입력해야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // 실제 회원가입 로직 (현재는 시뮬레이션)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert('회원가입이 완료되었습니다!');
      
      // 폼 초기화
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'patient',
        hospitalCode: ''
      });
      
    } catch (error) {
      alert('회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <div className="card-header text-center">
          <h2 className="text-2xl font-bold text-gray-900">회원가입</h2>
          <p className="text-gray-600 mt-2">새 계정을 만들어보세요</p>
        </div>
        
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">이름</label>
              <input
                type="text"
                className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="이름을 입력하세요"
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            <div>
              <label className="form-label">이메일</label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="이메일을 입력하세요"
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div>
              <label className="form-label">비밀번호</label>
              <input
                type="password"
                className={`form-input ${errors.password ? 'border-red-500' : ''}`}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="비밀번호를 입력하세요"
              />
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <div>
              <label className="form-label">비밀번호 확인</label>
              <input
                type="password"
                className={`form-input ${errors.confirmPassword ? 'border-red-500' : ''}`}
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
              />
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
            </div>

            <div>
              <label className="form-label">역할</label>
              <select
                className="form-input"
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
              >
                <option value="patient">환자</option>
                <option value="doctor">의사</option>
              </select>
            </div>

            {formData.role === 'doctor' && (
              <div>
                <label className="form-label">병원 코드</label>
                <input
                  type="text"
                  className={`form-input ${errors.hospitalCode ? 'border-red-500' : ''}`}
                  value={formData.hospitalCode}
                  onChange={(e) => handleChange('hospitalCode', e.target.value)}
                  placeholder="병원 코드를 입력하세요"
                />
                {errors.hospitalCode && <p className="form-error">{errors.hospitalCode}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? '가입 중...' : '회원가입'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              이미 계정이 있으신가요?{' '}
              <a href="/login" className="text-blue-600 hover:text-blue-700">
                로그인
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

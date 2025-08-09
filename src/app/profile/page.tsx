'use client';

import { useState } from 'react';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: '홍길동',
    email: 'hong@example.com',
    phone: '010-1234-5678',
    role: 'doctor'
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    alert('프로필이 저장되었습니다.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-12">
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <div className="card-header text-center">
              <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl">
                👤
              </div>
              <h1 className="text-2xl font-bold text-gray-900">내 프로필</h1>
            </div>
            
            <div className="card-body">
              <div className="space-y-4">
                <div>
                  <label className="form-label">이름</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-input"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                    />
                  ) : (
                    <p className="text-gray-700">{profile.name}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">이메일</label>
                  {isEditing ? (
                    <input
                      type="email"
                      className="form-input"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                    />
                  ) : (
                    <p className="text-gray-700">{profile.email}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">전화번호</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      className="form-input"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    />
                  ) : (
                    <p className="text-gray-700">{profile.phone}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">역할</label>
                  <p className="text-gray-700">
                    {profile.role === 'doctor' ? '의사' : '환자'}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex gap-4 justify-center">
                {isEditing ? (
                  <>
                    <button onClick={handleSave} className="btn btn-primary">
                      저장
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)} 
                      className="btn btn-secondary"
                    >
                      취소
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="btn btn-primary"
                  >
                    수정
                  </button>
                )}
                <a href="/" className="btn btn-outline">
                  홈으로
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    siteName: 'ObDoc MVP',
    maintenanceMode: false,
    maxUsers: 1000,
    emailNotifications: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // 설정 저장 로직 (실제로는 API 호출)
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('설정이 저장되었습니다.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('설정 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card">
        <div className="card-header">
          <h1 className="text-2xl font-bold">시스템 설정</h1>
        </div>
        
        <div className="card-body">
          {message && (
            <div className={`alert ${message.includes('실패') ? 'alert-error' : 'alert-success'}`}>
              {message}
            </div>
          )}

          <div className="grid gap-6">
            <div>
              <label className="form-label">사이트 이름</label>
              <input
                type="text"
                className="form-input"
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
              />
            </div>

            <div>
              <label className="form-label">최대 사용자 수</label>
              <input
                type="number"
                className="form-input"
                value={settings.maxUsers}
                onChange={(e) => setSettings({...settings, maxUsers: parseInt(e.target.value)})}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="maintenance"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
              />
              <label htmlFor="maintenance" className="form-label mb-0">유지보수 모드</label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="email"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
              />
              <label htmlFor="email" className="form-label mb-0">이메일 알림</label>
            </div>
          </div>
        </div>

        <div className="card-footer">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? '저장 중...' : '설정 저장'}
          </button>
        </div>
      </div>
    </div>
  );
}

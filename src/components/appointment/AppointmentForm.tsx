'use client';

import { useState } from 'react';

interface AppointmentFormProps {
  onSubmit: (appointment: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export default function AppointmentForm({ onSubmit, onCancel, initialData }: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    patientName: initialData?.patientName || '',
    doctorName: initialData?.doctorName || '',
    date: initialData?.date || '',
    time: initialData?.time || '',
    notes: initialData?.notes || ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSubmit({
        ...formData,
        id: initialData?.id || Date.now().toString(),
        status: initialData?.status || 'scheduled'
      });
    } catch (error) {
      console.error('예약 저장 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {initialData ? '예약 수정' : '새 예약'}
              </h2>
              <button
                onClick={onCancel}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">환자명</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.patientName}
                  onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                  placeholder="환자명을 입력하세요"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">담당의</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.doctorName}
                  onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
                  placeholder="담당의를 입력하세요"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">날짜</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">시간</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="form-label">메모</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="추가 메모를 입력하세요"
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={onCancel}
                  className="btn btn-outline"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  {isLoading ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

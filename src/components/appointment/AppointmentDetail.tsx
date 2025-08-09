interface AppointmentDetailProps {
  appointment: {
    id: string;
    patientName: string;
    doctorName: string;
    date: string;
    time: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    notes?: string;
  };
  onClose: () => void;
  onUpdate?: (appointment: any) => void;
}

export default function AppointmentDetail({ appointment, onClose, onUpdate }: AppointmentDetailProps) {
  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return '예정';
      case 'completed': return '완료';
      case 'cancelled': return '취소';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'badge-primary';
      case 'completed': return 'badge-success';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-primary';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">예약 상세정보</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="card-body">
            <div className="space-y-4">
              <div>
                <label className="form-label">예약 ID</label>
                <p className="text-gray-700">{appointment.id}</p>
              </div>
              
              <div>
                <label className="form-label">환자명</label>
                <p className="text-gray-700">{appointment.patientName}</p>
              </div>
              
              <div>
                <label className="form-label">담당의</label>
                <p className="text-gray-700">{appointment.doctorName}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">날짜</label>
                  <p className="text-gray-700">{appointment.date}</p>
                </div>
                <div>
                  <label className="form-label">시간</label>
                  <p className="text-gray-700">{appointment.time}</p>
                </div>
              </div>
              
              <div>
                <label className="form-label">상태</label>
                <div>
                  <span className={`badge ${getStatusColor(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>
              </div>
              
              {appointment.notes && (
                <div>
                  <label className="form-label">메모</label>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">
                    {appointment.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="card-footer">
            <div className="flex gap-2 justify-end">
              {appointment.status === 'scheduled' && (
                <>
                  <button className="btn btn-success">
                    완료 처리
                  </button>
                  <button className="btn btn-danger">
                    취소
                  </button>
                </>
              )}
              <button onClick={onClose} className="btn btn-outline">
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

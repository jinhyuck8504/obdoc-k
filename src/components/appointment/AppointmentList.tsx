interface AppointmentListProps {
  appointments: Array<{
    id: string;
    patientName: string;
    doctorName: string;
    date: string;
    time: string;
    status: 'scheduled' | 'completed' | 'cancelled';
  }>;
  onEdit: (appointment: any) => void;
  onDelete: (id: string) => void;
  onView: (appointment: any) => void;
}

export default function AppointmentList({ appointments, onEdit, onDelete, onView }: AppointmentListProps) {
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

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">📅</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">예약이 없습니다</h3>
        <p className="text-gray-500">새로운 예약을 추가해보세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div key={appointment.id} className="card">
          <div className="card-body">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{appointment.patientName}</h3>
                  <span className={`badge ${getStatusColor(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>
                
                <div className="text-gray-600 space-y-1">
                  <p>담당의: {appointment.doctorName}</p>
                  <p>일시: {appointment.date} {appointment.time}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => onView(appointment)}
                  className="btn btn-outline btn-sm"
                  title="상세보기"
                >
                  👁️
                </button>
                <button
                  onClick={() => onEdit(appointment)}
                  className="btn btn-outline btn-sm"
                  title="수정"
                >
                  ✏️
                </button>
                <button
                  onClick={() => {
                    if (confirm('정말 삭제하시겠습니까?')) {
                      onDelete(appointment.id);
                    }
                  }}
                  className="btn btn-danger btn-sm"
                  title="삭제"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

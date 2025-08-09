'use client';

import { useState } from 'react';
import AppointmentList from './AppointmentList';
import AppointmentForm from './AppointmentForm';
import AppointmentDetail from './AppointmentDetail';

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState([
    {
      id: '1',
      patientName: '김환자',
      doctorName: '이의사',
      date: '2024-01-15',
      time: '14:00',
      status: 'scheduled' as const,
      notes: '정기 검진'
    },
    {
      id: '2',
      patientName: '박환자',
      doctorName: '최의사',
      date: '2024-01-16',
      time: '10:30',
      status: 'completed' as const,
      notes: '혈압 측정'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const handleAdd = () => {
    setSelectedAppointment(null);
    setShowForm(true);
  };

  const handleEdit = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowForm(true);
  };

  const handleView = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowDetail(true);
  };

  const handleDelete = (id: string) => {
    setAppointments(appointments.filter(apt => apt.id !== id));
  };

  const handleSubmit = (appointmentData: any) => {
    if (selectedAppointment) {
      // 수정
      setAppointments(appointments.map(apt => 
        apt.id === selectedAppointment.id ? appointmentData : apt
      ));
    } else {
      // 추가
      setAppointments([...appointments, appointmentData]);
    }
    setShowForm(false);
    setSelectedAppointment(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setShowDetail(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">예약 관리</h1>
        <button
          onClick={handleAdd}
          className="btn btn-primary"
        >
          + 새 예약
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">예약 목록</h2>
        </div>
        <div className="card-body">
          <AppointmentList
            appointments={appointments}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        </div>
      </div>

      {showForm && (
        <AppointmentForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={selectedAppointment}
        />
      )}

      {showDetail && selectedAppointment && (
        <AppointmentDetail
          appointment={selectedAppointment}
          onClose={handleCancel}
        />
      )}
    </div>
  );
}

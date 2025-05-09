// src/pages/CalendarPage.jsx
import React from 'react';
import Calendar from '../components/Calendar';

const CalendarPage = () => {
  return (
    <div className="p-4">
      <h2 className="mb-3">Agendar Cita</h2>
      <Calendar />
    </div>
  );
};

export default CalendarPage;


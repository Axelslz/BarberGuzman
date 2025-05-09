import React, { useState } from 'react';
import { Container, Row, Col, Button, ListGroup, Card, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../assets/css/CustomCalendar.css'; // Asegúrate de que este archivo existe y está enlazado

const CalendarCompact = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([
    { date: '2025-05-08', time: '10:00' },
    { date: '2025-05-08', time: '12:00' },
    { date: '2025-05-09', time: '14:00' },
  ]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const availableTimes = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

  const formatDateToYYYYMMDD = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleAppointment = (time) => {
    const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));

    if (!loggedUser) {
      setShowModal(true);
      return;
    }

    const dateStr = formatDateToYYYYMMDD(selectedDate);
    if (!dateStr) return;

    alert(`Cita agendada para ${dateStr} a las ${time}`);
    setAppointments([...appointments, { date: dateStr, time }]);
  };

  const isOccupied = (date, time) => {
    const dateStr = formatDateToYYYYMMDD(date);
    return appointments.some((appt) => appt.date === dateStr && appt.time === time);
  };

  const handleModalClose = () => setShowModal(false);
  const handleLoginRedirect = () => {
    navigate('/login');
    setShowModal(false);
  };
  const handleRegisterRedirect = () => {
    navigate('/register');
    setShowModal(false);
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const formattedDate = formatDateToYYYYMMDD(date);
      const hasAppointment = appointments.some(appt => appt.date === formattedDate);
      return hasAppointment ? <p className="highlight-appointment-day"></p> : null;
    }
  };

  return (
    <Container className="my-4">
      <Row>
        {/* Calendario a la izquierda - Ajustamos el tamaño de la columna para mayor espacio */}
        <Col xs={12} md={6}> {/* Ocupará 12 columnas en móviles, 6 en tablets y desktops */}
          <Card>
            <Card.Body>
              <h5 className="text-center mb-3">Calendario</h5>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                locale="es-ES"
                className="react-calendar-custom" // Usamos esta clase para nuestros estilos personalizados
                tileContent={tileContent}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Detalles y botón agendar a la derecha - También ajustamos el tamaño de la columna */}
        <Col xs={12} md={6}> {/* Ocupará 12 columnas en móviles, 6 en tablets y desktops */}
          <Card>
            <Card.Body>
              <h5 className="text-center">Agendar Cita</h5>
              {selectedDate ? (
                <>
                  <p className="text-center">Día seleccionado: <strong>{formatDateToYYYYMMDD(selectedDate)}</strong></p>
                  <ListGroup>
                    {availableTimes.map((time) => (
                      <ListGroup.Item key={time} className="d-flex justify-content-between align-items-center">
                        {time}
                        {isOccupied(selectedDate, time) ? (
                          <Button variant="secondary" size="sm" disabled>Ocupado</Button>
                        ) : (
                          <Button variant="success" size="sm" onClick={() => handleAppointment(time)}>
                            Agendar
                          </Button>
                        )}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </>
              ) : (
                <p className="text-center">Selecciona un día en el calendario.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal para login o registro (sin cambios) */}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Inicia sesión o regístrate</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Para poder agendar una cita, debes iniciar sesión o registrarte.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleLoginRedirect}>
            Iniciar sesión
          </Button>
          <Button variant="link" onClick={handleRegisterRedirect}>
            Registrarse
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CalendarCompact;






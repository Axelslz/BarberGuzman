// src/pages/HomePageAfterLogin.jsx
import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate

const HomePageAfterLogin = () => {
  const navigate = useNavigate(); // Inicializa useNavigate

  return (
    <Container className="my-5 text-center">
      <h1 className="mb-4">Bienvenido a tu Espacio en Barber Guzmán</h1>
      <p className="lead">
        Aquí puedes gestionar tus citas, explorar nuestros servicios y mantenerte al día.
      </p>
      <Row className="justify-content-center mt-5">
        <Col md={6} lg={4}>
          <Button 
            variant="primary" 
            size="lg" 
            className="w-100 mb-3" 
            onClick={() => navigate('/calendar')}
          >
            Agendar una Cita
          </Button>
        </Col>
        <Col md={6} lg={4}>
          <Button 
            variant="outline-secondary" 
            size="lg" 
            className="w-100 mb-3" 
            onClick={() => navigate('/about')}
          >
            Conocer Sobre Nosotros
          </Button>
        </Col>
      </Row>
      {/* Puedes añadir más contenido o un dashboard aquí */}
    </Container>
  );
};

export default HomePageAfterLogin;
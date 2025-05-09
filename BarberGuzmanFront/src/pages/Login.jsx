import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Card, Alert } from "react-bootstrap";
import ForgotPasswordModal from "../components/ForgotPasswordModal";

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Obtener los usuarios almacenados en localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Buscar el usuario que coincide con las credenciales
    const found = users.find((u) => u.correo === correo && u.password === password);

    if (found) {
      // Guardar el usuario logueado en el localStorage
      localStorage.setItem('loggedUser', JSON.stringify(found));
      onLogin(); // Actualizar el estado global de login
      navigate('/calendar'); // Redirigir al Home
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <Card style={{ width: "100%", maxWidth: "400px" }} className="p-4">
        <h3 className="text-center mb-4">Iniciar Sesión</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Correo electrónico</Form.Label>
            <Form.Control
              type="email"
              placeholder="Ingresa tu correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <div className="d-grid gap-2">
            <Button variant="primary" type="submit">Iniciar sesión</Button>
          </div>

          <div className="text-center mt-3">
            <Button variant="link" onClick={() => setShowModal(true)}>¿Olvidaste tu contraseña?</Button>
          </div>

          <div className="text-center mt-2">
            ¿Aún no tienes una cuenta?{' '}
            <Button variant="link" onClick={() => navigate('/register')} className="p-0">Regístrate</Button>
          </div>
        </Form>

        <ForgotPasswordModal show={showModal} handleClose={() => setShowModal(false)} />
      </Card>
    </Container>
  );
};

export default Login;



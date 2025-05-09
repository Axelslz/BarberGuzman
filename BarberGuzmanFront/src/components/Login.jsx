import React, { useState } from 'react';
import { Form, Button, Alert, Container } from 'react-bootstrap';

const Login = ({ onLogin }) => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const found = users.find((u) => u.correo === correo && u.password === password);

    if (found) {
      localStorage.setItem('loggedUser', JSON.stringify(found));
      onLogin();
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <Container className="mt-4" style={{ maxWidth: '500px' }}>
      <h3>Login</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Correo</Form.Label>
          <Form.Control type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Form.Group>
        <Button type="submit" variant="success">Iniciar sesión</Button>
      </Form>
    </Container>
  );
};

export default Login;

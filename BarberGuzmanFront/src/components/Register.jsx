import React, { useState } from 'react';
import { Form, Button, Alert, Container } from 'react-bootstrap';

const Register = () => {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const { nombre, apellido, correo, password, confirmPassword } = form;

    if (!nombre || !apellido || !correo || !password || !confirmPassword) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const exists = users.some((u) => u.correo === correo);
    if (exists) {
      setError('El correo ya está registrado.');
      return;
    }

    users.push({ nombre, apellido, correo, password });
    localStorage.setItem('users', JSON.stringify(users));
    setSuccess('Usuario registrado con éxito. Ahora inicia sesión.');
    setForm({ nombre: '', apellido: '', correo: '', password: '', confirmPassword: '' });
    setError('');
  };

  return (
    <Container className="mt-4" style={{ maxWidth: '500px' }}>
      <h3>Registro</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control type="text" name="nombre" value={form.nombre} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Apellido</Form.Label>
          <Form.Control type="text" name="apellido" value={form.apellido} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Correo</Form.Label>
          <Form.Control type="email" name="correo" value={form.correo} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control type="password" name="password" value={form.password} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Confirmar Contraseña</Form.Label>
          <Form.Control type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />
        </Form.Group>
        <Button type="submit" variant="primary">Registrarse</Button>
      </Form>
    </Container>
  );
};

export default Register;

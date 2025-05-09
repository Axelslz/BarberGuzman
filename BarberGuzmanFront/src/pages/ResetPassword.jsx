// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { Container, Form, Button, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const tokenVerified = localStorage.getItem("tokenVerified");
    if (tokenVerified !== "true") {
      navigate("/verify-token");
    }
  }, [navigate]);

  const handleReset = () => {
    if (newPassword !== confirmedPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    // Simulación de cambio de contraseña
    alert("Contraseña restablecida correctamente (simulado)");
    localStorage.removeItem("resetToken");
    localStorage.removeItem("tokenVerified");
    localStorage.removeItem("resetEmail");
    navigate("/login");
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <Card style={{ width: "100%", maxWidth: "400px" }} className="p-4">
        <h3 className="text-center mb-4">Restablecer Contraseña</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nueva contraseña</Form.Label>
            <Form.Control
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Confirmar contraseña</Form.Label>
            <Form.Control
              type="password"
              value={confirmedPassword}
              onChange={(e) => setConfirmedPassword(e.target.value)}
            />
          </Form.Group>
          <div className="d-grid">
            <Button onClick={handleReset} variant="success">
              Cambiar contraseña
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
};

export default ResetPassword;


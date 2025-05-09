// src/pages/VerifyToken.jsx
import React, { useState } from "react";
import { Container, Form, Button, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const VerifyToken = () => {
  const [tokenInput, setTokenInput] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    const savedToken = localStorage.getItem("resetToken");

    if (tokenInput.length !== 4 || isNaN(tokenInput)) {
      setError("El token debe ser un número de 4 dígitos.");
      return;
    }

    if (tokenInput !== savedToken) {
      setError("Token incorrecto.");
      return;
    }

    // Marca que el token fue verificado
    localStorage.setItem("tokenVerified", "true");
    navigate("/reset-password");
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <Card style={{ width: "100%", maxWidth: "400px" }} className="p-4">
        <h3 className="text-center mb-4">Verificar Token</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Ingresa el token de 4 dígitos</Form.Label>
            <Form.Control
              type="text"
              maxLength={4}
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="1234"
            />
          </Form.Group>
          <div className="d-grid">
            <Button variant="primary" onClick={handleSubmit}>
              Verificar
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
};

export default VerifyToken;

import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const ForgotPasswordModal = ({ show, handleClose }) => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSend = () => {
    // Simular token local
    const token = Math.floor(1000 + Math.random() * 9000); 
    localStorage.setItem("resetToken", token);
    localStorage.setItem("resetEmail", email);
    alert(`Token generado (simulado): ${token}`);
    handleClose();
    navigate("/reset-password");
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Recuperar contraseña</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Correo electrónico</Form.Label>
            <Form.Control
              type="email"
              placeholder="Ingresa tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSend}>
          Enviar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ForgotPasswordModal;

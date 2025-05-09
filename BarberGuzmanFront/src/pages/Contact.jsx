import React from 'react';
import { Container } from 'react-bootstrap'; // Si usas componentes de Bootstrap

const Contact = () => {
  return (
    <Container className="my-5">
      <h1 className="text-center">Contáctanos</h1>
      <p className="text-center">
        Aquí puedes encontrar nuestra información de contacto o un formulario para que tus clientes se comuniquen contigo.
        Puedes añadir más detalles aquí:
      </p>
      <div className="text-center mt-4">
        <p><strong>Email:</strong> info@barberguzman.com</p>
        <p><strong>Teléfono:</strong> +52 123 456 7890</p>
        <p><strong>Dirección:</strong> Calle de los Barberos #123, Ciudad, País</p>
      </div>
      
    </Container>
  );
};

export default Contact;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa'; // Importamos FaTimes para el icono de cerrar
import '../assets/css/Sidebar.css'; // Asegúrate de tener los estilos

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* El icono de hamburguesa solo se muestra cuando el menú está cerrado */}
      {!isOpen && (
        <div className="hamburger" onClick={toggleSidebar}>
          <FaBars />
        </div>
      )}

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Botón para cerrar el sidebar dentro del propio sidebar */}
        <div className="close-sidebar" onClick={toggleSidebar}>
          <FaTimes />
        </div>
        <h2>Menú</h2>
        <Link to="/calendar" onClick={toggleSidebar}>Agendar</Link> {/* Cierra el sidebar al hacer clic en un enlace */}
        <Link to="/about" onClick={toggleSidebar}>Sobre mí</Link>     {/* Cierra el sidebar al hacer clic en un enlace */}
        <Link to="/contact" onClick={toggleSidebar}>Contacto</Link>
      </div>
    </>
  );
};

export default Sidebar;

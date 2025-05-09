import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CalendarPage from './pages/CalendarPage';
import About from './pages/About';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from "./pages/ResetPassword";
import VerifyToken from "./pages/VerifyToken";
import MainLayout from './components/MainLayout';
import Contact from './pages/Contact';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('loggedUser'));

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem('loggedUser');
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        {/* Vistas públicas sin menú */}
        <Route path="/" element={<Home onLogin={handleLogin} isLoggedIn={isLoggedIn} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-token" element={<VerifyToken />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Vistas privadas con menú */}
        {isLoggedIn && (
          <>
            <Route path="/calendar" element={<MainLayout><CalendarPage /></MainLayout>} />
            <Route path="/about" element={<MainLayout><About /></MainLayout>} />
            <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;





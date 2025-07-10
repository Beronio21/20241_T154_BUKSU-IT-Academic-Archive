import React from 'react';
import { useNavigate } from 'react-router-dom';
import bukSULogo from '../Images/logobuksu.jpg';

const MainNavbar = ({ onLoginClick, showLogin }) => {
  const navigate = useNavigate();

  return (
    <div className="navbar navbar-expand-lg navbar-light bg-light w-100" style={{margin: 0, padding: 0, position: 'sticky', top: 0, zIndex: 100}}>
      <div className="w-100 d-flex justify-content-between align-items-center px-4">
        <div className="d-flex align-items-center">
          <img src={bukSULogo} alt="BukSU Logo" style={{width: "45px", height: "45px", marginRight: "12px"}}/>
          <div>
            <div className="navbar-brand-text">IT Capstone Archive</div>
            <div className="navbar-subtitle">Bukidnon State University</div>
          </div>
        </div>
        <div className="d-flex align-items-center">
          <a href="#home" className="nav-link" onClick={() => navigate('/')}>Home</a>
          <a href="#browse" className="nav-link" onClick={() => navigate('/')}>Browse Projects</a>
          <a href="#about" className="nav-link" onClick={() => navigate('/')}>About</a>
          <a href="#contact" className="nav-link" onClick={() => navigate('/contact')}>Contact</a>
          {onLoginClick && (
            <button 
              className="nav-login-btn"
              onClick={onLoginClick}
            >
              {showLogin ? "Close Login" : "Login"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainNavbar; 
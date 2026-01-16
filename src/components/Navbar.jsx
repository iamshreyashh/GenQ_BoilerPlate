import React, { useState, useRef } from 'react';
import './Navbar.css';

const Navbar = ({ onLoginClick }) => {
  const [helpDropdownOpen, setHelpDropdownOpen] = useState(false);
  const [contactDropdownOpen, setContactDropdownOpen] = useState(false);
  const helpTimeoutRef = useRef(null);
  const contactTimeoutRef = useRef(null);

  const handleHelpEnter = () => {
    // Clear any pending close timeout
    if (helpTimeoutRef.current) {
      clearTimeout(helpTimeoutRef.current);
      helpTimeoutRef.current = null;
    }
    setHelpDropdownOpen(true);
    setContactDropdownOpen(false);
  };

  const handleHelpLeave = () => {
    // Set a timeout to close after 1 second
    helpTimeoutRef.current = setTimeout(() => {
      setHelpDropdownOpen(false);
    }, 1000);
  };

  const handleContactEnter = () => {
    // Clear any pending close timeout
    if (contactTimeoutRef.current) {
      clearTimeout(contactTimeoutRef.current);
      contactTimeoutRef.current = null;
    }
    setContactDropdownOpen(true);
    setHelpDropdownOpen(false);
  };

  const handleContactLeave = () => {
    // Set a timeout to close after 1 second
    contactTimeoutRef.current = setTimeout(() => {
      setContactDropdownOpen(false);
    }, 1000);
  };

  return (
    <nav className="navbar glass">
      <div className="navbar-container">
        <div className="navbar-left">
          <div
            className="navbar-item dropdown"
            onMouseEnter={handleHelpEnter}
            onMouseLeave={handleHelpLeave}
          >
            <a href="#help" onClick={(e) => e.preventDefault()}>Help</a>
            {helpDropdownOpen && (
              <div
                className="dropdown-menu"
                onMouseEnter={handleHelpEnter}
                onMouseLeave={handleHelpLeave}
              >
                <a href="#navigate-portal" className="dropdown-item">Navigate Portal</a>
                <a href="#faq" className="dropdown-item">FAQ</a>
              </div>
            )}
          </div>

          <div
            className="navbar-item dropdown"
            onMouseEnter={handleContactEnter}
            onMouseLeave={handleContactLeave}
          >
            <a href="#contact" onClick={(e) => e.preventDefault()}>Contact Us</a>
            {contactDropdownOpen && (
              <div
                className="dropdown-menu"
                onMouseEnter={handleContactEnter}
                onMouseLeave={handleContactLeave}
              >
                <a href="mailto:support@amber.com" className="dropdown-item">Email</a>
                <a href="tel:+918081900000" className="dropdown-item">+91 808190XX</a>
              </div>
            )}
          </div>

          <div className="navbar-item">
            <a href="#company">Company</a>
          </div>
        </div>

        <div className="navbar-logo">
          <a href="/" className="logo-text">Amber</a>
        </div>

        <div className="navbar-actions">
          <button className="btn btn-primary" onClick={onLoginClick}>
            Login
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

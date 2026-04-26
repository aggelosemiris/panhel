import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

const navItems = [
  { href: '/app', label: 'Dashboard', enabled: true },
  { href: '/textbook', label: 'Θεωρία', enabled: true },
  { href: '/tests/chapter', label: 'Διαγωνίσματα', enabled: true },
  { href: '/generator', label: 'Generator', enabled: true },
  { href: '/panic-mode', label: 'SOS Θέματα', enabled: true },
  { href: '/single-topics', label: 'Μεμονωμένα', enabled: true },
  { href: '/profile', label: 'Στατιστικά', enabled: false },
  { href: '/specialized-teacher', label: 'Cortex AI', enabled: false },
];

export default function Navigation() {
  const { currentUser, isAuthenticated, logoutUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="product-navbar-v2">
      <div className="product-navbar-inner-v2">
        <button 
          className="product-brand-v2 product-brand-button-v2" 
          onClick={toggleMenu}
          type="button"
          aria-expanded={isMenuOpen}
          aria-label="Άνοιγμα μενού"
        >
          <span className="product-brand-mark-v2">Ψ</span>
          <span className="product-brand-copy-v2">
            <small>ΨΗΦΙΑΚΟΦΡΟΝΤΙΣΤΗΡΙΟ+</small>
            <strong>Dashboard</strong>
          </span>
        </button>

        {isMenuOpen && (
          <div className="product-menu-dropdown-v2">
            <div className="product-menu-header-v2">
              <strong>Πλοήγηση</strong>
              <button 
                className="product-menu-close-v2" 
                onClick={closeMenu}
                type="button"
                aria-label="Κλείσιμο μενού"
              >
                ✕
              </button>
            </div>
            <div className="product-menu-items-v2">
              {navItems.map((item) => {
                const enabled = item.enabled || isAuthenticated;

                return enabled ? (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) => `product-menu-link-v2 ${isActive ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    {item.label}
                  </NavLink>
                ) : (
                  <span key={item.href} className="product-menu-link-v2 disabled" title="Διατίθεται μόνο για εγγεγραμμένους χρήστες">
                    {item.label}
                  </span>
                );
              })}
            </div>
            <div className="product-menu-divider-v2"></div>
            <div className="product-menu-user-v2">
              {isAuthenticated ? (
                <>
                  <div className="product-menu-user-info-v2">
                    <strong>{currentUser?.username ?? 'student'}</strong>
                  </div>
                  <button 
                    className="product-menu-logout-v2" 
                    onClick={() => {
                      logoutUser();
                      closeMenu();
                    }}
                    type="button"
                  >
                    Αποσύνδεση
                  </button>
                </>
              ) : (
                <>
                  <NavLink 
                    className="product-menu-link-v2" 
                    to="/login"
                    onClick={closeMenu}
                  >
                    Σύνδεση
                  </NavLink>
                  <NavLink 
                    className="product-menu-link-v2 primary" 
                    to="/register"
                    onClick={closeMenu}
                  >
                    Εγγραφή
                  </NavLink>
                </>
              )}
            </div>
          </div>
        )}

        <div className="product-nav-links-v2">
          {navItems.map((item) => {
            const enabled = item.enabled || isAuthenticated;

            return enabled ? (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) => `product-nav-link-v2 ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </NavLink>
            ) : (
              <span key={item.href} className="product-nav-link-v2 disabled">
                {item.label}
              </span>
            );
          })}
        </div>

        <div className="product-user-area-v2">
          {isAuthenticated ? (
            <>
              <span className="product-user-chip-v2">
                <strong>{currentUser?.username ?? 'student'}</strong>
                <i>{(currentUser?.username ?? 'S').slice(0, 2).toUpperCase()}</i>
              </span>
              <button className="product-user-button-v2" onClick={logoutUser} type="button">
                Αποσύνδεση
              </button>
            </>
          ) : (
            <>
              <NavLink className="product-user-button-v2" to="/login">
                Σύνδεση
              </NavLink>
              <NavLink className="product-user-button-v2 primary" to="/register">
                Εγγραφή
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

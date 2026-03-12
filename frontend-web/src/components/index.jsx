import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LogOut, Bell, User, LayoutDashboard, 
  MessageSquare, BarChart2, Users, Package, Menu, X 
} from 'lucide-react';

// --- Header.jsx ---
export const Header = ({ user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/chat', icon: MessageSquare, label: 'AI Assistant' },
    ...(user?.role === 'Manager' ? [
      { path: '/employees', icon: Users, label: 'Personnel' },
      { path: '/reports', icon: BarChart2, label: 'Reports' }
    ] : []),
  ];

  return (
    <>
      <header className="d-flex align-items-center justify-content-between p-3 px-4 mb-4 rounded-4 shadow-sm mx-3 mt-3 transition-all" style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-link p-0 d-lg-none"
            onClick={() => setMobileMenuOpen(true)}
            style={{ color: 'var(--text-dim)' }}
          >
            <Menu size={24} />
          </button>
          <div className="fs-3 fw-bolder" style={{ color: 'var(--primary)' }}>
            Warey
          </div>
        </div>
        <div className="d-flex align-items-center gap-4">
          <button className="btn btn-link p-0 position-relative transition-hover shadow-none" style={{ color: 'var(--text-dim)' }}>
            <Bell size={20} />
            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border rounded-circle"></span>
          </button>
          
          <div className="d-flex align-items-center gap-2 ms-2">
            <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <User size={16} style={{ color: 'var(--primary)' }} />
            </div>
            <span className="fw-bold d-none d-sm-block" style={{ color: 'var(--text-main)' }}>{user?.name || 'Guest'}</span>
          </div>

          <button 
            onClick={onLogout} 
            className="btn btn-sm d-flex align-items-center gap-2 rounded-pill px-4 py-2 transition-hover ms-2" 
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
          >
            <LogOut size={16} />
            <span className="d-none d-sm-block fw-medium">Logout</span>
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="mobile-nav">
          <div className="mobile-nav-header d-flex justify-content-between align-items-center p-3">
            <div className="fs-4 fw-bold" style={{ color: 'var(--primary)' }}>Menu</div>
            <button className="btn btn-link p-0" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-dim)' }}>
              <X size={24} />
            </button>
          </div>
          <nav className="d-flex flex-column p-3">
            {menuItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`d-flex align-items-center gap-2 py-2 px-3 rounded ${isActive ? 'bg-primary text-white' : 'text-white-75'}`}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ textDecoration: 'none' }}
                >
                  <item.icon size={20} style={{ color: isActive ? '#fff' : undefined }} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
};

// --- Sidebar.jsx ---
export const Sidebar = ({ role }) => {
  const location = useLocation();
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/chat', icon: MessageSquare, label: 'AI Assistant' },
    ...(role === 'Manager' ? [
      { path: '/employees', icon: Users, label: 'Personal' },
      { path: '/reports', icon: BarChart2, label: 'Reports' }
    ] : []),
  ];

  return (
    <nav 
      className="p-3 m-3 rounded-4 shadow-sm d-none d-lg-block border-0" 
      style={{ width: '260px', minHeight: 'calc(100vh - 40px)', backgroundColor: '#0f172a' }}
    >
      <ul className="nav flex-column gap-2 m-0 p-0 mt-3" style={{ listStyle: 'none' }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li key={item.path} className="nav-item">
              <Link 
                to={item.path} 
                className={`d-flex align-items-center gap-3 p-3 rounded-3 text-decoration-none fw-semibold transition-all ${
                  isActive 
                    ? 'bg-primary text-white shadow' 
                    : 'text-white-50 hover-bg-dark-glass'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-white' : ''} />
                <span style={{ letterSpacing: '0.3px' }}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

// --- StockCard.jsx ---
export const StockCard = ({ item, isManager }) => {
  const isAvailable = item.availability;
  const isLowStock = item.quantity < 10;

  return (
    <div className="shadow-sm rounded-4 p-3 mb-3 d-flex flex-row justify-content-between align-items-center transition-hover" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
      <div className="d-flex align-items-center gap-3">
        {/* Left Side Icon Block */}
        <div 
          className="rounded-3 p-3 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: isAvailable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}
        >
          <Package size={24} color={isAvailable ? '#10b981' : '#ef4444'} />
        </div>
        
        {/* Item Details */}
        <div>
          <h5 className="mb-1 fw-bolder" style={{ color: 'var(--text-main)' }}>{item.name}</h5>
          <p className="mb-2 small d-flex align-items-center gap-2" style={{ color: 'var(--text-dim)' }}>
            <span className="fw-bold" style={{ color: 'var(--text-main)' }}>ID:</span> {item.id} 
            <span>•</span> 
            <span className="fw-bold" style={{ color: 'var(--text-main)' }}>Loc:</span> {item.location}
          </p>
          <div className="d-flex align-items-center gap-3">
            <span 
              className="badge rounded-pill px-3 py-2 fw-bold" 
              style={{ 
                backgroundColor: isAvailable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                color: isAvailable ? '#10b981' : '#ef4444' 
              }}
            >
              {isAvailable ? 'Available' : 'Unavailable'}
            </span>
            <span className="fw-bold small" style={{ color: isLowStock ? '#ef4444' : 'var(--text-dim)' }}>
              {item.quantity} units
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      {isManager && (
        <button className="btn btn-sm rounded-pill px-4 py-2 fw-semibold transition-hover" style={{ color: 'var(--primary)', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--primary)' }}>
          Update
        </button>
      )}
    </div>
  );
};

// --- ChatBubble.jsx ---
export const ChatBubble = ({ message }) => (
  <div className={`d-flex w-100 mb-3 ${message.isBot ? 'justify-content-start' : 'justify-content-end'}`}>
    <div 
      className="shadow-sm" 
      style={{
        padding: '1rem 1.25rem',
        maxWidth: '75%',
        borderRadius: message.isBot ? '4px 18px 18px 18px' : '18px 18px 4px 18px',
        lineHeight: '1.6',
        fontSize: '0.95rem',
        backgroundColor: message.isBot ? 'var(--surface)' : 'var(--primary)',
        color: message.isBot ? 'var(--text-main)' : '#fff',
        border: message.isBot ? '1px solid var(--glass-border)' : 'none'
      }}
    >
      {message.text}
    </div>
  </div>
);
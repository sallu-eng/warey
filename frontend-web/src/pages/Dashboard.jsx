import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  LogOut, Bell, User, LayoutDashboard, MessageSquare, 
  BarChart2, Settings, Users, Package, AlertTriangle, 
  ArrowRight, RefreshCw, Loader, Clock, ServerCrash, CheckCircle 
} from 'lucide-react';

// --- Header.jsx ---
export const Header = ({ user, onLogout }) => (
  <header className="glass d-flex align-items-center justify-content-between p-3 mb-4 rounded-4 shadow-sm mx-3 mt-3">
    <div className="fs-3 fw-bolder" style={{ 
        background: 'linear-gradient(45deg, #0d6efd, #0dcaf0)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    }}>
      Warey
    </div>
    <div className="d-flex align-items-center gap-4">
      <div className="position-relative cursor-pointer">
        <Bell size={22} className="text-secondary transition-all hover-text-dark" />
        <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
          <span className="visually-hidden">New alerts</span>
        </span>
      </div>
      <div className="d-flex align-items-center gap-2 border-start ps-4">
        <div className="bg-primary bg-opacity-10 rounded-circle p-2 d-flex align-items-center justify-content-center">
          <User size={18} className="text-primary" />
        </div>
        <span className="fw-semibold text-dark d-none d-sm-block">{user?.name || 'Guest'}</span>
      </div>
      <button 
        onClick={onLogout} 
        className="btn btn-sm btn-light text-danger d-flex align-items-center gap-2 rounded-pill px-3 fw-medium transition-hover"
      >
        <LogOut size={16} />
        <span className="d-none d-sm-block">Logout</span>
      </button>
    </div>
  </header>
);

// --- Sidebar.jsx ---
export const Sidebar = ({ role }) => {
  const location = useLocation();
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/chat', icon: MessageSquare, label: 'AI Assistant' },
    ...(role === 'Manager' ? [
      { path: '/employees', icon: Users, label: 'Personnel' },
      { path: '/reports', icon: BarChart2, label: 'Reports' }
    ] : []),
  ];

  return (
    <nav className="sidebar glass p-3 m-3 rounded-4 shadow-sm d-none d-lg-block" style={{ width: '260px', minHeight: 'calc(100vh - 40px)' }}>
      <ul className="nav flex-column gap-2 m-0 p-0" style={{ listStyle: 'none' }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li key={item.path} className="nav-item">
              <Link 
                to={item.path} 
                className={`d-flex align-items-center gap-3 p-3 rounded-3 text-decoration-none fw-medium transition-all ${
                  isActive 
                    ? 'bg-primary bg-opacity-10 text-primary shadow-sm' 
                    : 'text-secondary hover-bg-light'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-primary' : 'text-muted'} />
                <span>{item.label}</span>
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
  const isLowStock = item.quantity < 10;
  
  return (
    <div className="glass card border-0 shadow-sm rounded-4 p-3 d-flex flex-row justify-content-between align-items-center transition-hover">
      <div className="d-flex align-items-center gap-3">
        <div className={`p-3 rounded-3 ${item.availability ? 'bg-success' : 'bg-danger'} bg-opacity-10`}>
          <Package className={item.availability ? 'text-success' : 'text-danger'} size={24} />
        </div>
        <div>
          <h5 className="mb-1 fw-bold text-dark">{item.name}</h5>
          <p className="mb-2 small text-muted d-flex align-items-center gap-2">
            <span className="fw-semibold">ID:</span> {item.id} 
            <span className="text-black-50">•</span> 
            <span className="fw-semibold">Loc:</span> {item.location}
          </p>
          <div className="d-flex align-items-center gap-2 mt-1">
            <span className={`badge ${item.availability ? 'bg-success' : 'bg-danger'} bg-opacity-10 ${item.availability ? 'text-success' : 'text-danger'} rounded-pill px-2 py-1`}>
              {item.availability ? 'Available' : 'Unavailable'}
            </span>
            <span className={`small fw-bold ${isLowStock ? 'text-danger' : 'text-secondary'}`}>
              {item.quantity} units {isLowStock && item.availability && ' (Low Stock)'}
            </span>
          </div>
        </div>
      </div>
      {isManager && (
        <button className="btn btn-outline-primary btn-sm rounded-pill px-4 fw-medium transition-hover">
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
      className={`glass shadow-sm ${message.isBot ? 'bg-white text-dark border-light' : 'bg-primary text-white border-primary'}`} 
      style={{
        padding: '1rem 1.25rem',
        maxWidth: '75%',
        borderRadius: message.isBot ? '4px 20px 20px 20px' : '20px 20px 4px 20px',
        lineHeight: '1.6',
        fontSize: '0.95rem'
      }}
    >
      {message.text}
    </div>
  </div>
);

// --- Dashboard.jsx ---
const Dashboard = ({ user }) => {
    const [items, setItems] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showAllItems, setShowAllItems] = useState(false);

    const fetchData = useCallback(async (showRefreshIndicator = false) => {
        if (showRefreshIndicator) setIsRefreshing(true);
        setError(null);
        
        try {
            const [itemsRes, auditRes] = await Promise.all([
                axios.get('http://localhost:3000/api/items'),
                axios.get('http://localhost:3000/api/audit')
            ]);
            setItems(itemsRes.data);
            setLogs(auditRes.data.reverse().slice(0, 5)); 
            setLastUpdated(new Date());
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            setError("Failed to connect to the server. Please try again.");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center py-5">
                <Loader size={48} className="spin-animation mb-3" style={{ color: 'var(--primary)' }} />
                <h4 className="fw-bold" style={{ color: 'var(--text-main)' }}>Waking up the warehouse...</h4>
                <p style={{ color: 'var(--text-dim)' }}>Loading your dashboard data.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center py-5">
                <div className="p-4 rounded-circle mb-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                    <ServerCrash size={48} style={{ color: '#ef4444' }} />
                </div>
                <h3 className="mb-2 fw-bold" style={{ color: 'var(--text-main)' }}>Connection Lost</h3>
                <p className="mb-4 max-w-md mx-auto" style={{ color: 'var(--text-dim)' }}>{error}</p>
                <button className="btn d-flex align-items-center gap-2 rounded-pill px-4" style={{ backgroundColor: 'var(--primary)', color: '#fff' }} onClick={() => fetchData(true)}>
                    <RefreshCw size={18} className={isRefreshing ? "spin-animation" : ""} /> Retry Connection
                </button>
            </div>
        );
    }

    const lowStockItems = items.filter(i => i.quantity < 10);
    const displayedItems = showAllItems ? items : items.slice(0, 10);

    return (
        <div className="container-fluid py-4 px-3 px-md-4">
            {/* Header Section */}
            <header className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-5 gap-3">
                <div>
                    <h2 className="mb-1 fw-bolder" style={{ color: 'var(--text-main)' }}>
                        Overview
                    </h2>
                    <p className="mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--text-dim)' }}>
                        <span className="fw-medium">Role: {user?.role || 'Guest'}</span> 
                        <span className="opacity-50">•</span> 
                        <span className="badge rounded-pill d-flex align-items-center gap-1 px-2 py-1" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                            <span className="rounded-circle" style={{ width: '6px', height: '6px', backgroundColor: '#10b981' }}></span>
                            System Active
                        </span>
                    </p>
                </div>

                <div className="d-flex flex-column align-items-md-end text-start text-md-end">
                    <button 
                        onClick={() => fetchData(true)}
                        className="btn d-flex align-items-center gap-2 rounded-pill px-3 fw-medium transition-hover" 
                        disabled={isRefreshing}
                        style={{ backgroundColor: 'var(--surface-hover)', borderColor: 'var(--glass-border)', color: 'var(--primary)', border: '1px solid var(--glass-border)' }}
                    >
                        <RefreshCw size={16} className={isRefreshing ? 'spin-animation' : ''} />
                        {isRefreshing ? 'Syncing...' : 'Sync Data'}
                    </button>
                    {lastUpdated && (
                        <p className="small mt-2 mb-0 d-flex align-items-center gap-1" style={{ color: 'var(--text-dim)' }}>
                            <CheckCircle size={12} style={{ color: '#10b981' }} /> 
                            Updated today at {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    )}
                </div>
            </header>

            {/* KPI Cards */}
            <div className="row g-4 mb-5">
                <div className="col-12 col-md-4">
                    <div className="rounded-4 p-4 h-100 transition-hover position-relative overflow-hidden" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
                        <div className="position-absolute top-0 start-0 w-100" style={{ height: '4px', backgroundColor: 'var(--primary)' }}></div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="fw-semibold text-uppercase tracking-wider small" style={{ color: 'var(--text-dim)' }}>Total Active SKUs</span>
                            <div className="p-2 rounded-circle" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                                <Package className="text-primary" size={20} style={{ color: 'var(--primary)' }} />
                            </div>
                        </div>
                        <h2 className="display-5 fw-bolder mb-0" style={{ color: 'var(--text-main)' }}>{items.length}</h2>
                    </div>
                </div>

                <div className="col-12 col-md-4">
                    <div className="rounded-4 p-4 h-100 transition-hover position-relative overflow-hidden" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
                        <div className="position-absolute top-0 start-0 w-100" style={{ height: '4px', backgroundColor: lowStockItems.length > 0 ? '#ef4444' : '#10b981' }}></div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="fw-semibold text-uppercase tracking-wider small" style={{ color: 'var(--text-dim)' }}>Stock Alerts</span>
                            <div className="p-2 rounded-circle" style={{ backgroundColor: lowStockItems.length > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)' }}>
                                <AlertTriangle size={20} style={{ color: lowStockItems.length > 0 ? '#ef4444' : '#10b981' }} />
                            </div>
                        </div>
                        <h2 className="display-5 fw-bolder mb-0" style={{ color: 'var(--text-main)' }}>{lowStockItems.length}</h2>
                        <p className="small fw-medium mt-2 mb-0" style={{ color: lowStockItems.length > 0 ? '#ef4444' : '#10b981' }}>
                            {lowStockItems.length > 0 ? 'Requires immediate attention' : 'Inventory levels healthy'}
                        </p>
                    </div>
                </div>

                <div className="col-12 col-md-4">
                    <div className="rounded-4 p-4 h-100 transition-hover position-relative overflow-hidden" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
                        <div className="position-absolute top-0 start-0 w-100" style={{ height: '4px', backgroundColor: '#8b5cf6' }}></div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="fw-semibold text-uppercase tracking-wider small" style={{ color: 'var(--text-dim)' }}>Active Staff</span>
                            <div className="p-2 rounded-circle" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                                <Users size={20} style={{ color: '#8b5cf6' }} />
                            </div>
                        </div>
                        <h2 className="display-5 fw-bolder mb-0" style={{ color: 'var(--text-main)' }}>12</h2>
                        <p className="small fw-medium mt-2 mb-0" style={{ color: 'var(--text-dim)' }}>Across 3 warehouse zones</p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="row g-4">
                {/* Inventory List Section */}
                <section className="col-12 col-lg-8">
                    <div className="rounded-4 p-4 h-100" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4 pb-2" style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <h5 className="mb-0 d-flex align-items-center gap-2 fw-bold" style={{ color: 'var(--text-main)' }}>
                                <Package size={22} style={{ color: 'var(--primary)' }} /> Inventory Overview
                            </h5>
                            
                            {items.length > 10 && (
                                <button 
                                    onClick={() => setShowAllItems(!showAllItems)}
                                    className="btn btn-sm d-flex align-items-center gap-2 rounded-pill px-3 fw-semibold transition-hover"
                                    style={{ backgroundColor: 'var(--surface-hover)', borderColor: 'var(--glass-border)', color: 'var(--primary)', border: '1px solid var(--glass-border)' }}
                                >
                                    {showAllItems ? 'Show Top 10' : 'View Full Directory'} 
                                    <ArrowRight size={16} className={showAllItems ? "rotate-180" : ""} style={{ transition: 'transform 0.3s ease' }} />
                                </button>
                            )}
                        </div>

                        <div className="d-flex flex-column gap-3">
                            {displayedItems.length > 0 ? (
                                displayedItems.map(item => (
                                    <StockCard key={item.id} item={item} isManager={user?.role === 'Manager'} />
                                ))
                            ) : (
                                <div className="text-center py-5">
                                    <div className="rounded-circle d-inline-flex p-4 mb-3" style={{ backgroundColor: 'var(--surface-hover)' }}>
                                        <Package size={48} style={{ color: 'var(--text-dim)', opacity: 0.5 }} />
                                    </div>
                                    <h5 className="fw-bold" style={{ color: 'var(--text-main)' }}>No items found</h5>
                                    <p style={{ color: 'var(--text-dim)' }} className="mb-0">Your inventory directory is currently empty.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Audit Logs Section */}
                <section className="col-12 col-lg-4">
                    <div className="rounded-4 p-4 h-100" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
                        <h5 className="mb-4 pb-2 d-flex align-items-center gap-2 fw-bold" style={{ color: 'var(--text-main)', borderBottom: '1px solid var(--glass-border)' }}>
                            <Clock size={22} style={{ color: 'var(--primary)' }} /> Activity Feed
                        </h5>
                        <div className="d-flex flex-column gap-1">
                            {logs.length > 0 ? (
                                logs.map((log, i) => (
                                    <div key={i} className="py-3 position-relative" style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <span className="badge rounded-pill px-2 py-1 fw-semibold" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                                {log.action}
                                            </span>
                                            <small className="fw-medium" style={{ color: 'var(--text-dim)' }}>
                                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </small>
                                        </div>
                                        <p className="mb-2 small lh-base" style={{ color: 'var(--text-main)' }}>{log.details}</p>
                                        <div className="d-flex align-items-center gap-2 mt-1" style={{ color: 'var(--text-dim)' }}>
                                            <div className="rounded-circle p-1" style={{ backgroundColor: 'rgba(148, 163, 184, 0.1)' }}>
                                                <User size={10} />
                                            </div>
                                            <small className="fw-medium" style={{ fontSize: '0.75rem' }}>
                                                Agent: {log.user}
                                            </small>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-5">
                                    <Clock size={32} style={{ color: 'var(--text-dim)', opacity: 0.25 }} className="mb-2" />
                                    <p className="small" style={{ color: 'var(--text-dim)' }}>No recent activity.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
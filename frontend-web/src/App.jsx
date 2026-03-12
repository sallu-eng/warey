import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import Employees from './pages/Employees';
import Reports from './pages/Reports';
import { Sidebar, Header } from './components/index';

function App() {
    const [user, setUser] = useState(null);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        setUser(null);
    };

    return (
        <Router>
            <div className="app-layout d-flex flex-column vh-100" style={{ backgroundColor: 'var(--app-bg)', color: 'var(--text-main)' }}>
                {user && <Header user={user} onLogout={handleLogout} />}
                <div className="main-container d-flex flex-grow-1 overflow-hidden">
                    {user && <Sidebar role={user.role} />}
                    <main className="content flex-grow-1 overflow-auto p-3 p-md-4">
                        <Routes>
                            <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
                            <Route path="/" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
                            <Route path="/chat" element={user ? <Chatbot user={user} /> : <Navigate to="/login" />} />
                            <Route path="/employees" element={user?.role === 'Manager' ? <Employees /> : <Navigate to="/" />} />
                            <Route path="/reports" element={user?.role === 'Manager' ? <Reports /> : <Navigate to="/" />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </Router>
    );
}

export default App;
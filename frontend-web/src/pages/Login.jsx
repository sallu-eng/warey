import React, { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, User, ArrowLeft, Lock, LayoutDashboard } from 'lucide-react';

const Login = ({ onLogin }) => {
    const [selectedRole, setSelectedRole] = useState(null); 
    const [employeeId, setEmployeeId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setError('');
        setEmployeeId(''); 
    };

    const handleBack = () => {
        setSelectedRole(null);
        setError('');
        setEmployeeId('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('https://wareybe.onrender.com/api/auth', { employeeId });
            
            if (response.data.success) {
                const loggedInUser = response.data.user;
                
                if (loggedInUser.role !== selectedRole) {
                    setError(`Access Denied. This ID belongs to a ${loggedInUser.role}, not a ${selectedRole}.`);
                    return;
                }

                onLogin(loggedInUser);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed. Please check your ID.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 position-relative overflow-hidden" style={{ backgroundColor: 'var(--app-bg)' }}>
            
            {/* Background Decorative Elements */}
            <div className="position-absolute rounded-circle" style={{ top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'var(--primary, #0d6efd)', filter: 'blur(150px)', opacity: '0.2' }}></div>
            <div className="position-absolute rounded-circle" style={{ bottom: '-10%', right: '-10%', width: '400px', height: '400px', background: 'var(--accent, #6610f2)', filter: 'blur(150px)', opacity: '0.2' }}></div>

            <div className="shadow-lg border-0 p-4 p-md-5 z-1 w-100" style={{ maxWidth: '450px', borderRadius: '20px', backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
                
                {/* Header */}
                <div className="text-center mb-4">
                    <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                        <LayoutDashboard size={32} style={{ color: 'var(--primary)' }} />
                        <h1 className="fw-bolder mb-0 fs-2" style={{ color: 'var(--primary)' }}>Warey</h1>
                    </div>
                    <p className="fs-6 mb-0" style={{ color: 'var(--text-dim)' }}>AI Warehouse Assistant</p>
                </div>

                {/* STEP 1: Role Selection */}
                {!selectedRole ? (
                    <div className="fade-in">
                        <h5 className="text-center mb-4 fw-bold" style={{ color: 'var(--text-main)' }}>Select your role to continue</h5>
                        
                        <div className="d-grid gap-3">
                            {/* Manager Button */}
                            <button 
                                onClick={() => handleRoleSelect('Manager')}
                                className="btn border d-flex align-items-center gap-3 p-3 text-start w-100 shadow-sm"
                                style={{ borderRadius: '12px', transition: 'all 0.3s', backgroundColor: 'var(--surface-hover)', borderColor: 'var(--glass-border)', color: 'var(--text-main)' }}
                            >
                                <div className="p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                                    <ShieldCheck size={28} style={{ color: 'var(--primary)' }} />
                                </div>
                                <div>
                                    <h5 className="mb-1 fw-bold" style={{ color: 'var(--text-main)' }}>Manager</h5>
                                    <p className="mb-0 small" style={{ color: 'var(--text-dim)' }}>Full dashboard & inventory control</p>
                                </div>
                            </button>

                            {/* Employee Button */}
                            <button 
                                onClick={() => handleRoleSelect('Employee')}
                                className="btn border d-flex align-items-center gap-3 p-3 text-start w-100 shadow-sm"
                                style={{ borderRadius: '12px', transition: 'all 0.3s', backgroundColor: 'var(--surface-hover)', borderColor: 'var(--glass-border)', color: 'var(--text-main)' }}
                            >
                                <div className="p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                                    <User size={28} style={{ color: '#10b981' }} />
                                </div>
                                <div>
                                    <h5 className="mb-1 fw-bold" style={{ color: 'var(--text-main)' }}>Employee</h5>
                                    <p className="mb-0 small" style={{ color: 'var(--text-dim)' }}>Stock lookup & location assistance</p>
                                </div>
                            </button>
                        </div>
                    </div>
                ) : (
                    
                /* STEP 2: ID Login Form */
                    <div className="fade-in">
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <button 
                                onClick={handleBack}
                                className="btn btn-link p-1 border-0 shadow-none d-flex align-items-center"
                                style={{ color: 'var(--text-dim)' }}
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <h4 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>
                                {selectedRole} Login
                            </h4>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label fw-semibold" style={{ color: 'var(--text-main)' }}>
                                    Enter your Employee ID
                                </label>
                                <div className="input-group input-group-lg">
                                    <span className="input-group-text" style={{ backgroundColor: 'var(--surface-hover)', borderColor: 'var(--glass-border)', color: 'var(--text-dim)' }}>
                                        <Lock size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        style={{ backgroundColor: 'var(--surface-hover)', borderColor: 'var(--glass-border)', color: 'var(--text-main)' }}
                                        value={employeeId}
                                        onChange={(e) => setEmployeeId(e.target.value)}
                                        placeholder={selectedRole === 'Manager' ? "e.g., E001" : "e.g., E002"}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="alert d-flex align-items-start gap-2 py-2 mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}>
                                    <ShieldCheck size={16} className="mt-1 flex-shrink-0" />
                                    <span className="small">{error}</span>
                                </div>
                            )}

                            <button type="submit" className="btn btn-lg w-100 fw-bold" style={{ backgroundColor: 'var(--primary)', color: '#fff' }} disabled={loading}>
                                {loading ? 'Verifying Credentials...' : 'Access System'}
                            </button>
                        </form>

                        <div className="text-center mt-4 small" style={{ color: 'var(--text-dim)' }}>
                            <p className="mb-0">Hint: Use <strong>E001</strong> for Manager, <strong>E002</strong> for Employee.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
    UserPlus, Trash2, Shield, User, Loader2, AlertCircle, 
    CheckCircle2, Inbox, Edit2, Search, Filter, Users 
} from 'lucide-react';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [formData, setFormData] = useState({ id: '', name: '', role: 'Employee' });
    const [isEditing, setIsEditing] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    const [submitting, setSubmitting] = useState(false);
    const [actionId, setActionId] = useState(null); 
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const res = await axios.get('https://wareybe.onrender.com/api/employees');
            setEmployees(res.data);
        } catch (err) {
            console.error(err);
            setFeedback({ type: 'error', message: 'Failed to load employees. Check connection.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFeedback({ type: '', message: '' });
        
        const sanitizedData = {
            id: formData.id.trim().toUpperCase(),
            name: formData.name.trim(),
            role: formData.role
        };

        if (!sanitizedData.id || !sanitizedData.name) {
            setFeedback({ type: 'error', message: 'ID and Name are required.' });
            return;
        }

        setSubmitting(true);
        try {
            if (isEditing) {
                await axios.put(`https://wareybe.onrender.com/api/employees/${sanitizedData.id}`, sanitizedData);
                setFeedback({ type: 'success', message: 'Employee updated successfully!' });
            } else {
                await axios.post('https://wareybe.onrender.com/api/employees/add', sanitizedData);
                setFeedback({ type: 'success', message: 'Employee registered successfully!' });
            }
            
            resetForm();
            fetchEmployees();
            setTimeout(() => setFeedback({ type: '', message: '' }), 3000);
        } catch (err) {
            setFeedback({ 
                type: 'error', 
                message: err.response?.data?.message || `Error ${isEditing ? 'updating' : 'adding'} employee.` 
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`Are you sure you want to remove employee ${id}? This cannot be undone.`)) return;
        
        setActionId(id);
        try {
            await axios.delete(`https://wareybe.onrender.com/api/employees/${id}`);
            setEmployees(prev => prev.filter(emp => emp.id !== id));
            if (isEditing && formData.id === id) resetForm();
        } catch (err) {
            alert('Error deleting employee. They might already be removed.');
        } finally {
            setActionId(null);
        }
    };

    const triggerEdit = (emp) => {
        setFormData({ id: emp.id, name: emp.name, role: emp.role });
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({ id: '', name: '', role: 'Employee' });
        setIsEditing(false);
        setFeedback({ type: '', message: '' });
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              emp.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All' || emp.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const stats = {
        total: employees.length,
        managers: employees.filter(e => e.role === 'Manager').length,
        staff: employees.filter(e => e.role === 'Employee').length
    };

    return (
        <div className="container-fluid py-4">
            <header className="mb-4">
                <h2 className="fw-bold mb-1" style={{ color: 'var(--text-main)' }}>Staff Management</h2>
                <p className="mb-0" style={{ color: 'var(--text-dim)' }}>Manage warehouse employee credentials, access roles, and records.</p>
            </header>

            {/* Quick Stats Row */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-md-4">
                    <div className="shadow-sm border-0 d-flex flex-row align-items-center p-3 h-100" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                        <div className="p-3 rounded-3 me-3" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                            <Users size={24} style={{ color: 'var(--primary)' }} />
                        </div>
                        <div>
                            <p className="small fw-medium mb-0" style={{ color: 'var(--text-dim)' }}>Total Staff</p>
                            <h4 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>{stats.total}</h4>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="shadow-sm border-0 d-flex flex-row align-items-center p-3 h-100" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                        <div className="p-3 rounded-3 me-3" style={{ backgroundColor: 'rgba(251, 146, 60, 0.1)' }}>
                            <Shield size={24} style={{ color: '#fb923c' }} />
                        </div>
                        <div>
                            <p className="small fw-medium mb-0" style={{ color: 'var(--text-dim)' }}>Managers</p>
                            <h4 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>{stats.managers}</h4>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="shadow-sm border-0 d-flex flex-row align-items-center p-3 h-100" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                        <div className="p-3 rounded-3 me-3" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                            <User size={24} style={{ color: '#22c55e' }} />
                        </div>
                        <div>
                            <p className="small fw-medium mb-0" style={{ color: 'var(--text-dim)' }}>Regular Employees</p>
                            <h4 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>{stats.staff}</h4>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* Left Column: Form */}
                <div className="col-12 col-lg-4">
                    <div className="shadow-sm border-0 p-4 sticky-lg-top" style={{ top: '20px', backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                        <div className="d-flex align-items-center justify-content-between mb-4 pb-3" style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <div className="d-flex align-items-center gap-2">
                                {isEditing ? <Edit2 size={22} style={{ color: '#10b981' }} /> : <UserPlus size={22} style={{ color: 'var(--primary)' }} />}
                                <h5 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>{isEditing ? 'Edit Entry' : 'Add New Entry'}</h5>
                            </div>
                            {isEditing && (
                                <button type="button" onClick={resetForm} className="btn btn-sm" style={{ backgroundColor: 'var(--surface-hover)', borderColor: 'var(--glass-border)', color: 'var(--text-dim)', border: '1px solid var(--glass-border)' }}>Cancel</button>
                            )}
                        </div>
                        
                        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                            {feedback.message && (
                                <div className={`alert d-flex align-items-center gap-2 py-2 px-3`} style={{ backgroundColor: feedback.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: feedback.type === 'error' ? '#ef4444' : '#10b981' }}>
                                    {feedback.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                                    <span className="small">{feedback.message}</span>
                                </div>
                            )}

                            <div>
                                <label className="form-label fw-medium small mb-1" style={{ color: 'var(--text-dim)' }}>Employee ID</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{ backgroundColor: 'var(--surface-hover)', borderColor: 'var(--glass-border)', color: 'var(--text-main)' }}
                                    value={formData.id}
                                    onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                                    placeholder="e.g. E-001"
                                    required
                                    disabled={isEditing} 
                                />
                            </div>
                            
                            <div>
                                <label className="form-label fw-medium small mb-1" style={{ color: 'var(--text-dim)' }}>Full Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{ backgroundColor: 'var(--surface-hover)', borderColor: 'var(--glass-border)', color: 'var(--text-main)' }}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. John Smith"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="form-label fw-medium small mb-1" style={{ color: 'var(--text-dim)' }}>Role</label>
                                <select
                                    className="form-select"
                                    style={{ backgroundColor: 'var(--surface-hover)', borderColor: 'var(--glass-border)', color: 'var(--text-main)' }}
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="Employee">Employee</option>
                                    <option value="Manager">Manager</option>
                                </select>
                            </div>
                            
                            <button type="submit" disabled={submitting} className={`btn mt-3 w-100 fw-bold d-flex align-items-center justify-content-center gap-2`} style={{ backgroundColor: isEditing ? '#10b981' : 'var(--primary)', color: '#fff' }}>
                                {submitting ? (
                                    <> <Loader2 size={18} className="spin-animation" /> Processing... </>
                                ) : (
                                    isEditing ? 'Update Employee' : 'Register Employee'
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: List Table */}
                <div className="col-12 col-lg-8">
                    <div className="shadow-sm border-0 p-4 h-100" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                            <h5 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>Active Personnel</h5>
                            
                            {/* Filters & Search */}
                            <div className="d-flex flex-wrap align-items-center gap-2">
                                <div className="input-group" style={{ width: 'auto' }}>
                                    <span className="input-group-text" style={{ backgroundColor: 'var(--surface-hover)', borderColor: 'var(--glass-border)', color: 'var(--text-dim)' }}>
                                        <Search size={16} />
                                    </span>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        style={{ backgroundColor: 'var(--surface-hover)', borderColor: 'var(--glass-border)', color: 'var(--text-main)' }}
                                        placeholder="Search ID or Name..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ minWidth: '150px' }}
                                    />
                                </div>
                                <div className="input-group" style={{ width: 'auto' }}>
                                    <span className="input-group-text" style={{ backgroundColor: 'var(--surface-hover)', borderColor: 'var(--glass-border)', color: 'var(--text-dim)' }}>
                                        <Filter size={16} />
                                    </span>
                                    <select 
                                        className="form-select"
                                        style={{ backgroundColor: 'var(--surface-hover)', borderColor: 'var(--glass-border)', color: 'var(--text-main)', minWidth: '130px' }}
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                    >
                                        <option value="All">All Roles</option>
                                        <option value="Manager">Managers</option>
                                        <option value="Employee">Employees</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div className="table-responsive">
                            {loading ? (
                                <div className="d-flex flex-column align-items-center py-5">
                                    <Loader2 size={32} className="spin-animation mb-2" style={{ color: 'var(--primary)' }} />
                                    <p style={{ color: 'var(--text-dim)' }}>Loading personnel data...</p>
                                </div>
                            ) : filteredEmployees.length === 0 ? (
                                <div className="d-flex flex-column align-items-center py-5 text-center">
                                    <Inbox size={48} style={{ color: 'var(--text-dim)', opacity: 0.5 }} className="mb-3" />
                                    <p style={{ color: 'var(--text-dim)' }}>No employees found matching your criteria.</p>
                                </div>
                            ) : (
                                <table className="table table-hover align-middle mb-0">
                                    <thead>
                                        <tr style={{ backgroundColor: 'var(--surface-hover)', borderBottom: '1px solid var(--glass-border)' }}>
                                            <th className="text-uppercase small fw-bold" style={{ color: 'var(--text-dim)', borderBottom: 'none' }}>ID</th>
                                            <th className="text-uppercase small fw-bold" style={{ color: 'var(--text-dim)', borderBottom: 'none' }}>Name</th>
                                            <th className="text-uppercase small fw-bold" style={{ color: 'var(--text-dim)', borderBottom: 'none' }}>Role</th>
                                            <th className="text-uppercase small fw-bold" style={{ color: 'var(--text-dim)', borderBottom: 'none' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ borderTop: '1px solid var(--glass-border)' }}>
                                        {filteredEmployees.map(emp => (
                                            <tr key={emp.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                <td className="fw-bold" style={{ color: 'var(--text-main)' }}>{emp.id}</td>
                                                <td style={{ color: 'var(--text-main)' }}>{emp.name}</td>
                                                <td>
                                                    <span className={`badge rounded-pill d-inline-flex align-items-center gap-1 px-2 py-1`} style={{ backgroundColor: emp.role === 'Manager' ? 'rgba(251, 146, 60, 0.15)' : 'rgba(59, 130, 246, 0.15)', color: emp.role === 'Manager' ? '#fb923c' : 'var(--primary)' }}>
                                                        {emp.role === 'Manager' ? <Shield size={12} /> : <User size={12} />}
                                                        {emp.role}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <button
                                                            onClick={() => triggerEdit(emp)}
                                                            className="btn btn-sm d-flex align-items-center justify-content-center"
                                                            style={{ backgroundColor: 'var(--surface-hover)', borderColor: 'var(--glass-border)', color: 'var(--text-dim)', border: '1px solid var(--glass-border)' }}
                                                            title={`Edit ${emp.name}`}
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(emp.id)}
                                                            disabled={actionId === emp.id}
                                                            className="btn btn-sm d-flex align-items-center justify-content-center"
                                                            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                                                            title={`Remove ${emp.name}`}
                                                        >
                                                            {actionId === emp.id ? (
                                                                <Loader2 size={16} className="spin-animation" />
                                                            ) : (
                                                                <Trash2 size={16} />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Employees;

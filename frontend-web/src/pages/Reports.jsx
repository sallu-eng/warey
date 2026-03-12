import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
    BarChart2, PieChart as PieIcon, TrendingUp, Download, Loader2, AlertTriangle, Package, Activity 
} from 'lucide-react';
import { 
    ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

const Reports = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get('https://wareybe.onrender.com/api/items')
            .then(res => setItems(res.data))
            .catch(err => setError("Failed to load analytics data."))
            .finally(() => setLoading(false));
    }, []);

    const totalStock = items.reduce((acc, item) => acc + (item.quantity || 0), 0);
    const lowStockCount = items.filter(item => item.quantity < 20).length; 
    const topItems = [...items].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const handleExport = () => {
        if (items.length === 0) return;
        const headers = ["Item ID", "Name", "Quantity", "Availability", "Location"];
        const csvRows = items.map(item => 
            `${item.id},"${item.name}",${item.quantity},${item.availability},"${item.location || 'N/A'}"`
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...csvRows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Warey_Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
            <Loader2 size={40} className="spin-animation" style={{ color: 'var(--primary)' }} />
        </div>
    );

    if (error) return (
        <div className="text-center py-5" style={{ color: '#ef4444' }}>
            <AlertTriangle size={48} className="mb-3" />
            <h3 className="mb-4">{error}</h3>
            <button onClick={() => window.location.reload()} className="btn" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>Try Again</button>
        </div>
    );

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--text-main)' }}>Warehouse Analytics</h2>
                    <p className="mb-0" style={{ color: 'var(--text-dim)' }}>Real-time performance metrics and inventory trends</p>
                </div>
                <button onClick={handleExport} className="btn d-flex align-items-center gap-2 fw-medium shadow-sm w-100 w-md-auto" style={{ backgroundColor: '#10b981', color: '#fff' }}>
                    <Download size={18} /> Export CSV
                </button>
            </header>

            {/* KPI Summary Cards */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-md-4">
                    <div className="shadow-sm border-0 h-100 p-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="small fw-bold" style={{ color: 'var(--text-dim)' }}>Total Items in Stock</span>
                            <Package size={20} style={{ color: 'var(--primary)' }} />
                        </div>
                        <div className="fs-2 fw-bold" style={{ color: 'var(--text-main)' }}>{totalStock.toLocaleString()}</div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="shadow-sm border-0 h-100 p-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="small fw-bold" style={{ color: 'var(--text-dim)' }}>Unique Products</span>
                            <BarChart2 size={20} style={{ color: '#10b981' }} />
                        </div>
                        <div className="fs-2 fw-bold" style={{ color: 'var(--text-main)' }}>{items.length}</div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="shadow-sm border-0 h-100 p-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="small fw-bold" style={{ color: 'var(--text-dim)' }}>Low Stock Alerts</span>
                            <AlertTriangle size={20} style={{ color: lowStockCount > 0 ? '#ef4444' : '#10b981' }} />
                        </div>
                        <div className="fs-2 fw-bold" style={{ color: lowStockCount > 0 ? '#ef4444' : 'var(--text-main)' }}>
                            {lowStockCount}
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="row g-4">
                {/* Bar Chart: Top 5 Items */}
                <div className="col-12 col-lg-6">
                    <div className="shadow-sm border-0 p-4 h-100" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2" style={{ color: 'var(--text-main)' }}>
                            <Activity size={20} style={{ color: 'var(--primary)' }} /> Top 5 Stocked Items
                        </h5>
                        <div className="chart-embed" style={{ width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topItems} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="var(--text-dim)" />
                                    <YAxis axisLine={false} tickLine={false} stroke="var(--text-dim)" />
                                    <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)', backgroundColor: 'var(--surface)', color: 'var(--text-main)' }} />
                                    <Bar dataKey="quantity" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Pie Chart: Distribution */}
                <div className="col-12 col-lg-6">
                    <div className="shadow-sm border-0 p-4 h-100" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2" style={{ color: 'var(--text-main)' }}>
                            <PieIcon size={20} style={{ color: 'var(--primary)' }} /> Stock Distribution
                        </h5>
                        {totalStock > 0 ? (
                            <div className="chart-embed" style={{ width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={items}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="quantity"
                                        >
                                            {items.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)', backgroundColor: 'var(--surface)', color: 'var(--text-main)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="d-flex align-items-center justify-content-center h-100" style={{ minHeight: '300px' }}>
                                <p style={{ color: 'var(--text-dim)' }}>No stock data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Efficiency Stats */}
                <div className="col-12">
                    <div className="shadow-sm border-0 p-4" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2" style={{ color: 'var(--text-main)' }}>
                            <TrendingUp size={20} style={{ color: '#10b981' }} /> Operations Efficiency
                        </h5>
                        <div className="row text-center g-4">
                            <div className="col-12 col-md-4" style={{ borderRight: 'none' }}>
                                <h2 className="display-5 fw-bold mb-1" style={{ color: 'var(--primary)' }}>98.5%</h2>
                                <p className="fw-medium mb-0" style={{ color: 'var(--text-dim)' }}>Order Fulfillment Rate</p>
                            </div>
                            <div className="col-12 col-md-4" style={{ borderRight: 'none' }}>
                                <h2 className="display-5 fw-bold mb-1" style={{ color: '#fb923c' }}>14m</h2>
                                <p className="fw-medium mb-0" style={{ color: 'var(--text-dim)' }}>Average Retrieval Time</p>
                            </div>
                            <div className="col-12 col-md-4">
                                <h2 className="display-5 fw-bold mb-1" style={{ color: '#10b981' }}>+12%</h2>
                                <p className="fw-medium mb-0" style={{ color: 'var(--text-dim)' }}>MoM Processing Speed</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;

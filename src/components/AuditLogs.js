import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    action: "",
    entityType: "",
    user: "",
    startDate: "",
    endDate: "",
    search: ""
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.action) params.append('action', filters.action);
      if (filters.entityType) params.append('entityType', filters.entityType);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);
      
      const res = await axios.get(`${API_BASE_URL}/audit-logs?${params}`);
      setLogs(res.data.logs);
      setPagination(prev => ({
        ...prev,
        total: res.data.total,
        totalPages: res.data.totalPages
      }));
    } catch (err) {
      console.error("Error loading audit logs:", err);
      alert("Failed to load audit logs. Please check if backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/audit-logs/stats`);
      setStats(res.data);
    } catch (err) {
      console.error("Error loading audit stats:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [filters, pagination.page]);

  const getActionColor = (action) => {
    const colors = {
      'MEDICINE_ADDED': 'success',
      'MEDICINE_UPDATED': 'info', 
      'MEDICINE_DELETED': 'error',
      'SALE_RECORDED': 'primary',
      'PATIENT_ADDED': 'info',
      'PATIENT_UPDATED': 'info',
      'STOCK_ADJUSTED': 'warning',
      'LOW_STOCK_ALERT': 'warning',
      'EXPIRY_ALERT': 'warning',
      'INVENTORY_VIEWED': 'neutral',
      'SALES_VIEWED': 'neutral',
      'PATIENTS_VIEWED': 'neutral',
      'AUDIT_LOGS_CLEARED': 'error'
    };
    return colors[action] || 'neutral';
  };

  const formatAction = (action) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getActionIcon = (action) => {
    const icons = {
      'MEDICINE_ADDED': '💊',
      'MEDICINE_UPDATED': '✏️',
      'MEDICINE_DELETED': '🗑️',
      'SALE_RECORDED': '💰',
      'PATIENT_ADDED': '👨‍⚕️',
      'PATIENT_UPDATED': '✏️',
      'STOCK_ADJUSTED': '📊',
      'LOW_STOCK_ALERT': '⚠️',
      'EXPIRY_ALERT': '📅',
      'INVENTORY_VIEWED': '👀',
      'SALES_VIEWED': '👀',
      'PATIENTS_VIEWED': '👀',
      'AUDIT_LOGS_CLEARED': '🧹'
    };
    return icons[action] || '📝';
  };

  const clearLogs = async () => {
    const days = prompt("Clear logs older than how many days? (Enter 30 for logs older than 30 days):", "30");
    if (days && !isNaN(days)) {
      if (window.confirm(`Are you sure you want to clear audit logs older than ${days} days? This action cannot be undone.`)) {
        try {
          const res = await axios.delete(`${API_BASE_URL}/audit-logs?days=${days}`);
          alert(res.data.message);
          fetchLogs();
          fetchStats();
        } catch (err) {
          alert("Failed to clear logs");
        }
      }
    }
  };

  const resetFilters = () => {
    setFilters({
      action: "",
      entityType: "",
      user: "",
      startDate: "",
      endDate: "",
      search: ""
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const filteredLogs = logs.filter(log => {
    if (!filters.search) return true;
    
    const searchTerm = filters.search.toLowerCase();
    return (
      log.description.toLowerCase().includes(searchTerm) ||
      log.user.toLowerCase().includes(searchTerm) ||
      log.entityType.toLowerCase().includes(searchTerm) ||
      log.action.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="page">
      <h1>📋 Audit Logs & Activity History</h1>

      {/* Stats Cards */}
      <div className="cards-container">
        <div className="card primary">
          <h3>Total Logs</h3>
          <p>{pagination.total}</p>
          <small>All activities</small>
        </div>
        <div className="card success">
          <h3>Today's Activities</h3>
          <p>{stats.totalToday || 0}</p>
          <small>Actions today</small>
        </div>
        <div className="card info">
          <h3>Top Action</h3>
          <p style={{ fontSize: '1.2rem' }}>
            {stats.topActivities?.[0]?._id ? formatAction(stats.topActivities[0]._id) : 'N/A'}
          </p>
          <small>{stats.topActivities?.[0]?.count || 0} times</small>
        </div>
        <div className="card warning">
          <h3>Current Page</h3>
          <p>{pagination.page} / {pagination.totalPages}</p>
          <small>{filteredLogs.length} logs</small>
        </div>
      </div>

      {/* Filters Section */}
      <div className="dashboard-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>🔍 Filter & Search Logs</h3>
          <div>
            <button 
              onClick={resetFilters}
              className="btn-modern secondary"
              style={{ marginRight: '0.5rem' }}
            >
              🔄 Reset
            </button>
            <button 
              onClick={clearLogs}
              className="btn-modern error"
            >
              🗑️ Clear Old Logs
            </button>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem', 
          marginBottom: '1rem' 
        }}>
          {/* Search */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              🔎 Search
            </label>
            <input
              type="text"
              placeholder="Search in description, user..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="form-input"
            />
          </div>

          {/* Action Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              📝 Action Type
            </label>
            <select 
              value={filters.action}
              onChange={(e) => setFilters({...filters, action: e.target.value})}
              className="form-input"
            >
              <option value="">All Actions</option>
              <option value="MEDICINE_ADDED">💊 Medicine Added</option>
              <option value="MEDICINE_UPDATED">✏️ Medicine Updated</option>
              <option value="MEDICINE_DELETED">🗑️ Medicine Deleted</option>
              <option value="SALE_RECORDED">💰 Sale Recorded</option>
              <option value="PATIENT_ADDED">👨‍⚕️ Patient Added</option>
              <option value="PATIENT_UPDATED">✏️ Patient Updated</option>
              <option value="STOCK_ADJUSTED">📊 Stock Adjusted</option>
              <option value="LOW_STOCK_ALERT">⚠️ Low Stock Alert</option>
              <option value="EXPIRY_ALERT">📅 Expiry Alert</option>
            </select>
          </div>

          {/* Entity Type Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              📁 Entity Type
            </label>
            <select 
              value={filters.entityType}
              onChange={(e) => setFilters({...filters, entityType: e.target.value})}
              className="form-input"
            >
              <option value="">All Entities</option>
              <option value="Medicine">💊 Medicine</option>
              <option value="Sale">💰 Sale</option>
              <option value="Patient">👨‍⚕️ Patient</option>
              <option value="Inventory">📦 Inventory</option>
              <option value="Audit">📋 Audit</option>
            </select>
          </div>

          {/* Date Filters */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              📅 Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="form-input"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              📅 End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="form-input"
            />
          </div>
        </div>

        {/* Active Filters */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '0.5rem', 
          marginBottom: '1rem',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Active Filters:</span>
          {filters.action && (
            <span className="badge badge-primary">
              Action: {formatAction(filters.action)}
            </span>
          )}
          {filters.entityType && (
            <span className="badge badge-info">
              Entity: {filters.entityType}
            </span>
          )}
          {filters.startDate && (
            <span className="badge badge-warning">
              From: {filters.startDate}
            </span>
          )}
          {filters.endDate && (
            <span className="badge badge-warning">
              To: {filters.endDate}
            </span>
          )}
          {filters.search && (
            <span className="badge badge-success">
              Search: "{filters.search}"
            </span>
          )}
        </div>
      </div>

      {/* Logs List */}
      <div className="dashboard-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>📝 Activity History ({filteredLogs.length} logs)</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <select 
              value={pagination.limit}
              onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
              className="form-input"
              style={{ padding: '0.5rem', width: 'auto' }}
            >
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h4>Loading Audit Logs...</h4>
            <p>Please wait while we fetch your activity history</p>
          </div>
        ) : (
          <>
            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1rem',
                padding: '1.5rem',
                background: 'var(--neutral-card)',
                borderRadius: '12px',
                border: '1px solid var(--neutral-border)'
              }}>
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="btn-modern"
                  style={{ 
                    background: pagination.page <= 1 ? 'var(--neutral-light)' : '',
                    cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  ← Previous
                </button>
                
                <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="btn-modern"
                  style={{ 
                    background: pagination.page >= pagination.totalPages ? 'var(--neutral-light)' : '',
                    cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next →
                </button>
              </div>
            )}

            {/* Logs List */}
            <div className="logs-container">
              {filteredLogs.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '4rem', 
                  color: 'var(--text-tertiary)',
                  background: 'var(--neutral-card)',
                  borderRadius: '16px',
                  border: '2px dashed var(--neutral-border)'
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
                  <h4>No Activity Logs Found</h4>
                  <p>No audit logs match your current filters. Try adjusting your search criteria.</p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log._id} className="inventory-card hover-lift" style={{
                    padding: '2rem',
                    borderLeft: '6px solid',
                    borderLeftColor: `var(--${getActionColor(log.action)})`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
                          <span style={{ fontSize: '1.5rem' }}>
                            {getActionIcon(log.action)}
                          </span>
                          <span className={`badge badge-${getActionColor(log.action)}`}>
                            {formatAction(log.action)}
                          </span>
                          <span style={{ 
                            fontSize: '0.9rem', 
                            color: 'var(--text-tertiary)',
                            background: 'var(--neutral-card)',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            fontWeight: '600'
                          }}>
                            {log.entityType}
                          </span>
                        </div>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1.2rem', lineHeight: '1.4' }}>
                          {log.description}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: '180px' }}>
                        <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
                          {new Date(log.createdAt).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                      gap: '1.5rem',
                      fontSize: '1rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <strong>👤 User:</strong> {log.user}
                      </div>
                      {log.entityId && (
                        <div>
                          <strong>🆔 Entity ID:</strong> 
                          <span style={{ 
                            fontFamily: 'monospace',
                            background: 'var(--neutral-card)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.9rem',
                            marginLeft: '0.5rem'
                          }}>
                            {log.entityId.toString().slice(-8)}
                          </span>
                        </div>
                      )}
                      {log.ipAddress && (
                        <div>
                          <strong>🌐 IP Address:</strong> {log.ipAddress}
                        </div>
                      )}
                    </div>

                    {/* Data Changes */}
                    {(log.oldData || log.newData) && (
                      <div style={{ 
                        marginTop: '1.5rem', 
                        fontSize: '0.9rem',
                        borderTop: '2px solid var(--neutral-border)',
                        paddingTop: '1.5rem'
                      }}>
                        <div style={{ fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>🔄 Data Changes</span>
                        </div>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr', 
                          gap: '1.5rem',
                          fontSize: '0.85rem'
                        }}>
                          {log.oldData && Object.keys(log.oldData).length > 0 && (
                            <div style={{ 
                              background: 'linear-gradient(135deg, #FFE5E5 0%, #FFF0F0 100%)',
                              padding: '1.5rem',
                              borderRadius: '12px',
                              border: '2px solid #E63946'
                            }}>
                              <div style={{ color: 'var(--accent-error)', fontWeight: '700', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                📤 Old Data
                              </div>
                              <pre style={{ 
                                margin: 0, 
                                whiteSpace: 'pre-wrap', 
                                fontFamily: 'monospace',
                                fontSize: '0.8rem',
                                lineHeight: '1.4'
                              }}>
                                {JSON.stringify(log.oldData, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.newData && Object.keys(log.newData).length > 0 && (
                            <div style={{ 
                              background: 'linear-gradient(135deg, #E5F5F0 0%, #F0FDFB 100%)',
                              padding: '1.5rem',
                              borderRadius: '12px',
                              border: '2px solid #52B788'
                            }}>
                              <div style={{ color: 'var(--accent-success)', fontWeight: '700', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                📥 New Data
                              </div>
                              <pre style={{ 
                                margin: 0, 
                                whiteSpace: 'pre-wrap', 
                                fontFamily: 'monospace',
                                fontSize: '0.8rem',
                                lineHeight: '1.4'
                              }}>
                                {JSON.stringify(log.newData, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        className="fab pulse-glow"
        onClick={fetchLogs}
        title="Refresh Logs"
      >
        🔄
      </button>
    </div>
  );
}
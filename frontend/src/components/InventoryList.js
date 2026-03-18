import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

// Get the base URL without /api for image paths
const SERVER_URL = API_BASE_URL.replace("/api", "");

function InventoryList() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_BASE_URL}/inventory`);
      setInventory(res.data);
    } catch (err) {
      console.error("Error loading inventory:", err);
      setError("Failed to load inventory. Please check if backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const testConnection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/test`);
      alert(`✅ Backend connection successful!\n${response.data.message}`);
      fetchInventory();
    } catch (error) {
      alert("❌ Cannot connect to backend server.");
    }
  };

  // Filter and search logic
  const filteredInventory = inventory
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "in-stock" && item.quantity >= 10) ||
        (filterStatus === "low-stock" && item.quantity > 0 && item.quantity < 10) ||
        (filterStatus === "critical" && item.quantity > 0 && item.quantity < 5) ||
        (filterStatus === "out-of-stock" && item.quantity === 0);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return a.price - b.price;
        case "quantity":
          return b.quantity - a.quantity;
        case "expiry":
          return new Date(a.expiryDate) - new Date(b.expiryDate);
        default:
          return 0;
      }
    });

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { status: 'Out of Stock', color: '#E63946', bg: '#FFE5E5' };
    if (quantity < 5) return { status: 'Critical', color: '#E63946', bg: '#FFE5E5' };
    if (quantity < 10) return { status: 'Low Stock', color: '#FFB703', bg: '#FFF4E5' };
    return { status: 'In Stock', color: '#52B788', bg: '#E5F5F0' };
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${SERVER_URL}${imagePath}`;
  };

  if (loading) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <h3>Loading Inventory...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1><span style={{ WebkitTextFillColor: "initial", marginRight: "8px" }}>📦</span> Inventory List</h1>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'pointer',
            animation: 'fadeIn 0.3s ease'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div style={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh',
            animation: 'scaleIn 0.3s ease'
          }}>
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              style={{
                maxWidth: '90vw',
                maxHeight: '80vh',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                objectFit: 'contain',
                imageRendering: 'auto',
                background: 'white',
                padding: '8px'
              }}
            />
            <div style={{
              textAlign: 'center',
              color: 'white',
              marginTop: '1rem',
              fontSize: '1.2rem',
              fontWeight: '600'
            }}>
              {selectedImage.name}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              style={{
                position: 'absolute',
                top: '-15px',
                right: '-15px',
                background: 'linear-gradient(135deg, #E63946, #c0392b)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(230,57,70,0.4)'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Connection Test Button */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={testConnection}
          style={{
            padding: '0.5rem 1rem',
            background: '#507A88',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Test Backend Connection
        </button>
        <button
          onClick={fetchInventory}
          style={{
            padding: '0.5rem 1rem',
            background: '#52B788',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Refresh
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: '#FFE5E5',
          border: '1px solid #E63946',
          color: '#8B2C2C',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {inventory.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: '#f8fafb',
          borderRadius: '12px',
          border: '2px dashed #cbd5e1'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
          <h2 style={{ color: '#64748b', marginBottom: '0.5rem' }}>No Medicines in Inventory</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
            Your inventory is empty. Add some medicines to get started.
          </p>
          <button
            onClick={() => window.location.href = '/add-medicine'}
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}
          >
            ➕ Add First Medicine
          </button>
        </div>
      ) : (
        <>
          {/* Search and Filter Controls */}
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {/* Search */}
              <input
                type="text"
                placeholder="🔍 Search by name, category, or manufacturer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '0.95rem'
                }}
              />

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                <option value="all">📊 All Status</option>
                <option value="in-stock">✅ In Stock</option>
                <option value="low-stock">⚠️ Low Stock</option>
                <option value="critical">🔴 Critical</option>
                <option value="out-of-stock">❌ Out of Stock</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                <option value="name">Sort: Name (A-Z)</option>
                <option value="price">Sort: Price (Low to High)</option>
                <option value="quantity">Sort: Quantity (High to Low)</option>
                <option value="expiry">Sort: Expiry Date</option>
              </select>
            </div>
          </div>

          <div style={{
            marginBottom: '1rem',
            padding: '1rem',
            background: '#f0fdf9',
            borderRadius: '8px',
            border: '1px solid #a7f3d0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <strong>Showing {filteredInventory.length} of {inventory.length} medicines</strong>
            </div>
            {(searchTerm || filterStatus !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
                style={{
                  padding: '0.4rem 0.8rem',
                  background: '#fbbf24',
                  color: '#78350f',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Medicine Name</th>
                <th>Category</th>
                <th>Manufacturer</th>
                <th>Price (₹)</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => {
                  const status = getStockStatus(item.quantity);
                  const imageUrl = getImageUrl(item.image);
                  return (
                    <tr key={item._id}>
                      <td>
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.name}
                            onClick={() => setSelectedImage({ url: imageUrl, name: item.name })}
                            style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '10px',
                              objectFit: 'cover',
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                              transition: 'all 0.3s ease',
                              border: '2px solid #E8EAED',
                              imageRendering: 'auto'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'scale(1.15)';
                              e.target.style.boxShadow = '0 4px 16px rgba(80,122,136,0.3)';
                              e.target.style.borderColor = '#507A88';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'scale(1)';
                              e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
                              e.target.style.borderColor = '#E8EAED';
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #f0f3f7, #e8eaed)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            border: '2px solid #E8EAED'
                          }}>
                            💊
                          </div>
                        )}
                      </td>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.category || 'General'}</td>
                      <td>{item.manufacturer || 'Unknown'}</td>
                      <td>₹{item.price}</td>
                      <td>
                        <span style={{
                          color: status.color,
                          fontWeight: '600'
                        }}>
                          {item.quantity} units
                        </span>
                      </td>
                      <td>
                        <span style={{
                          padding: '0.3rem 0.6rem',
                          background: status.bg,
                          color: status.color,
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}>
                          {status.status}
                        </span>
                      </td>
                      <td>{new Date(item.expiryDate).toLocaleDateString()}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                    No medicines match your filters. Try adjusting your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {/* Inline styles for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default InventoryList;
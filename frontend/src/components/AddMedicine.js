import React, { useState, useRef } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

export default function AddMedicine() {
  const [form, setForm] = useState({
    name: "",
    category: "",
    manufacturer: "",
    price: "",
    quantity: "",
    expiryDate: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError("Only image files (JPG, PNG, GIF, WebP) are allowed");
        return;
      }

      setImageFile(file);
      setError("");

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.name || !form.price || !form.quantity || !form.expiryDate) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (parseFloat(form.price) <= 0) {
      setError("Price must be greater than 0");
      setLoading(false);
      return;
    }

    if (parseInt(form.quantity) < 0) {
      setError("Quantity cannot be negative");
      setLoading(false);
      return;
    }

    // Use FormData to send both text fields and image
    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("category", form.category.trim() || "General");
    formData.append("manufacturer", form.manufacturer.trim() || "Unknown");
    formData.append("price", parseFloat(form.price));
    formData.append("quantity", parseInt(form.quantity));
    formData.append("expiryDate", new Date(form.expiryDate).toISOString());

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/inventory`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Medicine added successfully!");
      setForm({
        name: "",
        category: "",
        manufacturer: "",
        price: "",
        quantity: "",
        expiryDate: "",
      });
      removeImage();
    } catch (error) {
      console.error("Error adding medicine:", error);

      if (error.response) {
        setError(`Server error: ${error.response.data.error || error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        setError("Cannot connect to server. Please make sure the backend is running on port 5000.");
      } else {
        setError(`Error: ${error.message}`);
      }

      alert("❌ Failed to add medicine. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/test`);
      alert(`✅ Backend connection successful!\n${response.data.message}`);
    } catch (error) {
      alert("❌ Cannot connect to backend server. Please make sure it's running on port 5000.");
    }
  };

  return (
    <div className="page">
      <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ WebkitTextFillColor: "initial", color: "#7C3AED", fontSize: "36px" }}>➕</span> Add Medicine
      </h1>

      {/* Connection Test Button */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={testConnection}
          type="button"
          style={{
            padding: '0.5rem 1rem',
            background: '#507A88',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Test Backend Connection
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

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Medicine Name *</label>
          <input
            type="text"
            placeholder="Enter medicine name (e.g., Paracetamol 500mg)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            placeholder="Category (e.g., Tablet, Syrup, Capsule)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Manufacturer</label>
          <input
            type="text"
            placeholder="Manufacturer (e.g., Cipla Ltd., Sun Pharma)"
            value={form.manufacturer}
            onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Price (₹) *</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Enter price per unit"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Quantity *</label>
          <input
            type="number"
            min="0"
            placeholder="Enter quantity in stock"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Expiry Date *</label>
          <input
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Image Upload Section */}
        <div className="form-group">
          <label>📷 Medicine Image (Optional)</label>
          <div style={{
            border: '2px dashed #CDD5E0',
            borderRadius: '14px',
            padding: '1.5rem',
            textAlign: 'center',
            background: '#F8FAFB',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            position: 'relative'
          }}
            onClick={() => !imagePreview && fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '#507A88';
              e.currentTarget.style.background = '#E8F1F5';
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.borderColor = '#CDD5E0';
              e.currentTarget.style.background = '#F8FAFB';
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '#CDD5E0';
              e.currentTarget.style.background = '#F8FAFB';
              const file = e.dataTransfer.files[0];
              if (file) {
                const event = { target: { files: [file] } };
                handleImageChange(event);
              }
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              style={{ display: 'none' }}
            />

            {imagePreview ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={imagePreview}
                  alt="Medicine preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '250px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    objectFit: 'contain',
                    imageRendering: 'auto'
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: 'linear-gradient(135deg, #E63946, #c0392b)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(230,57,70,0.3)'
                  }}
                >
                  ✕
                </button>
                <p style={{
                  marginTop: '0.8rem',
                  fontSize: '0.85rem',
                  color: '#52B788',
                  fontWeight: '600'
                }}>
                  ✅ {imageFile?.name} ({(imageFile?.size / 1024).toFixed(1)} KB)
                </p>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem', opacity: 0.5 }}>📷</div>
                <p style={{ color: '#636E7F', fontWeight: '500', margin: '0 0 0.3rem' }}>
                  Click to upload or drag & drop
                </p>
                <p style={{ color: '#909BAB', fontSize: '0.8rem', margin: 0 }}>
                  JPG, PNG, GIF, WebP — Max 5MB
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Adding Medicine..." : "Add Medicine"}
        </button>
      </form>
    </div>
  );
}
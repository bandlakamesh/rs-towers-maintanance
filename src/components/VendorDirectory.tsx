import React, { useState } from 'react';
import type { ApartmentVendor } from '../types';
import { Contact, Phone, MessageSquare, Plus, User, Copy, Check } from 'lucide-react';

interface VendorDirectoryProps {
  vendors: ApartmentVendor[];
  isAdmin: boolean;
  onAddVendor: (newVendor: ApartmentVendor) => void;
  onDeleteVendor: (vendorId: string) => void;
}

export const VendorDirectory: React.FC<VendorDirectoryProps> = ({
  vendors,
  isAdmin,
  onAddVendor,
  onDeleteVendor,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [upiId, setUpiId] = useState('');
  const [notes, setNotes] = useState('');

  const handleCopyUpi = (upi: string) => {
    navigator.clipboard.writeText(upi);
    setCopiedUpi(upi);
    setTimeout(() => setCopiedUpi(null), 2000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newVendor: ApartmentVendor = {
      id: 'v-' + Date.now(),
      name,
      role: role || 'Service Technician',
      phone,
      upiId,
      notes,
    };

    onAddVendor(newVendor);
    setShowAddModal(false);
    setName('');
    setRole('');
    setPhone('');
    setUpiId('');
    setNotes('');
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      
      {/* Header Banner */}
      <div className="app-card" style={{
        background: 'linear-gradient(135deg, #0E5A73 0%, #137A9A 100%)',
        color: '#FFFFFF',
        marginBottom: '20px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        borderColor: '#48CAE4',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Contact size={24} color="#FFD166" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              Apartment Vendor & Maintenance Directory
            </h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#E0F2FE' }}>
              Direct emergency contacts for Lift Technicians, CCTV Engineers, Tank Cleaners, Electricians & Tanker Drivers
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="app-btn"
            style={{
              background: '#FFD166',
              color: '#0E5A73',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
            }}
          >
            <Plus size={16} /> Add Vendor Contact
          </button>
        )}
      </div>

      {/* Vendor Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '18px' }}>
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            className="app-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '18px',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: '#E0F7FA',
                  color: '#0077B6',
                  border: '1px solid #48CAE4',
                }}>
                  {vendor.role}
                </span>

                {isAdmin && (
                  <button
                    onClick={() => onDeleteVendor(vendor.id)}
                    style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                    title="Delete Vendor"
                  >
                    Delete
                  </button>
                )}
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginTop: '10px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={16} color="#0096C7" /> {vendor.name}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '8px 10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={14} color="#059669" />
                  <span style={{ fontWeight: 800, color: '#0F172A', fontFamily: 'monospace', fontSize: '0.9rem' }}>{vendor.phone}</span>
                </div>

                {vendor.upiId && (
                  <div style={{ background: '#F0F9FF', border: '1px solid #B2D8E5', padding: '8px 10px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#0077B6' }}>
                    <span>UPI ID: <strong style={{ fontFamily: 'monospace' }}>{vendor.upiId}</strong></span>
                    <button
                      onClick={() => handleCopyUpi(vendor.upiId!)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0096C7' }}
                      title="Copy UPI ID"
                    >
                      {copiedUpi === vendor.upiId ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                    </button>
                  </div>
                )}

                {vendor.notes && (
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748B', fontStyle: 'italic', background: '#F8FAFC', padding: '6px 8px', borderRadius: '8px' }}>
                    "{vendor.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <a
                href={`tel:${vendor.phone}`}
                className="app-btn"
                style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', padding: '6px 10px', fontSize: '0.78rem', textDecoration: 'none' }}
              >
                <Phone size={14} /> Call Now
              </a>

              <a
                href={`https://api.whatsapp.com/send?phone=91${vendor.phone}&text=${encodeURIComponent(`Hi ${vendor.name}, regarding RS Towers Apartment maintenance.`)}`}
                target="_blank"
                rel="noreferrer"
                className="app-btn app-btn-whatsapp"
                style={{ padding: '6px 10px', fontSize: '0.78rem', textDecoration: 'none' }}
              >
                <MessageSquare size={14} /> WhatsApp
              </a>
            </div>

          </div>
        ))}
      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0096C7', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={20} /> Add Vendor Contact
            </h3>

            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label>Vendor / Technician Name:</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Raju Mechanic"
                  required
                />
              </div>

              <div className="form-group">
                <label>Role / Service Type:</label>
                <input
                  type="text"
                  className="form-control"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Lift Mechanic, Plumber, CCTV Installer"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number:</label>
                <input
                  type="text"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  required
                />
              </div>

              <div className="form-group">
                <label>UPI ID (Optional):</label>
                <input
                  type="text"
                  className="form-control"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. vendor@upi"
                />
              </div>

              <div className="form-group">
                <label>Notes / Availability:</label>
                <textarea
                  className="form-control"
                  style={{ height: '60px', resize: 'vertical' }}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Availability, response time..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  className="app-btn app-btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="app-btn app-btn-primary"
                >
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import type { ApartmentVendor } from '../types';
import { Contact, Phone, MessageSquare, Plus, User, ShieldCheck, Copy, Check } from 'lucide-react';

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
    // Reset form
    setName('');
    setRole('');
    setPhone('');
    setUpiId('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950/60 to-slate-900 border border-teal-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
            <Contact className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Apartment Vendor & Maintenance Directory
            </h2>
            <p className="text-teal-200/80 text-sm mt-0.5">
              Direct emergency contacts for Lift Technicians, CCTV Engineers, Tank Cleaners, Electricians & Tanker Drivers
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 font-bold rounded-xl transition-all duration-200 shadow-lg shadow-teal-500/20 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Vendor Contact
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            className="bg-slate-900/70 border border-slate-800 hover:border-teal-500/40 rounded-2xl p-5 shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  {vendor.role}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => onDeleteVendor(vendor.id)}
                    className="text-slate-500 hover:text-red-400 text-xs font-bold px-2 py-1 transition-colors"
                    title="Delete Vendor"
                  >
                    Delete
                  </button>
                )}
              </div>

              <h3 className="text-lg font-bold text-white mt-3 flex items-center gap-2">
                <User className="w-4 h-4 text-teal-400" />
                {vendor.name}
              </h3>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-mono text-white text-sm font-semibold">{vendor.phone}</span>
                </div>

                {vendor.upiId && (
                  <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-slate-300">
                    <span className="text-slate-400">UPI ID: <strong className="text-teal-300 font-mono">{vendor.upiId}</strong></span>
                    <button
                      onClick={() => handleCopyUpi(vendor.upiId!)}
                      className="p-1 text-teal-400 hover:text-teal-300"
                      title="Copy UPI ID"
                    >
                      {copiedUpi === vendor.upiId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                {vendor.notes && (
                  <p className="text-slate-400 text-xs italic bg-slate-950/30 p-2 rounded-lg border border-slate-800/40">
                    "{vendor.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
              <a
                href={`tel:${vendor.phone}`}
                className="py-2 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-emerald-500/30"
              >
                <Phone className="w-3.5 h-3.5" />
                Call Now
              </a>

              <a
                href={`https://api.whatsapp.com/send?phone=91${vendor.phone}&text=${encodeURIComponent(`Hi ${vendor.name}, regarding RS Towers Apartment maintenance.`)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-teal-500/30"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-teal-500/40 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-teal-400" />
              Add Vendor Contact
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Vendor / Technician Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  placeholder="e.g. Raju Mechanic"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Role / Service Type</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  placeholder="e.g. Lift Mechanic, Plumber, CCTV Installer"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  placeholder="10-digit mobile number"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">UPI ID (Optional)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  placeholder="e.g. vendor@upi"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Notes / Service Details</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500 h-16"
                  placeholder="Availability, response time..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-teal-500/20"
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

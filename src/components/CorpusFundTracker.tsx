import React, { useState } from 'react';
import type { CorpusFundConfig, CorpusExpenseLog, MonthMaintenanceRecord } from '../types';
import { Landmark, Plus, Trash2, Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface CorpusFundTrackerProps {
  corpusConfig: CorpusFundConfig;
  activeRecord: MonthMaintenanceRecord;
  isAdmin: boolean;
  onUpdateCorpusConfig: (updatedConfig: CorpusFundConfig) => void;
}

export const CorpusFundTracker: React.FC<CorpusFundTrackerProps> = ({
  corpusConfig,
  activeRecord,
  isAdmin,
  onUpdateCorpusConfig,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(2000);
  const [category, setCategory] = useState<CorpusExpenseLog['category']>('Lift Overhaul');
  const [approvedBy, setApprovedBy] = useState('Bobby (Flat 101 - Maintenance Lead)');
  const [notes, setNotes] = useState('');

  const occupiedFlats = activeRecord.flatReadings.filter((f) => f.flatNo !== 'WM' && f.isOccupied);
  const occupiedCount = occupiedFlats.length; // 14 flats

  const monthlyRate = corpusConfig.monthlyRatePerFlat || 200;
  const pastMonths = corpusConfig.pastMonthsCollected || 12;
  const baselineCollected = corpusConfig.baselineTotalCollected || (occupiedCount * monthlyRate * pastMonths);

  const totalSpent = (corpusConfig.corpusExpenses || []).reduce((sum, exp) => sum + exp.amount, 0);
  const netCorpusBalance = baselineCollected - totalSpent;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount <= 0) return;

    const newExpense: CorpusExpenseLog = {
      id: 'cexp-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      title,
      amount: Number(amount),
      category,
      approvedBy,
      notes,
    };

    const updatedConfig: CorpusFundConfig = {
      ...corpusConfig,
      corpusExpenses: [newExpense, ...(corpusConfig.corpusExpenses || [])],
    };

    onUpdateCorpusConfig(updatedConfig);
    setShowAddModal(false);
    setTitle('');
    setAmount(2000);
    setNotes('');
  };

  const handleDeleteExpense = (expenseId: string) => {
    const updatedConfig: CorpusFundConfig = {
      ...corpusConfig,
      corpusExpenses: (corpusConfig.corpusExpenses || []).filter((e) => e.id !== expenseId),
    };
    onUpdateCorpusConfig(updatedConfig);
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      
      {/* Banner */}
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
            <Landmark size={24} color="#FFD166" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              Apartment Corpus Fund Tracker
            </h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#E0F2FE' }}>
              Dedicated Reserve Pool ({occupiedCount} Flats • ₹{monthlyRate}/Month • Past {pastMonths} Months Collection Status)
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
            <Plus size={16} /> Log Corpus Expenditure
          </button>
        )}
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        {/* Card 1: Total Collected */}
        <div className="app-card" style={{ background: '#FFFFFF', borderLeft: '5px solid #0096C7' }}>
          <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Corpus Collected
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
            ₹{baselineCollected.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#059669', marginTop: '2px', fontWeight: 600 }}>
            {occupiedCount} Flats × ₹{monthlyRate} × {pastMonths} Months
          </div>
        </div>

        {/* Card 2: Total Spent */}
        <div className="app-card" style={{ background: '#FFFFFF', borderLeft: '5px solid #DC2626' }}>
          <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Corpus Spent
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>
            ₹{totalSpent.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
            Major Repairs & Maintenance
          </div>
        </div>

        {/* Card 3: Net Balance */}
        <div className="app-card" style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', border: '2px solid #A7F3D0' }}>
          <div style={{ fontSize: '0.76rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>
            Net Available Corpus
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
            ₹{netCorpusBalance.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#065F46', marginTop: '2px', fontWeight: 700 }}>
            Available Reserve Fund
          </div>
        </div>

      </div>

      {/* Flat-by-Flat 12-Month Corpus Status Grid */}
      <div className="app-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} color="#059669" /> Flat Corpus Contribution Breakdown (₹{monthlyRate}/Month per Flat)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '12px' }}>
          {occupiedFlats.map((flat) => {
            const flatTotalPaid = monthlyRate * pastMonths; // ₹2,400

            return (
              <div
                key={flat.flatNo}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: '#1D4ED8', fontSize: '0.9rem' }}>
                    Flat #{flat.flatNo}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                    {flat.residentName}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#059669' }}>
                    ₹{flatTotalPaid.toLocaleString('en-IN')}
                  </div>
                  <span style={{ fontSize: '0.68rem', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', padding: '1px 6px', borderRadius: '6px', fontWeight: 700 }}>
                    12 Months Paid
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Corpus Expenditures History Table */}
      <div className="app-card" style={{ padding: 0, overflowX: 'auto' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="#0096C7" /> Corpus Expenditure & Major Work Log
          </h3>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ background: '#F0F9FF', borderBottom: '2px solid #B2D8E5', color: '#0077B6', fontFamily: 'var(--font-title)' }}>
              <th style={{ padding: '12px 16px' }}>Date</th>
              <th style={{ padding: '12px 16px' }}>Expense Details</th>
              <th style={{ padding: '12px 16px' }}>Category</th>
              <th style={{ padding: '12px 16px' }}>Approved By</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Amount Spent</th>
              {isAdmin && <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {(corpusConfig.corpusExpenses || []).map((exp) => (
              <tr key={exp.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontWeight: 600, color: '#475569' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} color="#0096C7" /> {exp.date}
                  </span>
                </td>

                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 800, color: '#0F172A' }}>{exp.title}</div>
                  {exp.notes && <div style={{ fontSize: '0.78rem', color: '#64748B', fontStyle: 'italic' }}>{exp.notes}</div>}
                </td>

                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: '0.74rem', background: '#E0F7FA', border: '1px solid #48CAE4', color: '#0077B6', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    {exp.category}
                  </span>
                </td>

                <td style={{ padding: '12px 16px', color: '#475569', fontSize: '0.82rem' }}>
                  {exp.approvedBy}
                </td>

                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#DC2626', fontSize: '0.95rem' }}>
                  ₹{exp.amount.toLocaleString('en-IN')}
                </td>

                {isAdmin && (
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
                      title="Delete Entry"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Log Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0096C7', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={20} /> Log Corpus Fund Expenditure
            </h3>

            <form onSubmit={handleAddExpense}>
              <div className="form-group">
                <label>Expense Work Title:</label>
                <input
                  type="text"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Major Lift Overhaul & Wire Rope Replacement"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label>Amount Spent (₹):</label>
                  <input
                    type="number"
                    className="form-control"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Work Category:</label>
                  <select
                    className="form-control"
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                  >
                    <option value="Lift Overhaul">Lift Overhaul</option>
                    <option value="Building Painting">Building Painting</option>
                    <option value="Waterproof/Sump">Waterproof/Sump</option>
                    <option value="Motor/Electrical">Motor/Electrical</option>
                    <option value="Festival/Event">Festival/Event</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Approved / Managed By:</label>
                <input
                  type="text"
                  className="form-control"
                  value={approvedBy}
                  onChange={(e) => setApprovedBy(e.target.value)}
                  placeholder="e.g. Bobby (Flat 101)"
                />
              </div>

              <div className="form-group">
                <label>Notes / Work Receipt Info:</label>
                <textarea
                  className="form-control"
                  style={{ height: '70px', resize: 'vertical' }}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Receipt voucher details, technician notes..."
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
                  Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import type { PeriodicTask, ServiceLogEntry } from '../types';
import { Wrench, Calendar, CheckCircle2, AlertTriangle, Plus, History, Phone, MessageSquare, Clock } from 'lucide-react';

interface PeriodicMaintenanceHubProps {
  tasks: PeriodicTask[];
  isAdmin: boolean;
  onUpdateTask: (updatedTask: PeriodicTask) => void;
  onAddTask: (newTask: PeriodicTask) => void;
}

export const PeriodicMaintenanceHub: React.FC<PeriodicMaintenanceHubProps> = ({
  tasks,
  isAdmin,
  onUpdateTask,
  onAddTask,
}) => {
  const [selectedTask, setSelectedTask] = useState<PeriodicTask | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  // Form states for Logging Service
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceAmount, setServiceAmount] = useState<number>(0);
  const [serviceTechnician, setServiceTechnician] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');

  // Form states for New AMC Task
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<PeriodicTask['category']>('Lift AMC');
  const [newTaskInterval, setNewTaskInterval] = useState(6);
  const [newTaskCost, setNewTaskCost] = useState(3000);
  const [newTaskVendor, setNewTaskVendor] = useState('');
  const [newTaskPhone, setNewTaskPhone] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');

  const getStatusBadge = (nextDueDateStr: string) => {
    const today = new Date();
    const dueDate = new Date(nextDueDateStr);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `OVERDUE (${Math.abs(diffDays)}d)`, background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', icon: AlertTriangle };
    } else if (diffDays <= 30) {
      return { label: `Due Soon (${diffDays}d)`, background: '#FEF3C7', border: '1px solid #FDE68A', color: '#D97706', icon: Clock };
    } else {
      return { label: `Healthy (${diffDays}d)`, background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', icon: CheckCircle2 };
    }
  };

  const handleOpenLogModal = (task: PeriodicTask) => {
    setSelectedTask(task);
    setServiceDate(new Date().toISOString().split('T')[0]);
    setServiceAmount(task.estimatedCost);
    setServiceTechnician(task.vendorName);
    setServiceNotes('');
    setShowLogModal(true);
  };

  const handleSaveServiceLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    const dateObj = new Date(serviceDate);
    dateObj.setMonth(dateObj.getMonth() + selectedTask.intervalMonths);
    const calculatedNextDue = dateObj.toISOString().split('T')[0];

    const newLog: ServiceLogEntry = {
      id: 'log-' + Date.now(),
      date: serviceDate,
      amount: Number(serviceAmount),
      technician: serviceTechnician,
      notes: serviceNotes,
    };

    const updatedTask: PeriodicTask = {
      ...selectedTask,
      lastServicedDate: serviceDate,
      nextDueDate: calculatedNextDue,
      serviceLogs: [newLog, ...selectedTask.serviceLogs],
    };

    onUpdateTask(updatedTask);
    setShowLogModal(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const dateObj = new Date();
    dateObj.setMonth(dateObj.getMonth() + Number(newTaskInterval));
    const nextDueStr = dateObj.toISOString().split('T')[0];

    const newTask: PeriodicTask = {
      id: 'task-' + Date.now(),
      title: newTaskTitle,
      category: newTaskCategory,
      intervalMonths: Number(newTaskInterval),
      lastServicedDate: todayStr,
      nextDueDate: nextDueStr,
      estimatedCost: Number(newTaskCost),
      vendorName: newTaskVendor || 'Internal Association',
      vendorPhone: newTaskPhone,
      serviceLogs: [],
      notes: newTaskNotes,
    };

    onAddTask(newTask);
    setShowNewTaskModal(false);
    setNewTaskTitle('');
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
            <Wrench size={24} color="#FFD166" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              Building Asset AMC & Maintenance Hub
            </h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#E0F2FE' }}>
              Track 6-Month Lift Servicing, CCTV Audits, Water Tank Sanitization, Motors & Fire Safety
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="app-btn"
            style={{
              background: '#FFD166',
              color: '#0E5A73',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
            }}
          >
            <Plus size={16} /> Add AMC Task
          </button>
        )}
      </div>

      {/* Grid of Periodic Tasks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
        {tasks.map((task) => {
          const status = getStatusBadge(task.nextDueDate);
          const StatusIcon = status.icon;

          return (
            <div
              key={task.id}
              className="app-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '18px',
              }}
            >
              <div>
                {/* Category & Status Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: '#E0F7FA',
                    color: '#0077B6',
                    border: '1px solid #48CAE4',
                    textTransform: 'uppercase',
                  }}>
                    {task.category} ({task.intervalMonths}M)
                  </span>

                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: status.background,
                    border: status.border,
                    color: status.color,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <StatusIcon size={12} /> {status.label}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                  {task.title}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                  {task.notes || 'Routine maintenance and health inspection schedule.'}
                </p>

                {/* Dates Box */}
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  marginTop: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '0.8rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} color="#0096C7" /> Last Serviced:
                    </span>
                    <strong style={{ color: '#0F172A' }}>{task.lastServicedDate || 'N/A'}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} color="#D97706" /> Next Due Date:
                    </span>
                    <strong style={{ color: '#0077B6' }}>{task.nextDueDate}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', paddingTop: '4px', borderTop: '1px solid #E2E8F0' }}>
                    <span>Est. AMC Cost:</span>
                    <strong style={{ color: '#D97706' }}>₹{task.estimatedCost.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                {/* Vendor Contact Box */}
                {task.vendorName && (
                  <div style={{
                    marginTop: '10px',
                    padding: '8px 10px',
                    background: '#F0F9FF',
                    border: '1px solid #B2D8E5',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.76rem',
                    color: '#0077B6',
                  }}>
                    <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                      👤 {task.vendorName}
                    </span>

                    {task.vendorPhone && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <a
                          href={`tel:${task.vendorPhone}`}
                          style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', padding: '3px 6px', borderRadius: '6px', textDecoration: 'none' }}
                          title="Call Vendor"
                        >
                          <Phone size={12} />
                        </a>
                        <a
                          href={`https://api.whatsapp.com/send?phone=91${task.vendorPhone}&text=${encodeURIComponent(`Hi ${task.vendorName}, regarding ${task.title} for RS Towers Apartment.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ background: '#E0F7FA', border: '1px solid #48CAE4', color: '#0077B6', padding: '3px 6px', borderRadius: '6px', textDecoration: 'none' }}
                          title="WhatsApp Vendor"
                        >
                          <MessageSquare size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    setSelectedTask(task);
                    setShowHistoryModal(true);
                  }}
                  className="app-btn app-btn-secondary"
                  style={{ flex: 1, padding: '6px 10px', fontSize: '0.78rem' }}
                >
                  <History size={14} color="#0096C7" /> History ({task.serviceLogs?.length || 0})
                </button>

                {isAdmin && (
                  <button
                    onClick={() => handleOpenLogModal(task)}
                    className="app-btn app-btn-primary"
                    style={{ flex: 1, padding: '6px 10px', fontSize: '0.78rem' }}
                  >
                    <CheckCircle2 size={14} /> Log Service
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Log Service Modal */}
      {showLogModal && selectedTask && (
        <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0096C7', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wrench size={20} /> Log Completed Service / AMC
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '14px' }}>
              Task: <strong style={{ color: '#0F172A' }}>{selectedTask.title}</strong> ({selectedTask.intervalMonths}-Month Cycle)
            </p>

            <form onSubmit={handleSaveServiceLog}>
              <div className="form-group">
                <label>Service Completion Date:</label>
                <input
                  type="date"
                  className="form-control"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Actual Amount Paid (₹):</label>
                <input
                  type="number"
                  className="form-control"
                  value={serviceAmount}
                  onChange={(e) => setServiceAmount(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Technician / Vendor Name:</label>
                <input
                  type="text"
                  className="form-control"
                  value={serviceTechnician}
                  onChange={(e) => setServiceTechnician(e.target.value)}
                  placeholder="e.g. Raju Elevator Technician"
                />
              </div>

              <div className="form-group">
                <label>Service Notes / Parts Replaced:</label>
                <textarea
                  className="form-control"
                  style={{ height: '70px', resize: 'vertical' }}
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  placeholder="e.g. Wire rope oiled, safety limit switch checked."
                />
              </div>

              <div style={{ background: '#F0F9FF', border: '1px solid #B2D8E5', padding: '10px 12px', borderRadius: '10px', fontSize: '0.78rem', color: '#0077B6', marginBottom: '14px' }}>
                ℹ️ Saving this log will automatically update the <strong>Next Due Date</strong> to{' '}
                <strong>
                  {(() => {
                    const d = new Date(serviceDate || new Date());
                    d.setMonth(d.getMonth() + selectedTask.intervalMonths);
                    return d.toISOString().split('T')[0];
                  })()}
                </strong>.
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  className="app-btn app-btn-secondary"
                  onClick={() => setShowLogModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="app-btn app-btn-primary"
                >
                  Save & Update Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedTask && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0096C7', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} /> Service History - {selectedTask.title}
              </h3>
              <button onClick={() => setShowHistoryModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '60vh', overflowY: 'auto' }}>
              {selectedTask.serviceLogs && selectedTask.serviceLogs.length > 0 ? (
                selectedTask.serviceLogs.map((log) => (
                  <div key={log.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px 12px', borderRadius: '10px', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span style={{ color: '#0077B6' }}>{log.date}</span>
                      <span style={{ color: '#D97706' }}>₹{log.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ color: '#475569', marginTop: '2px' }}>Technician: {log.technician || 'N/A'}</div>
                    {log.notes && <div style={{ color: '#64748B', fontStyle: 'italic', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #F1F5F9' }}>{log.notes}</div>}
                  </div>
                ))
              ) : (
                <p style={{ color: '#64748B', textAlign: 'center', padding: '20px 0', fontSize: '0.86rem' }}>
                  No previous service logs recorded yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add New AMC Task Modal */}
      {showNewTaskModal && (
        <div className="modal-overlay" onClick={() => setShowNewTaskModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0096C7', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={20} /> Add New AMC / Servicing Schedule
            </h3>

            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Task Title:</label>
                <input
                  type="text"
                  className="form-control"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Generator Oil & Filter Replacement"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label>Category:</label>
                  <select
                    className="form-control"
                    value={newTaskCategory}
                    onChange={(e: any) => setNewTaskCategory(e.target.value)}
                  >
                    <option value="Lift AMC">Lift AMC</option>
                    <option value="CCTV Audit">CCTV Audit</option>
                    <option value="Water Tank Sump">Water Tank Sump</option>
                    <option value="Generator & Pump">Generator & Pump</option>
                    <option value="Fire Safety">Fire Safety</option>
                    <option value="Pest Control">Pest Control</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Interval (Months):</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newTaskInterval}
                    onChange={(e) => setNewTaskInterval(Number(e.target.value))}
                    min="1"
                    max="24"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label>Est. AMC Cost (₹):</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newTaskCost}
                    onChange={(e) => setNewTaskCost(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label>Vendor Name:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newTaskVendor}
                    onChange={(e) => setNewTaskVendor(e.target.value)}
                    placeholder="Technician Company"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Vendor Phone Number:</label>
                <input
                  type="text"
                  className="form-control"
                  value={newTaskPhone}
                  onChange={(e) => setNewTaskPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                />
              </div>

              <div className="form-group">
                <label>Maintenance Notes:</label>
                <textarea
                  className="form-control"
                  style={{ height: '60px', resize: 'vertical' }}
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  placeholder="Servicing instructions..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  className="app-btn app-btn-secondary"
                  onClick={() => setShowNewTaskModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="app-btn app-btn-primary"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

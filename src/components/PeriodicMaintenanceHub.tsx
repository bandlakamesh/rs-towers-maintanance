import React, { useState } from 'react';
import type { PeriodicTask, ServiceLogEntry } from '../types';
import { Wrench, ShieldAlert, Calendar, CheckCircle2, AlertTriangle, Plus, History, Phone, MessageSquare, Clock } from 'lucide-react';

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
      return { label: `OVERDUE by ${Math.abs(diffDays)} Days`, badgeClass: 'bg-red-500/20 text-red-300 border-red-500/40', icon: AlertTriangle, days: diffDays };
    } else if (diffDays <= 30) {
      return { label: `Due Soon (${diffDays} Days Left)`, badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: Clock, days: diffDays };
    } else {
      return { label: `Healthy (${diffDays} Days Left)`, badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: CheckCircle2, days: diffDays };
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

    // Calculate next due date by adding intervalMonths to serviceDate
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
    // Reset
    setNewTaskTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900/40 via-cyan-900/40 to-emerald-900/40 border border-teal-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
                <Wrench className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  Building Asset AMC & Maintenance Hub
                </h2>
                <p className="text-teal-200/80 text-sm mt-0.5">
                  Track 6-Month Lift Servicing, CCTV Audits, Water Tank Sanitization, Motors & Fire Safety
                </p>
              </div>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold rounded-xl transition-all duration-200 shadow-lg shadow-teal-500/20 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Periodic AMC Task
            </button>
          )}
        </div>
      </div>

      {/* Grid of Periodic Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => {
          const status = getStatusBadge(task.nextDueDate);
          const StatusIcon = status.icon;

          return (
            <div
              key={task.id}
              className="bg-slate-900/70 border border-slate-800 hover:border-teal-500/50 rounded-2xl p-5 shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Category & Status */}
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/20 uppercase tracking-wider">
                    {task.category} ({task.intervalMonths} Months)
                  </span>

                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${status.badgeClass}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.label}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                  {task.title}
                </h3>
                <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                  {task.notes || 'Routine maintenance and health inspection schedule.'}
                </p>

                {/* Dates & Financials */}
                <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-teal-400" />
                      Last Serviced:
                    </span>
                    <span className="font-medium text-white">{task.lastServicedDate || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Next Due Date:
                    </span>
                    <span className="font-bold text-teal-300">{task.nextDueDate}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300 pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Est. AMC Cost:</span>
                    <span className="font-bold text-amber-400">₹{task.estimatedCost.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Vendor Contact */}
                {task.vendorName && (
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50">
                    <span className="truncate max-w-[160px] font-medium text-slate-300">
                      👤 {task.vendorName}
                    </span>

                    {task.vendorPhone && (
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${task.vendorPhone}`}
                          className="p-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-md transition-colors"
                          title="Call Vendor"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`https://api.whatsapp.com/send?phone=91${task.vendorPhone}&text=${encodeURIComponent(`Hi ${task.vendorName}, regarding ${task.title} for RS Towers Apartment.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 rounded-md transition-colors"
                          title="WhatsApp Vendor"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedTask(task);
                    setShowHistoryModal(true);
                  }}
                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <History className="w-3.5 h-3.5 text-teal-400" />
                  History ({task.serviceLogs?.length || 0})
                </button>

                {isAdmin && (
                  <button
                    onClick={() => handleOpenLogModal(task)}
                    className="flex-1 py-2 px-3 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Log Service
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Log Service Modal */}
      {showLogModal && selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-teal-500/40 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-teal-400" />
              Log Completed Service / AMC
            </h3>
            <p className="text-xs text-teal-200/80">
              Task: <strong className="text-white">{selectedTask.title}</strong> ({selectedTask.intervalMonths}-Month Cycle)
            </p>

            <form onSubmit={handleSaveServiceLog} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Service Completion Date</label>
                <input
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Actual Amount Paid (₹)</label>
                <input
                  type="number"
                  value={serviceAmount}
                  onChange={(e) => setServiceAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Technician / Vendor Name</label>
                <input
                  type="text"
                  value={serviceTechnician}
                  onChange={(e) => setServiceTechnician(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  placeholder="e.g. Raju Elevator Technician"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Service Notes / Parts Replaced</label>
                <textarea
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500 h-20"
                  placeholder="e.g. Wire rope oiled, safety limit switch checked, bill receipt saved."
                />
              </div>

              <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-300 text-[11px]">
                ℹ️ Saving this log will automatically update the <strong>Next Due Date</strong> to{' '}
                <strong>
                  {(() => {
                    const d = new Date(serviceDate || new Date());
                    d.setMonth(d.getMonth() + selectedTask.intervalMonths);
                    return d.toISOString().split('T')[0];
                  })()}
                </strong>.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-teal-500/20"
                >
                  Save & Update Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service History Modal */}
      {showHistoryModal && selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-teal-400" />
                Service History - {selectedTask.title}
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 pr-1 text-xs">
              {selectedTask.serviceLogs && selectedTask.serviceLogs.length > 0 ? (
                selectedTask.serviceLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-white font-bold">
                      <span className="text-teal-300">{log.date}</span>
                      <span className="text-amber-400">₹{log.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-slate-400">Technician: {log.technician || 'N/A'}</div>
                    {log.notes && <div className="text-slate-300 italic pt-1 border-t border-slate-900">{log.notes}</div>}
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-6">No previous service logs recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add New AMC Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-teal-500/40 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-teal-400" />
              Add New AMC / Servicing Schedule
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  placeholder="e.g. Generator Oil & Filter Replacement"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Category</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as PeriodicTask['category'])}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Lift AMC">Lift AMC</option>
                    <option value="CCTV Audit">CCTV Audit</option>
                    <option value="Water Tank Sump">Water Tank Sump</option>
                    <option value="Generator & Pump">Generator & Pump</option>
                    <option value="Fire Safety">Fire Safety</option>
                    <option value="Pest Control">Pest Control</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Interval (Months)</label>
                  <input
                    type="number"
                    value={newTaskInterval}
                    onChange={(e) => setNewTaskInterval(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                    min="1"
                    max="24"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Est. AMC Cost (₹)</label>
                  <input
                    type="number"
                    value={newTaskCost}
                    onChange={(e) => setNewTaskCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Vendor Name</label>
                  <input
                    type="text"
                    value={newTaskVendor}
                    onChange={(e) => setNewTaskVendor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                    placeholder="Technician Company"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Vendor Phone Number</label>
                <input
                  type="text"
                  value={newTaskPhone}
                  onChange={(e) => setNewTaskPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  placeholder="10-digit mobile number"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Maintenance Notes</label>
                <textarea
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500 h-16"
                  placeholder="Instructions for servicing..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-teal-500/20"
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

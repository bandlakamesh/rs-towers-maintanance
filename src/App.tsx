import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Table, Wrench, Contact, Megaphone, Landmark, BarChart2, Calendar, Plus, UserCheck, Trash2, ShieldAlert, Shield, X } from 'lucide-react';
import type { AppState, MonthMaintenanceRecord, FlatReading, WaterCalculationConfig, CommonExpenseItem, PaymentMode, PeriodicTask, ApartmentVendor, NoticeItem, CorpusFundConfig, UserRole, CommitteeMember } from './types';
import { loadAppState, fetchLatestCloudState, syncToCloudRemote } from './utils/storage';
import { recalculateMonthRecord } from './utils/calculator';

import { Navbar } from './components/Navbar';
import { MaintenanceTable } from './components/MaintenanceTable';
import { ExpenseBreakdown } from './components/ExpenseBreakdown';
import { FlatOccupantsDirectory } from './components/FlatOccupantsDirectory';
import { PaymentModal } from './components/PaymentModal';
import { AdminPinModal } from './components/AdminPinModal';
import { MonthSelectorModal } from './components/MonthSelectorModal';
import { PeriodicMaintenanceHub } from './components/PeriodicMaintenanceHub';
import { VendorDirectory } from './components/VendorDirectory';
import { NoticeBoard } from './components/NoticeBoard';
import { CorpusFundTracker } from './components/CorpusFundTracker';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ApartmentCommittee } from './components/ApartmentCommittee';
import { INITIAL_APP_STATE } from './data/initialData';
import { subscribeToFirebaseState } from './utils/firebaseStorage';

export const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<'table' | 'analytics' | 'occupants' | 'committee' | 'corpus' | 'amc' | 'vendors' | 'notices'>('table');

  // Role Security State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => localStorage.getItem('rs_towers_maint_is_admin') === 'true');
  const [currentAdminFlat, setCurrentAdminFlat] = useState<string>(() => localStorage.getItem('rs_towers_maint_admin_flat') || '302');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  const maintenanceLeadFlats = appState.maintenanceLeadFlats || ['101'];
  const userRole: UserRole = !isAdmin
    ? 'PublicResident'
    : currentAdminFlat === (appState.rootFlat || '302')
    ? 'RootAdmin'
    : maintenanceLeadFlats.includes(currentAdminFlat)
    ? 'MaintenanceLead'
    : 'CoAdmin';

  const canEditMaintenance = userRole === 'RootAdmin' || userRole === 'MaintenanceLead';

  // Payment & Month Modals State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [selectedFlatForPayment, setSelectedFlatForPayment] = useState<string>('101');
  const [isNewMonthModalOpen, setIsNewMonthModalOpen] = useState<boolean>(false);

  // Past Month Confirmation Safeguard Modal State
  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionType: 'delete' | 'modify';
    onConfirm: () => void;
  } | null>(null);

  const activeRecord: MonthMaintenanceRecord = appState.months[appState.activeMonthId] || Object.values(appState.months)[0];

  // Auto-reset activeTab to 'table' for public residents if on an admin tab
  useEffect(() => {
    if (!isAdmin && ['analytics', 'occupants', 'corpus', 'amc', 'vendors', 'notices'].includes(activeTab)) {
      setActiveTab('table');
    }
  }, [isAdmin, activeTab]);

  // Live Firebase Realtime DB listener & polling fallback
  useEffect(() => {
    let isMounted = true;

    // Subscribe to Firebase Realtime DB for instantaneous live cloud sync across all devices
    const unsubscribeFirebase = subscribeToFirebaseState((remoteState) => {
      if (isMounted && remoteState) {
        setAppState(remoteState);
      }
    });

    const pullCloud = async () => {
      const cloud = await fetchLatestCloudState();
      if (isMounted && cloud) {
        setAppState(cloud);
      }
    };

    pullCloud();

    const interval = setInterval(pullCloud, 10000);

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('rs_towers_maintenance_sync');
      channel.onmessage = (event) => {
        if (event.data?.type === 'STATE_UPDATE' && event.data.state) {
          setAppState(event.data.state);
        }
      };
    }

    return () => {
      isMounted = false;
      unsubscribeFirebase();
      clearInterval(interval);
    };
  }, []);

  const handleStateUpdate = (newState: AppState) => {
    setAppState(newState);
    syncToCloudRemote(newState);
  };

  const handleUpdateRecord = (updatedRecord: MonthMaintenanceRecord) => {
    const allMonthIds = Object.keys(appState.months);
    const isLatest = updatedRecord.monthId === allMonthIds[allMonthIds.length - 1];

    // If modifying past month sheet, enforce Root Admin restriction & Confirmation Safeguard Modal
    if (!isLatest && userRole !== 'RootAdmin') {
      alert(`🔒 Permission Denied: Past month calculation sheets (${updatedRecord.monthId}) can only be modified by Root Super Admin (Flat #302 - Kamesh).`);
      return;
    }

    const applyMutation = () => {
      const recalculated = recalculateMonthRecord(updatedRecord);
      const newState: AppState = {
        ...appState,
        months: {
          ...appState.months,
          [recalculated.monthId]: recalculated,
        },
        lastUpdated: Date.now(),
      };
      setAppState(newState);
      syncToCloudRemote(newState);
    };

    if (!isLatest && userRole === 'RootAdmin') {
      setConfirmModalData({
        isOpen: true,
        title: `⚠️ Modify Historical Month (${updatedRecord.monthId})`,
        message: `Root Admin Safeguard: You are attempting to modify a historical month maintenance record (${updatedRecord.monthId}). Are you sure you want to save these past changes?`,
        actionType: 'modify',
        onConfirm: applyMutation,
      });
    } else {
      applyMutation();
    }
  };

  const handleDeleteMonthSheet = (monthId: string) => {
    if (userRole !== 'RootAdmin') {
      alert('🔒 Permission Denied: Only Root Super Admin (Flat #302 - Kamesh) can delete historical calculation sheets.');
      return;
    }

    const allMonthIds = Object.keys(appState.months);
    if (allMonthIds.length <= 1) {
      alert('⚠️ Cannot delete the only remaining maintenance sheet.');
      return;
    }

    setConfirmModalData({
      isOpen: true,
      title: `🚨 Delete Calculation Sheet (${monthId})`,
      message: `Root Admin Safeguard: Are you sure you want to PERMANENTLY DELETE calculation sheet '${monthId}'? All readings and calculation data for this month will be removed.`,
      actionType: 'delete',
      onConfirm: () => {
        const remainingMonths = { ...appState.months };
        delete remainingMonths[monthId];
        const newActiveId = Object.keys(remainingMonths)[0];

        const newState: AppState = {
          ...appState,
          activeMonthId: newActiveId,
          months: remainingMonths,
          lastUpdated: Date.now(),
        };
        setAppState(newState);
        syncToCloudRemote(newState);
      },
    });
  };

  const handleUpdateReadings = (updatedReadings: FlatReading[]) => {
    handleUpdateRecord({
      ...activeRecord,
      flatReadings: updatedReadings,
    });
  };

  const handleUpdateFlatDirectory = (updatedReadings: FlatReading[]) => {
    if (!isAdmin) {
      alert('🔒 Permission Denied: Only Maintenance Lead & Admins can update flat directory details.');
      return;
    }

    const updatedMonths = { ...appState.months };
    Object.keys(updatedMonths).forEach((mId) => {
      const month = updatedMonths[mId];
      const newReadings = month.flatReadings.map((reading) => {
        const match = updatedReadings.find((u) => u.flatNo === reading.flatNo);
        if (match) {
          return {
            ...reading,
            ownerName: match.ownerName,
            ownerPhone: match.ownerPhone,
            residentName: match.residentName,
            tenantPhone: match.tenantPhone,
            residentType: match.residentType,
            isOccupied: match.isOccupied,
          };
        }
        return reading;
      });

      updatedMonths[mId] = recalculateMonthRecord({
        ...month,
        flatReadings: newReadings,
      });
    });

    const newState: AppState = {
      ...appState,
      months: updatedMonths,
      lastUpdated: Date.now(),
    };

    setAppState(newState);
    syncToCloudRemote(newState);
  };

  const handleUpdateWaterConfig = (config: WaterCalculationConfig) => {
    handleUpdateRecord({
      ...activeRecord,
      waterConfig: config,
    });
  };

  const handleUpdateCommonExpenses = (expenses: CommonExpenseItem[]) => {
    handleUpdateRecord({
      ...activeRecord,
      commonExpenses: expenses,
    });
  };

  const handleSavePayment = (flatNo: string, amount: number, paymentMode: PaymentMode, notes: string) => {
    const updated = activeRecord.flatReadings.map((f) => {
      if (f.flatNo === flatNo) {
        const newPaid = f.paidAmount + amount;
        return {
          ...f,
          paidAmount: newPaid,
          paymentMode,
          notes: notes || f.notes,
        };
      }
      return f;
    });

    handleUpdateReadings(updated);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleCreateMonth = (newMonthRecord: MonthMaintenanceRecord) => {
    const newState: AppState = {
      ...appState,
      activeMonthId: newMonthRecord.monthId,
      months: {
        ...appState.months,
        [newMonthRecord.monthId]: newMonthRecord,
      },
      lastUpdated: Date.now(),
    };
    setAppState(newState);
    syncToCloudRemote(newState);
  };

  const handleSelectMonth = (monthId: string) => {
    const newState: AppState = {
      ...appState,
      activeMonthId: monthId,
    };
    setAppState(newState);
    syncToCloudRemote(newState);
  };

  const handleToggleFlatAdmin = (flatNo: string) => {
    if (flatNo === '302') return;
    const currentAdminFlats = appState.adminFlats || ['302'];
    const exists = currentAdminFlats.includes(flatNo);
    const updated = exists ? currentAdminFlats.filter((f) => f !== flatNo) : [...currentAdminFlats, flatNo];

    const newState: AppState = {
      ...appState,
      adminFlats: updated,
      lastUpdated: Date.now(),
    };
    setAppState(newState);
    syncToCloudRemote(newState);
  };

  const handleSetFlatRole = (flatNo: string, role: 'MaintenanceLead' | 'CoAdmin' | 'Resident') => {
    if (flatNo === (appState.rootFlat || '302')) return;

    let currentAdminFlats = appState.adminFlats || ['302'];
    let currentMaintFlats = appState.maintenanceLeadFlats || ['101'];

    if (role === 'MaintenanceLead') {
      if (!currentMaintFlats.includes(flatNo)) {
        currentMaintFlats = [...currentMaintFlats, flatNo];
      }
      if (!currentAdminFlats.includes(flatNo)) {
        currentAdminFlats = [...currentAdminFlats, flatNo];
      }
    } else if (role === 'CoAdmin') {
      currentMaintFlats = currentMaintFlats.filter((f) => f !== flatNo);
      if (!currentAdminFlats.includes(flatNo)) {
        currentAdminFlats = [...currentAdminFlats, flatNo];
      }
    } else {
      currentMaintFlats = currentMaintFlats.filter((f) => f !== flatNo);
      currentAdminFlats = currentAdminFlats.filter((f) => f !== flatNo);
    }

    const newState: AppState = {
      ...appState,
      adminFlats: currentAdminFlats,
      maintenanceLeadFlats: currentMaintFlats,
      lastUpdated: Date.now(),
    };
    setAppState(newState);
    syncToCloudRemote(newState);
  };

  // Handlers for Periodic AMC Tasks
  const handleUpdatePeriodicTask = (updatedTask: PeriodicTask) => {
    const updatedTasks = (appState.periodicTasks || []).map((t) => (t.id === updatedTask.id ? updatedTask : t));
    const newState: AppState = {
      ...appState,
      periodicTasks: updatedTasks,
      lastUpdated: Date.now(),
    };
    setAppState(newState);
    syncToCloudRemote(newState);
  };

  const handleAddPeriodicTask = (newTask: PeriodicTask) => {
    const updatedTasks = [newTask, ...(appState.periodicTasks || [])];
    const newState: AppState = {
      ...appState,
      periodicTasks: updatedTasks,
      lastUpdated: Date.now(),
    };
    setAppState(newState);
    syncToCloudRemote(newState);
  };

  // Handlers for Vendors
  const handleAddVendor = (newVendor: ApartmentVendor) => {
    const updatedVendors = [newVendor, ...(appState.vendors || [])];
    const newState: AppState = {
      ...appState,
      vendors: updatedVendors,
      lastUpdated: Date.now(),
    };
    setAppState(newState);
    syncToCloudRemote(newState);
  };

  const handleDeleteVendor = (vendorId: string) => {
    const updatedVendors = (appState.vendors || []).filter((v) => v.id !== vendorId);
    const newState: AppState = {
      ...appState,
      vendors: updatedVendors,
      lastUpdated: Date.now(),
    };
    setAppState(newState);
    syncToCloudRemote(newState);
  };

  // Handlers for Notices
  const handleAddNotice = (newNotice: NoticeItem) => {
    const updatedNotices = [newNotice, ...(appState.notices || [])];
    const newState: AppState = {
      ...appState,
      notices: updatedNotices,
      lastUpdated: Date.now(),
    };
    setAppState(newState);
    syncToCloudRemote(newState);
  };

  const handleDeleteNotice = (noticeId: string) => {
    const updatedNotices = (appState.notices || []).filter((n) => n.id !== noticeId);
    const newState: AppState = {
      ...appState,
      notices: updatedNotices,
      lastUpdated: Date.now(),
    };
    setAppState(newState);
    syncToCloudRemote(newState);
  };

  // Handlers for Committee Members
  const handleAddCommitteeMember = (newMember: CommitteeMember) => {
    const currentMembers = appState.committeeMembers || INITIAL_APP_STATE.committeeMembers || [];
    const newState: AppState = {
      ...appState,
      committeeMembers: [newMember, ...currentMembers],
      lastUpdated: Date.now(),
    };
    setAppState(newState);
    syncToCloudRemote(newState);
  };

  const handleUpdateCommitteeMember = (updatedMember: CommitteeMember) => {
    const currentMembers = appState.committeeMembers || INITIAL_APP_STATE.committeeMembers || [];
    const updated = currentMembers.map((m) => (m.id === updatedMember.id ? updatedMember : m));
    const newState: AppState = {
      ...appState,
      committeeMembers: updated,
      lastUpdated: Date.now(),
    };
    setAppState(newState);
    syncToCloudRemote(newState);
  };

  const handleDeleteCommitteeMember = (memberId: string) => {
    const currentMembers = appState.committeeMembers || INITIAL_APP_STATE.committeeMembers || [];
    const updated = currentMembers.filter((m) => m.id !== memberId);
    const newState: AppState = {
      ...appState,
      committeeMembers: updated,
      lastUpdated: Date.now(),
    };
    setAppState(newState);
    syncToCloudRemote(newState);
  };

  // Handler for Corpus Config
  const handleUpdateCorpusConfig = (updatedConfig: CorpusFundConfig) => {
    const newState: AppState = {
      ...appState,
      corpusConfig: updatedConfig,
      lastUpdated: Date.now(),
    };
    setAppState(newState);
    syncToCloudRemote(newState);
  };

  const defaultCorpusConfig: CorpusFundConfig = appState.corpusConfig || {
    monthlyRatePerFlat: 200,
    pastMonthsCollected: 12,
    baselineTotalCollected: 33600,
    corpusExpenses: [
      {
        id: 'cexp-1',
        date: '2026-08-15',
        title: '13th Corpus Fund Reserve Allocation',
        amount: 2800,
        category: 'Lift Overhaul',
        approvedBy: 'Bobby (Flat 101 - Maintenance Lead)',
        notes: 'Annual reserve set aside for major lift wire rope inspection and emergency repairs.'
      }
    ]
  };

  const monthIds = Object.keys(appState.months);

  const totalCollected = activeRecord.flatReadings
    .filter((f) => f.flatNo !== 'WM' && f.isOccupied)
    .reduce((sum, f) => sum + f.paidAmount, 0);
  const collectionPercentage = activeRecord.totalGrandCollectionTarget > 0
    ? Math.round((totalCollected / activeRecord.totalGrandCollectionTarget) * 100)
    : 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar */}
      <Navbar
        state={appState}
        onStateUpdate={handleStateUpdate}
        onGoHome={() => setActiveTab('table')}
        isAdmin={isAdmin}
        userRole={userRole}
        currentAdminFlat={currentAdminFlat}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />

      {/* Main Container */}
      <main style={{ maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '16px 16px 0 16px', flex: 1 }}>
        
        {/* Dedicated Month Filter & Control Bar */}
        <div className="month-control-bar no-print">
          <div className="month-pill-group">
            <div className="month-pill">
              <Calendar size={18} color="#FFD166" style={{ flexShrink: 0 }} />
              <span className="month-label">Maintenance Month:</span>
              <select
                value={appState.activeMonthId}
                onChange={(e) => handleSelectMonth(e.target.value)}
                className="month-select"
              >
                {monthIds.map((id) => (
                  <option key={id} value={id} style={{ color: '#0F172A', background: '#FFFFFF' }}>
                    {appState.months[id]?.monthTitle || id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="month-actions-group">
            {/* Quick Month Collection Summary Pill */}
            <div className="month-kpi-pill">
              <span>Target: <strong>₹{activeRecord.totalGrandCollectionTarget.toLocaleString('en-IN')}</strong></span>
              <span>•</span>
              <span>Collected: <strong style={{ color: '#059669' }}>₹{totalCollected.toLocaleString('en-IN')}</strong> ({collectionPercentage}%)</span>
            </div>

            {/* Admin Action for New Month - Root Admin & Maintenance Lead */}
            {canEditMaintenance && (
              <button
                onClick={() => setIsNewMonthModalOpen(true)}
                className="app-btn app-btn-primary month-new-btn"
                style={{ padding: '7px 14px', fontSize: '0.82rem' }}
                title="Create New Month Calculation Sheet"
              >
                <Plus size={15} /> Create New Month
              </button>
            )}

            {/* Root Admin Only Delete Month Sheet Button */}
            {userRole === 'RootAdmin' && monthIds.length > 1 && (
              <button
                onClick={() => handleDeleteMonthSheet(appState.activeMonthId)}
                className="app-btn"
                style={{
                  background: '#FEF2F2',
                  color: '#DC2626',
                  border: '1px solid #FCA5A5',
                  padding: '7px 12px',
                  fontSize: '0.82rem',
                }}
                title="Delete Active Historical Calculation Sheet (Root Admin Kamesh Only)"
              >
                <Trash2 size={15} /> Delete Sheet
              </button>
            )}
          </div>
        </div>
        
        {/* Navigation Tabs (Desktop) */}
        <nav className="chip-group desktop-chip-nav" style={{ marginBottom: '20px' }}>
          <button
            className={`chip ${activeTab === 'table' ? 'active' : ''}`}
            onClick={() => setActiveTab('table')}
          >
            <Table size={15} /> 📊 Monthly Maintenance Sheet
          </button>

          {isAdmin && (
            <button
              className={`chip ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart2 size={15} /> 📈 Analytics & Leak Alerts
            </button>
          )}

          {isAdmin && (
            <button
              className={`chip ${activeTab === 'occupants' ? 'active' : ''}`}
              onClick={() => setActiveTab('occupants')}
            >
              <UserCheck size={15} /> 👥 Flat Owners & Directory
            </button>
          )}

          <button
            className={`chip ${activeTab === 'committee' ? 'active' : ''}`}
            onClick={() => setActiveTab('committee')}
          >
            <Shield size={15} /> 🏛️ Executive Committee
          </button>

          {isAdmin && (
            <button
              className={`chip ${activeTab === 'corpus' ? 'active' : ''}`}
              onClick={() => setActiveTab('corpus')}
            >
              <Landmark size={15} /> 🏛️ Corpus Fund Tracker (₹200/mo)
            </button>
          )}

          {isAdmin && (
            <button
              className={`chip ${activeTab === 'amc' ? 'active' : ''}`}
              onClick={() => setActiveTab('amc')}
            >
              <Wrench size={15} /> 🛠️ Building Asset AMC (Lift 6m, CCTV, Tank)
            </button>
          )}

          {isAdmin && (
            <button
              className={`chip ${activeTab === 'vendors' ? 'active' : ''}`}
              onClick={() => setActiveTab('vendors')}
            >
              <Contact size={15} /> ☎️ Vendor Directory ({appState.vendors?.length || 0})
            </button>
          )}

          {isAdmin && (
            <button
              className={`chip ${activeTab === 'notices' ? 'active' : ''}`}
              onClick={() => setActiveTab('notices')}
            >
              <Megaphone size={15} /> 📢 Notice Board
            </button>
          )}
        </nav>

        {/* Tab 1: Maintenance Calculations Table */}
        {activeTab === 'table' && (
          <>
            <MaintenanceTable
              record={activeRecord}
              isAdmin={canEditMaintenance || userRole === 'CoAdmin'}
              dueDateDay={appState.dueDateDay || 10}
              onUpdateReadings={handleUpdateReadings}
              onSelectFlatPayment={(flatNo) => {
                setSelectedFlatForPayment(flatNo);
                setIsPaymentModalOpen(true);
              }}
            />

            <ExpenseBreakdown
              record={activeRecord}
              isAdmin={canEditMaintenance}
              onUpdateWaterConfig={handleUpdateWaterConfig}
              onUpdateCommonExpenses={handleUpdateCommonExpenses}
            />
          </>
        )}

        {/* Tab 2: Analytics Dashboard */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            appState={appState}
            activeRecord={activeRecord}
          />
        )}

        {/* Tab 3: Flat Occupants & Directory */}
        {activeTab === 'occupants' && (
          <FlatOccupantsDirectory
            record={activeRecord}
            isAdmin={isAdmin}
            userRole={userRole}
            onUpdateReadings={handleUpdateReadings}
            onUpdateDirectory={handleUpdateFlatDirectory}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
          />
        )}

        {/* Tab 4: Executive Committee Dedicated Tab */}
        {activeTab === 'committee' && (
          <ApartmentCommittee
            committeeMembers={appState.committeeMembers || INITIAL_APP_STATE.committeeMembers || []}
            flatReadings={activeRecord.flatReadings}
            userRole={userRole}
            isAdmin={isAdmin}
            onAddMember={handleAddCommitteeMember}
            onUpdateMember={handleUpdateCommitteeMember}
            onDeleteMember={handleDeleteCommitteeMember}
          />
        )}

        {/* Tab 5: Dedicated Corpus Fund Tracker */}
        {activeTab === 'corpus' && (
          <CorpusFundTracker
            corpusConfig={defaultCorpusConfig}
            activeRecord={activeRecord}
            isAdmin={canEditMaintenance}
            onUpdateCorpusConfig={handleUpdateCorpusConfig}
          />
        )}

        {/* Tab 6: Building Asset AMC Hub */}
        {activeTab === 'amc' && (
          <PeriodicMaintenanceHub
            tasks={appState.periodicTasks || []}
            isAdmin={canEditMaintenance}
            onUpdateTask={handleUpdatePeriodicTask}
            onAddTask={handleAddPeriodicTask}
          />
        )}

        {/* Tab 7: Vendors Directory */}
        {activeTab === 'vendors' && (
          <VendorDirectory
            vendors={appState.vendors || []}
            isAdmin={canEditMaintenance}
            onAddVendor={handleAddVendor}
            onDeleteVendor={handleDeleteVendor}
          />
        )}

        {/* Tab 8: Notice Board */}
        {activeTab === 'notices' && (
          <NoticeBoard
            notices={appState.notices || []}
            isAdmin={isAdmin}
            onAddNotice={handleAddNotice}
            onDeleteNotice={handleDeleteNotice}
          />
        )}

      </main>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', padding: '18px 20px', textAlign: 'center', fontSize: '0.86rem', color: '#E0F2FE', borderTop: '2px solid #48CAE4', background: 'linear-gradient(135deg, #0E5A73 0%, #137A9A 100%)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <strong style={{ color: '#FFFFFF' }}>R.S Towers <span style={{ color: '#FFD166' }}>Apartment Monthly Maintenance Tracker</span></strong>
        </div>
      </footer>

      {/* Modals */}
      {isPaymentModalOpen && (
        <PaymentModal
          record={activeRecord}
          initialFlatNo={selectedFlatForPayment}
          onClose={() => setIsPaymentModalOpen(false)}
          onSavePayment={handleSavePayment}
        />
      )}

      {isAdminModalOpen && (
        <AdminPinModal
          onClose={() => setIsAdminModalOpen(false)}
          isAdmin={isAdmin}
          currentAdminFlat={currentAdminFlat}
          onAdminLoginSuccess={(flatNo) => {
            setIsAdmin(true);
            setCurrentAdminFlat(flatNo);
            localStorage.setItem('rs_towers_maint_is_admin', 'true');
            localStorage.setItem('rs_towers_maint_admin_flat', flatNo);
          }}
          onAdminLogout={() => {
            setIsAdmin(false);
            localStorage.setItem('rs_towers_maint_is_admin', 'false');
          }}
          flatsList={activeRecord.flatReadings}
          adminFlats={appState.adminFlats}
          maintenanceLeadFlats={appState.maintenanceLeadFlats || ['101']}
          rootFlat={appState.rootFlat}
          onToggleFlatAdmin={handleToggleFlatAdmin}
          onSetFlatRole={handleSetFlatRole}
        />
      )}

      {isNewMonthModalOpen && (
        <MonthSelectorModal
          currentRecord={activeRecord}
          onClose={() => setIsNewMonthModalOpen(false)}
          onCreateMonth={handleCreateMonth}
        />
      )}

      {/* Root Admin Historical Modification & Deletion Safeguard Modal */}
      {confirmModalData?.isOpen && (
        <div
          className="modal-overlay"
          onClick={() => setConfirmModalData(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 9999,
          }}
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '520px',
              width: '100%',
              background: '#FFFFFF',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.4)',
              border: '1px solid #CBD5E1',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative',
              zIndex: 10000,
            }}
          >
            {/* Header Banner */}
            <div
              style={{
                background: confirmModalData.actionType === 'delete'
                  ? 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 50%, #B91C1C 100%)'
                  : 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                padding: '20px 24px',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    flexShrink: 0,
                  }}
                >
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>
                    {confirmModalData.actionType === 'delete' ? '🚨 Delete Calculation Sheet' : confirmModalData.title}
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: confirmModalData.actionType === 'delete' ? '#FCA5A5' : '#94A3B8', fontWeight: 700 }}>
                    👑 Root Super Admin Safeguard
                  </span>
                </div>
              </div>

              <button
                onClick={() => setConfirmModalData(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', background: '#FFFFFF' }}>
              <div
                style={{
                  background: confirmModalData.actionType === 'delete' ? '#FEF2F2' : '#EFF6FF',
                  border: confirmModalData.actionType === 'delete' ? '1.5px solid #FCA5A5' : '1.5px solid #BFDBFE',
                  padding: '16px',
                  borderRadius: '16px',
                  marginBottom: '20px',
                }}
              >
                <p style={{ margin: 0, fontSize: '0.92rem', color: confirmModalData.actionType === 'delete' ? '#991B1B' : '#1E40AF', lineHeight: 1.5, fontWeight: 600 }}>
                  {confirmModalData.message}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setConfirmModalData(null)}
                  className="app-btn app-btn-secondary"
                  style={{ padding: '10px 20px', fontSize: '0.88rem' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    confirmModalData.onConfirm();
                    setConfirmModalData(null);
                  }}
                  className="app-btn"
                  style={{
                    background: confirmModalData.actionType === 'delete'
                      ? 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)'
                      : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    padding: '10px 22px',
                    fontSize: '0.88rem',
                    boxShadow: confirmModalData.actionType === 'delete'
                      ? '0 4px 14px rgba(220, 38, 38, 0.4)'
                      : '0 4px 14px rgba(37, 99, 235, 0.4)',
                  }}
                >
                  {confirmModalData.actionType === 'delete' ? '🚨 Yes, Permanently Delete' : '✅ Yes, Save Past Modifications'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Mobile Glassmorphic Fixed Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav no-print">
        <button
          className={`mobile-nav-item ${activeTab === 'table' ? 'active' : ''}`}
          onClick={() => setActiveTab('table')}
        >
          <Table size={18} />
          <span>Sheet</span>
        </button>

        {isAdmin && (
          <button
            className={`mobile-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart2 size={18} />
            <span>Analytics</span>
          </button>
        )}

        {isAdmin && (
          <button
            className={`mobile-nav-item ${activeTab === 'occupants' ? 'active' : ''}`}
            onClick={() => setActiveTab('occupants')}
          >
            <UserCheck size={18} />
            <span>Directory</span>
          </button>
        )}

        <button
          className={`mobile-nav-item ${activeTab === 'committee' ? 'active' : ''}`}
          onClick={() => setActiveTab('committee')}
        >
          <Shield size={18} />
          <span>Committee</span>
        </button>

        {isAdmin && (
          <button
            className={`mobile-nav-item ${activeTab === 'corpus' ? 'active' : ''}`}
            onClick={() => setActiveTab('corpus')}
          >
            <Landmark size={18} />
            <span>Corpus</span>
          </button>
        )}

        {isAdmin && (
          <button
            className={`mobile-nav-item ${activeTab === 'amc' ? 'active' : ''}`}
            onClick={() => setActiveTab('amc')}
          >
            <Wrench size={18} />
            <span>AMC</span>
          </button>
        )}

        {isAdmin && (
          <button
            className={`mobile-nav-item ${activeTab === 'vendors' ? 'active' : ''}`}
            onClick={() => setActiveTab('vendors')}
          >
            <Contact size={18} />
            <span>Vendors</span>
          </button>
        )}

        {isAdmin && (
          <button
            className={`mobile-nav-item ${activeTab === 'notices' ? 'active' : ''}`}
            onClick={() => setActiveTab('notices')}
          >
            <Megaphone size={18} />
            <span>Notices</span>
          </button>
        )}
      </nav>

    </div>
  );
};

export default App;


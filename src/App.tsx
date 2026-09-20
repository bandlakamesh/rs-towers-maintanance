import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Table, Building, Wrench, Contact, Megaphone, Landmark, BarChart2 } from 'lucide-react';
import type { AppState, MonthMaintenanceRecord, FlatReading, WaterCalculationConfig, CommonExpenseItem, PaymentMode, PeriodicTask, ApartmentVendor, NoticeItem, CorpusFundConfig } from './types';
import { loadAppState, fetchLatestCloudState, syncToCloudRemote } from './utils/storage';
import { recalculateMonthRecord } from './utils/calculator';

import { Navbar } from './components/Navbar';
import { MaintenanceTable } from './components/MaintenanceTable';
import { ExpenseBreakdown } from './components/ExpenseBreakdown';
import { FlatDirectory } from './components/FlatDirectory';
import { PaymentModal } from './components/PaymentModal';
import { AdminPinModal } from './components/AdminPinModal';
import { MonthSelectorModal } from './components/MonthSelectorModal';
import { PeriodicMaintenanceHub } from './components/PeriodicMaintenanceHub';
import { VendorDirectory } from './components/VendorDirectory';
import { NoticeBoard } from './components/NoticeBoard';
import { CorpusFundTracker } from './components/CorpusFundTracker';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { subscribeToFirebaseState } from './utils/firebaseStorage';

export const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<'table' | 'analytics' | 'corpus' | 'amc' | 'directory' | 'vendors' | 'notices'>('table');

  // Role Security State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => localStorage.getItem('rs_towers_maint_is_admin') === 'true');
  const [currentAdminFlat, setCurrentAdminFlat] = useState<string>(() => localStorage.getItem('rs_towers_maint_admin_flat') || '302');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Payment & Month Modals State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [selectedFlatForPayment, setSelectedFlatForPayment] = useState<string>('101');
  const [isNewMonthModalOpen, setIsNewMonthModalOpen] = useState<boolean>(false);

  const activeRecord: MonthMaintenanceRecord = appState.months[appState.activeMonthId] || Object.values(appState.months)[0];

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

  const handleUpdateReadings = (updatedReadings: FlatReading[]) => {
    handleUpdateRecord({
      ...activeRecord,
      flatReadings: updatedReadings,
    });
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar */}
      <Navbar
        state={appState}
        onStateUpdate={handleStateUpdate}
        onGoHome={() => setActiveTab('table')}
        isAdmin={isAdmin}
        currentAdminFlat={currentAdminFlat}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onOpenNewMonthModal={() => setIsNewMonthModalOpen(true)}
        onSelectMonth={handleSelectMonth}
      />

      {/* Main Container */}
      <main style={{ maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '16px 16px 0 16px', flex: 1 }}>
        
        {/* Navigation Tabs */}
        <nav className="chip-group" style={{ marginBottom: '20px' }}>
          <button
            className={`chip ${activeTab === 'table' ? 'active' : ''}`}
            onClick={() => setActiveTab('table')}
          >
            <Table size={15} /> Calculations Sheet Table
          </button>

          <button
            className={`chip ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart2 size={15} /> 📈 Analytics & Leak Alerts
          </button>

          <button
            className={`chip ${activeTab === 'corpus' ? 'active' : ''}`}
            onClick={() => setActiveTab('corpus')}
          >
            <Landmark size={15} /> 🏛️ Corpus Fund Tracker (₹200/mo)
          </button>

          <button
            className={`chip ${activeTab === 'amc' ? 'active' : ''}`}
            onClick={() => setActiveTab('amc')}
          >
            <Wrench size={15} /> 🛠️ Building Asset AMC (Lift 6m, CCTV, Tank)
          </button>

          <button
            className={`chip ${activeTab === 'directory' ? 'active' : ''}`}
            onClick={() => setActiveTab('directory')}
          >
            <Building size={15} /> Per-Flat Payment Cards ({activeRecord.flatReadings.filter((f) => f.flatNo !== 'WM' && f.isOccupied).length})
          </button>

          <button
            className={`chip ${activeTab === 'vendors' ? 'active' : ''}`}
            onClick={() => setActiveTab('vendors')}
          >
            <Contact size={15} /> ☎️ Vendor Directory ({appState.vendors?.length || 0})
          </button>

          <button
            className={`chip ${activeTab === 'notices' ? 'active' : ''}`}
            onClick={() => setActiveTab('notices')}
          >
            <Megaphone size={15} /> 📢 Notice Board
          </button>
        </nav>

        {/* Tab 1: Maintenance Calculations Table */}
        {activeTab === 'table' && (
          <>
            <MaintenanceTable
              record={activeRecord}
              isAdmin={isAdmin}
              dueDateDay={appState.dueDateDay || 10}
              onUpdateReadings={handleUpdateReadings}
            />

            <ExpenseBreakdown
              record={activeRecord}
              isAdmin={isAdmin}
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

        {/* Tab 2: Dedicated Corpus Fund Tracker */}
        {activeTab === 'corpus' && (
          <CorpusFundTracker
            corpusConfig={defaultCorpusConfig}
            activeRecord={activeRecord}
            isAdmin={isAdmin}
            onUpdateCorpusConfig={handleUpdateCorpusConfig}
          />
        )}

        {/* Tab 2: Building Asset AMC Hub */}
        {activeTab === 'amc' && (
          <PeriodicMaintenanceHub
            tasks={appState.periodicTasks || []}
            isAdmin={isAdmin}
            onUpdateTask={handleUpdatePeriodicTask}
            onAddTask={handleAddPeriodicTask}
          />
        )}

        {/* Tab 4: Flat Directory Cards */}
        {activeTab === 'directory' && (
          <FlatDirectory
            record={activeRecord}
            isAdmin={isAdmin}
            onSelectFlatPayment={(flatNo) => {
              setSelectedFlatForPayment(flatNo);
              setIsPaymentModalOpen(true);
            }}
          />
        )}

        {/* Tab 5: Vendors Directory */}
        {activeTab === 'vendors' && (
          <VendorDirectory
            vendors={appState.vendors || []}
            isAdmin={isAdmin}
            onAddVendor={handleAddVendor}
            onDeleteVendor={handleDeleteVendor}
          />
        )}

        {/* Tab 6: Notice Board */}
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
      <footer style={{ marginTop: '40px', padding: '20px', textAlign: 'center', fontSize: '0.86rem', color: '#E0F2FE', borderTop: '2px solid #48CAE4', background: 'linear-gradient(135deg, #0E5A73 0%, #137A9A 100%)' }}>
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
          rootFlat={appState.rootFlat}
          onToggleFlatAdmin={handleToggleFlatAdmin}
        />
      )}

      {isNewMonthModalOpen && (
        <MonthSelectorModal
          currentRecord={activeRecord}
          onClose={() => setIsNewMonthModalOpen(false)}
          onCreateMonth={handleCreateMonth}
        />
      )}

    </div>
  );
};

export default App;


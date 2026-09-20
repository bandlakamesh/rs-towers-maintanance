import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Table, Zap, Building } from 'lucide-react';
import type { AppState, MonthMaintenanceRecord, FlatReading, WaterCalculationConfig, CommonExpenseItem, PaymentMode } from './types';
import { loadAppState, fetchLatestCloudState, syncToCloudRemote } from './utils/storage';
import { recalculateMonthRecord } from './utils/calculator';

import { Navbar } from './components/Navbar';
import { MaintenanceTable } from './components/MaintenanceTable';
import { ExpenseBreakdown } from './components/ExpenseBreakdown';
import { FlatDirectory } from './components/FlatDirectory';
import { PaymentModal } from './components/PaymentModal';
import { AdminPinModal } from './components/AdminPinModal';
import { MonthSelectorModal } from './components/MonthSelectorModal';

export const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<'table' | 'expenses' | 'directory'>('table');

  // Role Security State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => localStorage.getItem('rs_towers_maint_is_admin') === 'true');
  const [currentAdminFlat, setCurrentAdminFlat] = useState<string>(() => localStorage.getItem('rs_towers_maint_admin_flat') || '302');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Payment & Month Modals State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [selectedFlatForPayment, setSelectedFlatForPayment] = useState<string>('101');
  const [isNewMonthModalOpen, setIsNewMonthModalOpen] = useState<boolean>(false);

  const activeRecord: MonthMaintenanceRecord = appState.months[appState.activeMonthId] || Object.values(appState.months)[0];

  // Auto-fetch cloud data & 10-second polling sync
  useEffect(() => {
    let isMounted = true;

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
            className={`chip ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            <Zap size={15} /> Building & Water Expenses Breakdown
          </button>

          <button
            className={`chip ${activeTab === 'directory' ? 'active' : ''}`}
            onClick={() => setActiveTab('directory')}
          >
            <Building size={15} /> Per-Flat Payment Cards ({activeRecord.flatReadings.filter((f) => f.flatNo !== 'WM' && f.isOccupied).length})
          </button>
        </nav>

        {/* Tab 1: Maintenance Calculations Table */}
        {activeTab === 'table' && (
          <>
            <MaintenanceTable
              record={activeRecord}
              isAdmin={isAdmin}
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

        {/* Tab 2: Expenses Breakdown */}
        {activeTab === 'expenses' && (
          <ExpenseBreakdown
            record={activeRecord}
            isAdmin={isAdmin}
            onUpdateWaterConfig={handleUpdateWaterConfig}
            onUpdateCommonExpenses={handleUpdateCommonExpenses}
          />
        )}

        {/* Tab 3: Flat Directory Cards */}
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

      </main>

      {/* Footer */}
      <footer style={{ marginTop: '40px', padding: '20px', textAlign: 'center', fontSize: '0.86rem', color: '#E0F2FE', borderTop: '2px solid #48CAE4', background: 'linear-gradient(135deg, #0E5A73 0%, #137A9A 100%)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <strong style={{ color: '#FFFFFF' }}>R.S Towers <span style={{ color: '#FFD166' }}>Apartment Monthly Maintenance Tracker</span></strong> • 100% Free & Lifetime Working
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

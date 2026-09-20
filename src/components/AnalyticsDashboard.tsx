import React, { useState } from 'react';
import type { AppState, MonthMaintenanceRecord } from '../types';
import { Droplets, PieChart, AlertTriangle, ShieldCheck, BarChart3, Activity } from 'lucide-react';

interface AnalyticsDashboardProps {
  appState: AppState;
  activeRecord: MonthMaintenanceRecord;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  appState,
  activeRecord,
}) => {
  const [selectedMonthId, setSelectedMonthId] = useState<string>(appState.activeMonthId);

  const monthRecord = appState.months[selectedMonthId] || activeRecord;
  const monthIds = Object.keys(appState.months);

  // 1. Financial KPIs
  const occupiedFlats = monthRecord.flatReadings.filter((f) => f.flatNo !== 'WM' && f.isOccupied);
  const occupiedCount = occupiedFlats.length || 14;

  const totalCollected = occupiedFlats.reduce((sum, f) => sum + f.paidAmount, 0);
  const collectionTarget = monthRecord.totalGrandCollectionTarget || 34503;
  const collectionPercentage = Math.min(100, Math.round((totalCollected / collectionTarget) * 100));

  const paidCount = occupiedFlats.filter((f) => f.status === 'Received').length;
  const pendingCount = occupiedCount - paidCount;

  // 2. Expense Category Breakdown
  const expensesByCategory = monthRecord.commonExpenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    Staff: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
    Utilities: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
    Corpus: { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
    Maintenance: { bg: '#E0F7FA', text: '#0077B6', border: '#48CAE4' },
    Others: { bg: '#F8FAFC', text: '#64748B', border: '#CBD5E1' },
  };

  // 3. Water Consumption Ranking & Leak Detection
  const sortedWaterFlats = [...occupiedFlats].sort((a, b) => b.consumedUnits - a.consumedUnits);
  const topWaterFlats = sortedWaterFlats.slice(0, 5);
  const highWaterAlertFlats = occupiedFlats.filter((f) => f.consumedUnits >= 15);

  const avgWaterUnitsPerFlat = Math.round(monthRecord.totalUnitsConsumed / occupiedCount);

  // 4. Historical Month Trend Data
  const historicalTrend = monthIds.map((id) => {
    const rec = appState.months[id];
    return {
      monthId: id,
      monthTitle: rec.monthTitle.replace('RS Towers ', '').replace(' Maintenance', ''),
      totalUnits: rec.totalUnitsConsumed,
      totalCost: rec.totalGrandCollectionTarget,
      unitRate: rec.calculatedUnitRate,
    };
  });

  const maxUnits = Math.max(1, ...historicalTrend.map((t) => t.totalUnits));

  return (
    <div style={{ marginBottom: '32px' }}>
      
      {/* Header Banner */}
      <div className="app-card" style={{
        background: 'linear-gradient(135deg, #0E5A73 0%, #137A9A 50%, #189AB4 100%)',
        color: '#FFFFFF',
        marginBottom: '20px',
        padding: '22px 26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderColor: '#48CAE4',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}>
            <Activity size={26} color="#FFD166" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              Apartment Financial & Water Analytics Hub
            </h2>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#E0F2FE' }}>
              Real-Time Collection Progress, Water Consumption Leak Alerts, and Expense Allocation Insights
            </p>
          </div>
        </div>

        {/* Month Filter Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.18)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '12px', padding: '6px 12px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFD166' }}>Analytics Period:</span>
          <select
            value={selectedMonthId}
            onChange={(e) => setSelectedMonthId(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.86rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {monthIds.map((id) => (
              <option key={id} value={id} style={{ color: '#0F172A', background: '#FFFFFF' }}>
                {appState.months[id]?.monthTitle || id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Financial & Operational Gauges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px', marginBottom: '22px' }}>
        
        {/* KPI 1: Collection Progress */}
        <div className="app-card" style={{ background: '#FFFFFF', borderLeft: '6px solid #059669' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              Collection Rate
            </span>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '6px' }}>
              {collectionPercentage}% Paid
            </span>
          </div>

          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
            ₹{totalCollected.toLocaleString('en-IN')}
          </div>

          <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '2px' }}>
            Target: <strong style={{ color: '#0077B6' }}>₹{collectionTarget.toLocaleString('en-IN')}</strong> ({paidCount}/{occupiedCount} Paid • <span style={{ color: '#DC2626' }}>{pendingCount} Pending</span>)
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '999px', marginTop: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${collectionPercentage}%`, height: '100%', background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)', borderRadius: '999px', transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* KPI 2: Water Consumption */}
        <div className="app-card" style={{ background: '#FFFFFF', borderLeft: '6px solid #0096C7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              Water Consumption
            </span>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0077B6', background: '#E0F7FA', padding: '2px 8px', borderRadius: '6px' }}>
              ₹{monthRecord.calculatedUnitRate}/Unit
            </span>
          </div>

          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Droplets size={22} color="#0096C7" /> {monthRecord.totalUnitsConsumed} <span style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 600 }}>Units</span>
          </div>

          <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '2px' }}>
            Billable: <strong>{monthRecord.netBillableWaterUnits} Units</strong> • Avg: <strong>{avgWaterUnitsPerFlat} Units/Flat</strong>
          </div>
        </div>

        {/* KPI 3: Common Maintenance Share */}
        <div className="app-card" style={{ background: '#FFFFFF', borderLeft: '6px solid #D97706' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              Common Maintenance
            </span>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#D97706', background: '#FFFBEB', padding: '2px 8px', borderRadius: '6px' }}>
              {monthRecord.commonExpenses.length} Items
            </span>
          </div>

          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
            ₹{monthRecord.totalCommonMaintenance.toLocaleString('en-IN')}
          </div>

          <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '2px' }}>
            Per-Flat Common Share: <strong style={{ color: '#D97706' }}>₹{Math.round(monthRecord.totalCommonMaintenance / occupiedCount).toLocaleString('en-IN')}</strong>
          </div>
        </div>

        {/* KPI 4: Building Health Score */}
        <div className="app-card" style={{ background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)', border: '2px solid #BAE6FD' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#0369A1', fontWeight: 800, textTransform: 'uppercase' }}>
              Building Health Score
            </span>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '6px' }}>
              Excellent
            </span>
          </div>

          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#0284C7', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={24} color="#0284C7" /> 98 / 100
          </div>

          <div style={{ fontSize: '0.76rem', color: '#0369A1', marginTop: '2px', fontWeight: 600 }}>
            Lift AMC ✅ • CCTV Health ✅ • Tanks Cleaned ✅
          </div>
        </div>

      </div>

      {/* Row 2: Expense Allocation & Water Leak Detector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '22px' }}>
        
        {/* Expense Category Breakdown Chart */}
        <div className="app-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={18} color="#0096C7" /> Building Expense Allocation Breakdown
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(expensesByCategory).map(([cat, amount]) => {
              const pct = Math.round((amount / (monthRecord.totalCommonMaintenance || 1)) * 100);
              const color = categoryColors[cat] || categoryColors.Others;

              return (
                <div key={cat} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px 14px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: color.text }}>
                      {cat} Expenses
                    </span>
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A' }}>
                      ₹{amount.toLocaleString('en-IN')} ({pct}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '7px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color.text, borderRadius: '999px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Water Consumption Ranking & Leak Alert */}
        <div className="app-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Droplets size={18} color="#0096C7" /> Top Water Usage & Leak Alert Monitor
          </h3>

          {/* High Water Alert Box if any flat > 15 units */}
          {highWaterAlertFlats.length > 0 && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '10px 12px', borderRadius: '12px', marginBottom: '14px', fontSize: '0.78rem', color: '#991B1B' }}>
              <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.84rem', color: '#DC2626' }}>
                <AlertTriangle size={15} /> Leak Detection Alert:
              </strong>
              {highWaterAlertFlats.map((f) => `#${f.flatNo} (${f.residentName}: ${f.consumedUnits} units)`).join(', ')} consumed high water this month. Please inspect internal flush tanks and tap valves!
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topWaterFlats.map((flat, index) => {
              const isHigh = flat.consumedUnits >= 15;

              return (
                <div
                  key={flat.flatNo}
                  style={{
                    background: isHigh ? '#FEF2F2' : '#F8FAFC',
                    border: isHigh ? '1px solid #FCA5A5' : '1px solid #E2E8F0',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: index === 0 ? '#FFD166' : '#E2E8F0',
                      color: index === 0 ? '#92400E' : '#475569',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      #{index + 1}
                    </span>
                    <div>
                      <strong style={{ color: '#0F172A', fontSize: '0.86rem' }}>Flat #{flat.flatNo}</strong>
                      <span style={{ fontSize: '0.76rem', color: '#64748B', marginLeft: '6px' }}>({flat.residentName})</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: isHigh ? '#DC2626' : '#0077B6' }}>
                      {flat.consumedUnits} Units
                    </span>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                      ₹{flat.waterCost.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Row 3: Historical Month-over-Month Water Trend SVG Chart */}
      <div className="app-card">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} color="#0096C7" /> Month-over-Month Water Consumption Trend
        </h3>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', height: '180px', paddingTop: '28px', paddingBottom: '10px', borderBottom: '2px solid #CBD5E1', overflowX: 'auto' }}>
          {historicalTrend.map((item) => {
            const heightPct = Math.max(20, Math.round((item.totalUnits / maxUnits) * 95));

            return (
              <div key={item.monthId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '75px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0077B6', marginBottom: '6px' }}>
                  {item.totalUnits} U
                </span>

                <div
                  style={{
                    width: '42px',
                    height: `${heightPct}px`,
                    background: 'linear-gradient(180deg, #00B4D8 0%, #0077B6 100%)',
                    borderRadius: '8px 8px 0 0',
                    boxShadow: '0 4px 10px rgba(0, 150, 199, 0.3)',
                    transition: 'height 0.4s ease',
                  }}
                  title={`${item.monthTitle}: ${item.totalUnits} Units (Rate ₹${item.unitRate}/u)`}
                />

                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginTop: '8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {item.monthTitle}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

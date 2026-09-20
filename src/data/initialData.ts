import type { AppState, MonthMaintenanceRecord } from '../types';
import { recalculateMonthRecord } from '../utils/calculator';

export const INITIAL_AUG_2026_RECORD: MonthMaintenanceRecord = {
  monthId: 'AUG-2026',
  monthTitle: 'RS Towers AUG 2026 Maintenance',
  waterConfig: {
    panchayatWaterBill: 2124,
    municipalTankerCount: 13,
    municipalTankerRate: 1100,
    privateTankerCount: 0,
    privateTankerRate: 0,
    watchmanUnits: 8,
    manualUnitRate: 105,
  },
  commonExpenses: [
    { id: 'exp-1', name: 'Diesel', amount: 1000, category: 'Utilities' },
    { id: 'exp-2', name: 'Power Bill', amount: 3677, category: 'Utilities' },
    { id: 'exp-3', name: 'WatchMan Salary', amount: 6000, category: 'Staff' },
    { id: 'exp-4', name: 'Internet Expenses', amount: 470, category: 'Utilities' },
    { id: 'exp-5', name: '13th Corpus Fund', amount: 2800, category: 'Corpus' },
    { id: 'exp-6', name: 'Tanker cleaning', amount: 1900, category: 'Maintenance' },
    { id: 'exp-7', name: 'Garbage collection', amount: 1000, category: 'Maintenance' },
    { id: 'exp-8', name: 'Flex', amount: 500, category: 'Others' },
    { id: 'exp-9', name: 'Water balance (403)', amount: 650, category: 'Others' },
  ],
  flatReadings: [
    { flatNo: '101', residentName: 'Bobby', residentType: 'Owner', isOccupied: true, previousReading: 59, currentReading: 64, consumedUnits: 5, waterCost: 525, panchayatShare: 151.71, commonMaintenanceShare: 1285.5, totalValue: 1962.21, roundedValue: 1962, paidAmount: 1962, status: 'Received' },
    { flatNo: '102', residentName: 'Tenant', residentType: 'Tenant', isOccupied: true, previousReading: 65, currentReading: 72, consumedUnits: 7, waterCost: 735, panchayatShare: 151.71, commonMaintenanceShare: 1285.5, totalValue: 2172.21, roundedValue: 2172, paidAmount: 2172, status: 'Received' },
    { flatNo: '103', residentName: 'Balaji', residentType: 'Owner', isOccupied: true, previousReading: 26, currentReading: 36, consumedUnits: 10, waterCost: 1050, panchayatShare: 151.71, commonMaintenanceShare: 1285.5, totalValue: 2487.21, roundedValue: 2487, paidAmount: 2487, status: 'Received', notes: '2000 corpus fund pending' },
    { flatNo: '201', residentName: 'Naveen Varma', residentType: 'Owner', isOccupied: true, previousReading: 109, currentReading: 116, consumedUnits: 7, waterCost: 735, panchayatShare: 151.71, commonMaintenanceShare: 1285.5, totalValue: 2172.21, roundedValue: 2172, paidAmount: 2172, status: 'Received' },
    { flatNo: '202', residentName: 'Satya Nimmakayala', residentType: 'Tenant', isOccupied: true, previousReading: 179, currentReading: 194, consumedUnits: 15, waterCost: 1575, panchayatShare: 151.71, commonMaintenanceShare: 1285.5, totalValue: 3012.21, roundedValue: 3012, paidAmount: 3012, status: 'Received' },
    { flatNo: '203', residentName: 'Harshavardhan', residentType: 'Owner', isOccupied: true, previousReading: 119, currentReading: 136, consumedUnits: 17, waterCost: 1785, panchayatShare: 151.71, commonMaintenanceShare: 1285.5, totalValue: 3222.21, roundedValue: 3222, paidAmount: 3222, status: 'Received' },
    { flatNo: '301', residentName: 'Yugandhar', residentType: 'Owner', isOccupied: true, previousReading: 146, currentReading: 155, consumedUnits: 9, waterCost: 945, panchayatShare: 151.71, commonMaintenanceShare: 1285.5, totalValue: 2382.21, roundedValue: 2382, paidAmount: 2382, status: 'Received' },
    { flatNo: '302', residentName: 'Kamesh', residentType: 'Owner', isOccupied: true, previousReading: 147, currentReading: 156, consumedUnits: 9, waterCost: 945, panchayatShare: 151.71, commonMaintenanceShare: 1285.5, totalValue: 2382.21, roundedValue: 2382, paidAmount: 2382, status: 'Received' },
    { flatNo: '303', residentName: 'Sharath Babu', residentType: 'Owner', isOccupied: true, previousReading: 30, currentReading: 30, consumedUnits: 0, waterCost: 0, panchayatShare: 151.71, commonMaintenanceShare: 1285.5, totalValue: 1437.21, roundedValue: 1437, paidAmount: 1437, status: 'Received' },
    { flatNo: '401', residentName: 'Arun', residentType: 'Owner', isOccupied: true, previousReading: 108, currentReading: 116, consumedUnits: 8, waterCost: 840, panchayatShare: 151.71, commonMaintenanceShare: 1285.5, totalValue: 2277.21, roundedValue: 2277, paidAmount: 2277, status: 'Received' },
    { flatNo: '402', residentName: 'Ujwala', residentType: 'Tenant', isOccupied: true, previousReading: 106, currentReading: 124, consumedUnits: 18, waterCost: 1890, panchayatShare: 151.71, commonMaintenanceShare: 1285.5, totalValue: 3327.21, roundedValue: 3327, paidAmount: 3327, status: 'Received' },
    { flatNo: '403', residentName: 'Ravi Shankar', residentType: 'Owner', isOccupied: true, previousReading: 29, currentReading: 38, consumedUnits: 9, waterCost: 945, panchayatShare: 151.71, commonMaintenanceShare: 1285.5, totalValue: 2382.21, roundedValue: 2382, paidAmount: 2382, status: 'Received' },
    { flatNo: '501', residentName: 'Srikanth', residentType: 'Owner', isOccupied: true, previousReading: 113, currentReading: 127, consumedUnits: 14, waterCost: 1470, panchayatShare: 151.71, commonMaintenanceShare: 1285.5, totalValue: 2907.21, roundedValue: 2907, paidAmount: 2907, status: 'Received' },
    { flatNo: '502', residentName: 'Prasanna', residentType: 'Owner', isOccupied: true, previousReading: 78, currentReading: 87, consumedUnits: 9, waterCost: 945, panchayatShare: 151.71, commonMaintenanceShare: 1285.5, totalValue: 2382.21, roundedValue: 2382, paidAmount: 2382, status: 'Received' },
    { flatNo: '503', residentName: 'Owner', residentType: 'Owner', isOccupied: false, previousReading: 15, currentReading: 15, consumedUnits: 0, waterCost: 0, panchayatShare: 0, commonMaintenanceShare: 0, totalValue: 0, roundedValue: 0, paidAmount: 0, status: 'Received' },
    { flatNo: 'WM', residentName: 'Watchman Meter', residentType: 'Owner', isOccupied: false, previousReading: 104, currentReading: 112, consumedUnits: 8, waterCost: 0, panchayatShare: 0, commonMaintenanceShare: 0, totalValue: 0, roundedValue: 0, paidAmount: 0, status: 'Received' },
  ],
  totalUnitsConsumed: 145,
  netBillableWaterUnits: 137,
  calculatedUnitRate: 105,
  totalWaterCost: 16424,
  totalCommonMaintenance: 17997,
  totalGrandCollectionTarget: 34503,
  lastUpdated: 1789469180100,
};

// Calculate exact initial baseline
const BASELINE_RECALCULATED = recalculateMonthRecord(INITIAL_AUG_2026_RECORD);

export const INITIAL_APP_STATE: AppState = {
  activeMonthId: 'AUG-2026',
  months: {
    'AUG-2026': BASELINE_RECALCULATED,
  },
  adminFlats: ['302'],
  rootFlat: '302',
  lastUpdated: Date.now(),
  cloudSyncKey: 'rs-towers-maintenance-2026-key',
};

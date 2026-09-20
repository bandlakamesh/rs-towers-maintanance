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
  dueDateDay: 10,
  periodicTasks: [
    {
      id: 'task-lift-1',
      title: 'Lift AMC & Service Check',
      category: 'Lift AMC',
      intervalMonths: 6,
      lastServicedDate: '2026-04-15',
      nextDueDate: '2026-10-15',
      estimatedCost: 4500,
      vendorName: 'KONE / Schindler Elevator Service (Raju)',
      vendorPhone: '9849012345',
      serviceLogs: [
        { id: 'log-1', date: '2026-04-15', amount: 4500, technician: 'Raju Mechanic', notes: '6-Month AMC Service, oil topped up, safety brakes inspected.' },
        { id: 'log-0', date: '2025-10-10', amount: 4200, technician: 'Raju Mechanic', notes: 'Regular 6-Month checkup and door sensor replacement.' }
      ],
      notes: 'Full safety audit, door sensors check, lubricate wire ropes every 6 months.'
    },
    {
      id: 'task-cctv-1',
      title: 'CCTV & NVR Hard Drive Audit',
      category: 'CCTV Audit',
      intervalMonths: 6,
      lastServicedDate: '2026-05-01',
      nextDueDate: '2026-11-01',
      estimatedCost: 1500,
      vendorName: 'Sri Sai Security Solutions (Srinivas)',
      vendorPhone: '9989054321',
      serviceLogs: [
        { id: 'cctv-log-1', date: '2026-05-01', amount: 1500, technician: 'Srinivas Tech', notes: '8 Cameras cleaned, 2TB Seagate Hard Disk recording health OK.' }
      ],
      notes: 'Check camera lens clarity, 30-day recording playback check, power adapter health.'
    },
    {
      id: 'task-tank-1',
      title: 'Overhead & Sump Tank Sanitization',
      category: 'Water Tank Sump',
      intervalMonths: 3,
      lastServicedDate: '2026-06-10',
      nextDueDate: '2026-09-10',
      estimatedCost: 1900,
      vendorName: 'Water Sump Cleaners (Venkatesh)',
      vendorPhone: '9440187654',
      serviceLogs: [
        { id: 'tank-log-1', date: '2026-06-10', amount: 1900, technician: 'Venkatesh & Team', notes: 'Underground sump + 2 Overhead tanks deep cleaned with UV/bleach.' }
      ],
      notes: 'High-pressure jet wash, sludge removal, bleaching powder treatment every 3 months.'
    },
    {
      id: 'task-pump-1',
      title: 'Borewell & Motor Pump Inspection',
      category: 'Generator & Pump',
      intervalMonths: 6,
      lastServicedDate: '2026-03-20',
      nextDueDate: '2026-09-20',
      estimatedCost: 2000,
      vendorName: 'Lakshmi Electrical Motors (Mallesh)',
      vendorPhone: '9866032145',
      serviceLogs: [
        { id: 'pump-log-1', date: '2026-03-20', amount: 2000, technician: 'Mallesh Electrician', notes: 'Starter panel relay checked, capacitor tested, grease added.' }
      ],
      notes: 'Check starter box switchgear, pump amperage, oil level, bearing sound.'
    },
    {
      id: 'task-fire-1',
      title: 'Fire Extinguishers Refill & Safety Audit',
      category: 'Fire Safety',
      intervalMonths: 12,
      lastServicedDate: '2026-01-10',
      nextDueDate: '2027-01-10',
      estimatedCost: 3200,
      vendorName: 'SafeFire India (Prasad)',
      vendorPhone: '9700011223',
      serviceLogs: [
        { id: 'fire-log-1', date: '2026-01-10', amount: 3200, technician: 'Prasad Safety Officer', notes: 'Refilled 4 ABC Powder cylinders on all floors.' }
      ],
      notes: 'Annual gas refilling, pressure gauge seal verification.'
    }
  ],
  vendors: [
    { id: 'v-1', name: 'Raju (Lift Technician)', role: 'Lift Mechanic', phone: '9849012345', notes: 'Available 24x7 for emergency lift breakdown.' },
    { id: 'v-2', name: 'Srinivas (CCTV Expert)', role: 'CCTV & IT', phone: '9989054321', notes: 'Hikvision / CP Plus cameras installer.' },
    { id: 'v-3', name: 'Venkatesh (Sump Cleaning)', role: 'Water Tank Cleaner', phone: '9440187654', notes: 'High pressure tank jet washing.' },
    { id: 'v-4', name: 'Mallesh (Electrician & Motor)', role: 'Electrician & Motor Repair', phone: '9866032145', notes: 'Borewell pump and main DB panel specialist.' },
    { id: 'v-5', name: 'Rambabu (Water Tanker Driver)', role: 'Municipal / Private Tanker', phone: '9391098765', upiId: 'rambabu@upi', notes: 'Delivers 5000L water tankers for RS Towers.' },
    { id: 'v-6', name: 'Narsing (Watchman & Security)', role: 'Building Guard', phone: '9123456789', notes: 'Lives in Ground Floor Watchman Room.' }
  ],
  notices: [
    {
      id: 'n-1',
      title: '🚨 Monthly Maintenance Payment Due by 10th',
      content: 'Respected RS Towers Flat Owners, please transfer your monthly maintenance dues by the 10th of every month via UPI (9963275455@upi - Bobby Flat 101). Thank you for your cooperation!',
      date: '2026-09-01',
      postedBy: 'Bobby (Flat 101 - Maintenance Lead)',
      priority: 'Urgent'
    },
    {
      id: 'n-2',
      title: '🛗 Upcoming Lift 6-Month Servicing',
      content: 'Lift routine 6-month servicing is scheduled for next week. Elevator might be temporarily paused for 2 hours during inspection.',
      date: '2026-09-15',
      postedBy: 'Association Management',
      priority: 'Normal'
    }
  ],
  corpusConfig: {
    monthlyRatePerFlat: 200,
    pastMonthsCollected: 12,
    baselineTotalCollected: 33600, // 14 flats * 200 * 12 months
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
  }
};



export type PaymentMode = 'UPI' | 'Cash' | 'NetBanking' | 'Cheque';
export type PaymentStatus = 'Received' | 'Pending' | 'Partial';

export interface FlatReading {
  flatNo: string;
  residentName: string;
  residentType: 'Owner' | 'Tenant';
  isOccupied: boolean;
  previousReading: number;
  currentReading: number;
  consumedUnits: number;
  waterCost: number;
  panchayatShare: number;
  commonMaintenanceShare: number;
  totalValue: number;
  roundedValue: number;
  paidAmount: number;
  status: PaymentStatus;
  notes?: string;
  paymentDate?: string;
  paymentMode?: PaymentMode;
  receiptNo?: string;
}

export interface CommonExpenseItem {
  id: string;
  name: string;
  amount: number;
  category: 'Utilities' | 'Staff' | 'Corpus' | 'Maintenance' | 'Others';
}

export interface WaterCalculationConfig {
  panchayatWaterBill: number;
  municipalTankerCount: number;
  municipalTankerRate: number;
  privateTankerCount: number;
  privateTankerRate: number;
  watchmanUnits: number;
  manualUnitRate?: number;
}

export interface MonthMaintenanceRecord {
  monthId: string; // e.g. "AUG-2026"
  monthTitle: string; // e.g. "RS Towers AUG 2026 Maintenance"
  waterConfig: WaterCalculationConfig;
  commonExpenses: CommonExpenseItem[];
  flatReadings: FlatReading[];
  totalUnitsConsumed: number;
  netBillableWaterUnits: number;
  calculatedUnitRate: number;
  totalWaterCost: number;
  totalCommonMaintenance: number;
  totalGrandCollectionTarget: number;
  lastUpdated: number;
}

export interface AppState {
  activeMonthId: string;
  months: Record<string, MonthMaintenanceRecord>;
  adminFlats: string[];
  rootFlat: string;
  lastUpdated: number;
  cloudSyncKey: string;
}

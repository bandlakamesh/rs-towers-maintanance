export type PaymentMode = 'UPI' | 'Cash' | 'NetBanking' | 'Cheque';
export type PaymentStatus = 'Received' | 'Pending' | 'Partial';

export interface FlatReading {
  flatNo: string;
  residentName: string;
  residentType: 'Owner' | 'Tenant';
  isOccupied: boolean;
  ownerName?: string;
  ownerPhone?: string;
  tenantPhone?: string;
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

export interface ServiceLogEntry {
  id: string;
  date: string;
  amount: number;
  technician: string;
  notes: string;
}

export interface PeriodicTask {
  id: string;
  title: string;
  category: 'Lift AMC' | 'CCTV Audit' | 'Water Tank Sump' | 'Generator & Pump' | 'Fire Safety' | 'Pest Control';
  intervalMonths: number;
  lastServicedDate: string;
  nextDueDate: string;
  estimatedCost: number;
  vendorName: string;
  vendorPhone: string;
  serviceLogs: ServiceLogEntry[];
  notes?: string;
}

export interface ApartmentVendor {
  id: string;
  name: string;
  role: string;
  phone: string;
  upiId?: string;
  notes?: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  date: string;
  postedBy: string;
  priority: 'Normal' | 'Urgent';
}

export interface CorpusExpenseLog {
  id: string;
  date: string;
  title: string;
  amount: number;
  category: 'Lift Overhaul' | 'Building Painting' | 'Waterproof/Sump' | 'Motor/Electrical' | 'Festival/Event' | 'Others';
  approvedBy: string;
  notes: string;
}

export interface CorpusFundConfig {
  monthlyRatePerFlat: number; // default 200
  pastMonthsCollected: number; // default 12
  baselineTotalCollected: number; // default 33600 (14 flats * 200 * 12)
  corpusExpenses: CorpusExpenseLog[];
}

export interface CommitteeMember {
  id: string;
  name: string;
  designation: 'President & Super Admin' | 'Maintenance Lead & Treasurer' | 'Vice President' | 'General Secretary' | 'Joint Secretary' | 'Security & Facility Lead' | 'Executive Member';
  flatNo: string;
  phone: string;
  email?: string;
  termPeriod: string;
  photoUrl?: string;
  responsibilities: string[];
}

export interface FlatDirectoryEntry {
  flatNo: string;
  ownerName: string;
  ownerPhone: string;
  residentName: string;
  tenantPhone: string;
  residentType: 'Owner' | 'Tenant';
  isOccupied: boolean;
}

export type UserRole = 'RootAdmin' | 'MaintenanceLead' | 'CoAdmin' | 'VerifiedResident' | 'PublicResident';

export interface AppState {
  activeMonthId: string;
  months: Record<string, MonthMaintenanceRecord>;
  adminFlats: string[];
  maintenanceLeadFlats?: string[]; // default ['101'] (Bobby)
  rootFlat: string;
  lastUpdated: number;
  cloudSyncKey: string;
  periodicTasks: PeriodicTask[];
  vendors: ApartmentVendor[];
  notices: NoticeItem[];
  dueDateDay: number; // default 10
  corpusConfig?: CorpusFundConfig;
  privacyMode?: boolean;
  committeeMembers?: CommitteeMember[];
  flatDirectory?: Record<string, FlatDirectoryEntry>;
}




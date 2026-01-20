export interface Site {
  id: number;
  name: string;
  location?: string | null;
}

export interface Person {
  id: number;
  name: string;
  title?: string | null;
  phone?: string | null;
}

export interface SubcontractorPayment {
  id: number;
  date: string;
  person_id: number;
  site_id?: number | null;
  amount: number;
  note?: string | null;
}

export interface SubcontractorEntitlement {
  id: number;
  date: string;
  person_id: number;
  site_id?: number | null;
  work: string;
  unit?: string | null;
  quantity?: number | null;
  unit_price?: number | null;
  total: number;
  note?: string | null;
}

export type EmployeePayrollType = 'salary' | 'advance' | 'deduction' | 'other';

export interface EmployeePayrollRecord {
  id: number;
  date: string;
  person_id: number;
  site_id?: number | null;
  type: EmployeePayrollType;
  amount: number;
  note?: string | null;
}

export type CheckNoteKind = 'check' | 'note';
export type CheckNoteDirection = 'given' | 'received';
export type CheckNoteStatus = 'pending' | 'cleared' | 'bounced' | 'cancelled';

export interface CheckNoteRecord {
  id: number;
  kind: CheckNoteKind;
  direction: CheckNoteDirection;
  issue_date: string;
  due_date: string;
  person_id?: number | null;
  site_id?: number | null;
  amount: number;
  bank?: string | null;
  serial_no?: string | null;
  status: CheckNoteStatus;
  note?: string | null;
}

export interface GeneralSearchTotals {
  subcontractorPaymentsTotal: number;
  subcontractorEntitlementsTotal: number;
  subcontractorNet: number;
  employeePayroll: {
    salary: number;
    advance: number;
    deduction: number;
    other: number;
    net: number;
  };
  checksNotes: {
    pendingTotal: number;
    clearedTotal: number;
    bouncedTotal: number;
    cancelledTotal: number;
    dueSoonCount: number;
    overdueCount: number;
  };
}

export interface GeneralSearchResult {
  subcontractorPayments: SubcontractorPayment[];
  subcontractorEntitlements: SubcontractorEntitlement[];
  employeePayroll: EmployeePayrollRecord[];
  checksNotes: CheckNoteRecord[];
  totals: GeneralSearchTotals;
}

export interface MonthlyTotals {
  month: string;
  subcontractorEntitlementsTotal: number;
  subcontractorPaymentsTotal: number;
  employeePayrollTotal: number;
  checksNotesTotal: number;
  dueSoonCount: number;
  overdueCount: number;
}

export interface PingResponse {
  ok: true;
  version: string;
  platform: string;
}

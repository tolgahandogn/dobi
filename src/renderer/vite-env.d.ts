/// <reference types="vite/client" />
import type {
  CheckNoteRecord,
  EmployeePayrollRecord,
  GeneralSearchResult,
  MonthlyTotals,
  Person,
  PingResponse,
  Site,
  SubcontractorEntitlement,
  SubcontractorPayment
} from '@shared/types';

export interface DobisApi {
  ping: () => Promise<PingResponse>;
  listSites: () => Promise<Site[]>;
  listPeople: () => Promise<Person[]>;
  createSite: (payload: Omit<Site, 'id'>) => Promise<Site>;
  createPerson: (payload: Omit<Person, 'id'>) => Promise<Person>;
  listSubcontractorPayments: () => Promise<SubcontractorPayment[]>;
  createSubcontractorPayment: (payload: Omit<SubcontractorPayment, 'id'>) => Promise<SubcontractorPayment>;
  deleteSubcontractorPayment: (id: number) => Promise<void>;
  listSubcontractorEntitlements: () => Promise<SubcontractorEntitlement[]>;
  createSubcontractorEntitlement: (payload: Omit<SubcontractorEntitlement, 'id'>) => Promise<SubcontractorEntitlement>;
  updateSubcontractorEntitlement: (payload: SubcontractorEntitlement) => Promise<SubcontractorEntitlement>;
  deleteSubcontractorEntitlement: (id: number) => Promise<void>;
  listEmployeePayroll: () => Promise<EmployeePayrollRecord[]>;
  createEmployeePayroll: (payload: Omit<EmployeePayrollRecord, 'id'>) => Promise<EmployeePayrollRecord>;
  updateEmployeePayroll: (payload: EmployeePayrollRecord) => Promise<EmployeePayrollRecord>;
  deleteEmployeePayroll: (id: number) => Promise<void>;
  listChecksNotes: () => Promise<CheckNoteRecord[]>;
  createCheckNote: (payload: Omit<CheckNoteRecord, 'id'>) => Promise<CheckNoteRecord>;
  updateCheckNote: (payload: CheckNoteRecord) => Promise<CheckNoteRecord>;
  deleteCheckNote: (id: number) => Promise<void>;
  monthlyTotals: (month: string) => Promise<MonthlyTotals>;
  generalSearchByPerson: (personId: number) => Promise<GeneralSearchResult>;
  generalSearchBySite: (siteId: number) => Promise<GeneralSearchResult>;
}

declare global {
  interface Window {
    api: DobisApi;
  }
}

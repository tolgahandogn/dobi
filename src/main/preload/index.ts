import { contextBridge, ipcRenderer } from 'electron';
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
} from '../../shared/types';

const api = {
  ping: (): Promise<PingResponse> => ipcRenderer.invoke('ping'),
  listSites: (): Promise<Site[]> => ipcRenderer.invoke('listSites'),
  listPeople: (): Promise<Person[]> => ipcRenderer.invoke('listPeople'),
  createSite: (payload: Omit<Site, 'id'>): Promise<Site> => ipcRenderer.invoke('createSite', payload),
  createPerson: (payload: Omit<Person, 'id'>): Promise<Person> => ipcRenderer.invoke('createPerson', payload),
  listSubcontractorPayments: (): Promise<SubcontractorPayment[]> =>
    ipcRenderer.invoke('listSubcontractorPayments'),
  createSubcontractorPayment: (payload: Omit<SubcontractorPayment, 'id'>): Promise<SubcontractorPayment> =>
    ipcRenderer.invoke('createSubcontractorPayment', payload),
  deleteSubcontractorPayment: (id: number): Promise<void> => ipcRenderer.invoke('deleteSubcontractorPayment', id),
  listSubcontractorEntitlements: (): Promise<SubcontractorEntitlement[]> =>
    ipcRenderer.invoke('listSubcontractorEntitlements'),
  createSubcontractorEntitlement: (
    payload: Omit<SubcontractorEntitlement, 'id'>
  ): Promise<SubcontractorEntitlement> => ipcRenderer.invoke('createSubcontractorEntitlement', payload),
  updateSubcontractorEntitlement: (payload: SubcontractorEntitlement): Promise<SubcontractorEntitlement> =>
    ipcRenderer.invoke('updateSubcontractorEntitlement', payload),
  deleteSubcontractorEntitlement: (id: number): Promise<void> =>
    ipcRenderer.invoke('deleteSubcontractorEntitlement', id),
  listEmployeePayroll: (): Promise<EmployeePayrollRecord[]> => ipcRenderer.invoke('listEmployeePayroll'),
  createEmployeePayroll: (payload: Omit<EmployeePayrollRecord, 'id'>): Promise<EmployeePayrollRecord> =>
    ipcRenderer.invoke('createEmployeePayroll', payload),
  updateEmployeePayroll: (payload: EmployeePayrollRecord): Promise<EmployeePayrollRecord> =>
    ipcRenderer.invoke('updateEmployeePayroll', payload),
  deleteEmployeePayroll: (id: number): Promise<void> => ipcRenderer.invoke('deleteEmployeePayroll', id),
  listChecksNotes: (): Promise<CheckNoteRecord[]> => ipcRenderer.invoke('listChecksNotes'),
  createCheckNote: (payload: Omit<CheckNoteRecord, 'id'>): Promise<CheckNoteRecord> =>
    ipcRenderer.invoke('createCheckNote', payload),
  updateCheckNote: (payload: CheckNoteRecord): Promise<CheckNoteRecord> =>
    ipcRenderer.invoke('updateCheckNote', payload),
  deleteCheckNote: (id: number): Promise<void> => ipcRenderer.invoke('deleteCheckNote', id),
  monthlyTotals: (month: string): Promise<MonthlyTotals> => ipcRenderer.invoke('monthlyTotals', month),
  generalSearchByPerson: (personId: number): Promise<GeneralSearchResult> =>
    ipcRenderer.invoke('generalSearchByPerson', personId),
  generalSearchBySite: (siteId: number): Promise<GeneralSearchResult> =>
    ipcRenderer.invoke('generalSearchBySite', siteId)
};

contextBridge.exposeInMainWorld('api', api);

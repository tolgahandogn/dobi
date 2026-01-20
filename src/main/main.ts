import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { dbApi } from './db';
import type { CheckNoteRecord, EmployeePayrollRecord, Person, Site, SubcontractorEntitlement, SubcontractorPayment } from '../shared/types';

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
let mainWindow: BrowserWindow | null = null;
let ipcRegistered = false;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'DOBİ',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL).catch((error) => {
      console.error('Failed to load dev server', error);
    });
  } else {
    const indexPath = path.join(__dirname, '../renderer/index.html');
    mainWindow.loadFile(indexPath).catch((error) => {
      console.error('Failed to load renderer', error, indexPath);
    });
  }
};

const registerIpcHandlers = () => {
  if (ipcRegistered) {
    return;
  }
  ipcRegistered = true;

  ipcMain.handle('ping', () => ({ ok: true, version: app.getVersion(), platform: process.platform }));

  ipcMain.handle('listSites', () => dbApi.listSites());
  ipcMain.handle('listPeople', () => dbApi.listPeople());
  ipcMain.handle('createSite', (_event, payload: Omit<Site, 'id'>) => dbApi.createSite(payload));
  ipcMain.handle('createPerson', (_event, payload: Omit<Person, 'id'>) => dbApi.createPerson(payload));

  ipcMain.handle('listSubcontractorPayments', () => dbApi.listSubcontractorPayments());
  ipcMain.handle('createSubcontractorPayment', (_event, payload: Omit<SubcontractorPayment, 'id'>) =>
    dbApi.createSubcontractorPayment(payload)
  );
  ipcMain.handle('deleteSubcontractorPayment', (_event, id: number) => dbApi.deleteSubcontractorPayment(id));

  ipcMain.handle('listSubcontractorEntitlements', () => dbApi.listSubcontractorEntitlements());
  ipcMain.handle(
    'createSubcontractorEntitlement',
    (_event, payload: Omit<SubcontractorEntitlement, 'id'>) => dbApi.createSubcontractorEntitlement(payload)
  );
  ipcMain.handle('updateSubcontractorEntitlement', (_event, payload: SubcontractorEntitlement) =>
    dbApi.updateSubcontractorEntitlement(payload)
  );
  ipcMain.handle('deleteSubcontractorEntitlement', (_event, id: number) => dbApi.deleteSubcontractorEntitlement(id));

  ipcMain.handle('listEmployeePayroll', () => dbApi.listEmployeePayroll());
  ipcMain.handle('createEmployeePayroll', (_event, payload: Omit<EmployeePayrollRecord, 'id'>) =>
    dbApi.createEmployeePayroll(payload)
  );
  ipcMain.handle('updateEmployeePayroll', (_event, payload: EmployeePayrollRecord) =>
    dbApi.updateEmployeePayroll(payload)
  );
  ipcMain.handle('deleteEmployeePayroll', (_event, id: number) => dbApi.deleteEmployeePayroll(id));

  ipcMain.handle('listChecksNotes', () => dbApi.listChecksNotes());
  ipcMain.handle('createCheckNote', (_event, payload: Omit<CheckNoteRecord, 'id'>) => dbApi.createCheckNote(payload));
  ipcMain.handle('updateCheckNote', (_event, payload: CheckNoteRecord) => dbApi.updateCheckNote(payload));
  ipcMain.handle('deleteCheckNote', (_event, id: number) => dbApi.deleteCheckNote(id));

  ipcMain.handle('monthlyTotals', (_event, month: string) => dbApi.monthlyTotals(month));
  ipcMain.handle('generalSearchByPerson', (_event, personId: number) => dbApi.generalSearchByPerson(personId));
  ipcMain.handle('generalSearchBySite', (_event, siteId: number) => dbApi.generalSearchBySite(siteId));
};

app.setName('DOBİ');

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

import { app } from 'electron';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import type {
  CheckNoteRecord,
  EmployeePayrollRecord,
  GeneralSearchResult,
  MonthlyTotals,
  Person,
  Site,
  SubcontractorEntitlement,
  SubcontractorPayment
} from '../../shared/types';

let db: Database.Database | null = null;

type MigrationRow = { name: string };

const siteSchema = z.object({
  name: z.string().min(1),
  location: z.string().nullable().optional()
});

const personSchema = z.object({
  name: z.string().min(1),
  title: z.string().nullable().optional(),
  phone: z.string().nullable().optional()
});

const subcontractorPaymentSchema = z.object({
  date: z.string().min(1),
  person_id: z.number().int(),
  site_id: z.number().int().nullable().optional(),
  amount: z.number(),
  note: z.string().nullable().optional()
});

const subcontractorEntitlementSchema = z.object({
  date: z.string().min(1),
  person_id: z.number().int(),
  site_id: z.number().int().nullable().optional(),
  work: z.string().min(1),
  unit: z.string().nullable().optional(),
  quantity: z.number().nullable().optional(),
  unit_price: z.number().nullable().optional(),
  total: z.number(),
  note: z.string().nullable().optional()
});

const employeePayrollSchema = z.object({
  date: z.string().min(1),
  person_id: z.number().int(),
  site_id: z.number().int().nullable().optional(),
  type: z.enum(['salary', 'advance', 'deduction', 'other']),
  amount: z.number(),
  note: z.string().nullable().optional()
});

const checkNoteSchema = z.object({
  kind: z.enum(['check', 'note']),
  direction: z.enum(['given', 'received']),
  issue_date: z.string().min(1),
  due_date: z.string().min(1),
  person_id: z.number().int().nullable().optional(),
  site_id: z.number().int().nullable().optional(),
  amount: z.number(),
  bank: z.string().nullable().optional(),
  serial_no: z.string().nullable().optional(),
  status: z.enum(['pending', 'cleared', 'bounced', 'cancelled']).optional(),
  note: z.string().nullable().optional()
});

const toSql = (value: number | null | undefined) => value ?? null;

const getMigrationsDir = () => {
  const candidateDirs = [
    path.join(__dirname, 'db', 'migrations'),
    path.join(process.cwd(), 'src', 'main', 'db', 'migrations')
  ];

  if (app.isPackaged) {
    candidateDirs.unshift(path.join(process.resourcesPath, 'migrations'));
  }

  const found = candidateDirs.find((dir) => fs.existsSync(dir));
  if (!found) {
    throw new Error(`Migrations directory not found. Tried: ${candidateDirs.join(', ')}`);
  }

  return found;
};

const runMigrations = (database: Database.Database) => {
  database.exec(
    'CREATE TABLE IF NOT EXISTS migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, applied_at TEXT DEFAULT CURRENT_TIMESTAMP)'
  );

  const applied = new Set(
    database.prepare('SELECT name FROM migrations').all().map((row: MigrationRow) => row.name)
  );

  const migrationsDir = getMigrationsDir();
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const insertMigration = database.prepare('INSERT INTO migrations (name) VALUES (?)');

  const run = database.transaction((name: string, sql: string) => {
    database.exec(sql);
    insertMigration.run(name);
  });

  for (const file of files) {
    if (applied.has(file)) {
      continue;
    }
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    run(file, sql);
  }
};

const getDb = () => {
  if (db) {
    return db;
  }
  const dbPath = path.join(app.getPath('userData'), 'dobi.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  runMigrations(db);
  return db;
};

const listSites = (): Site[] => getDb().prepare('SELECT * FROM sites ORDER BY name').all() as Site[];
const listPeople = (): Person[] => getDb().prepare('SELECT * FROM people ORDER BY name').all() as Person[];

const createSite = (payload: Omit<Site, 'id'>): Site => {
  const data = siteSchema.parse(payload);
  const result = getDb()
    .prepare('INSERT INTO sites (name, location) VALUES (?, ?)')
    .run(data.name, data.location ?? null);
  return { id: Number(result.lastInsertRowid), ...data };
};

const createPerson = (payload: Omit<Person, 'id'>): Person => {
  const data = personSchema.parse(payload);
  const result = getDb()
    .prepare('INSERT INTO people (name, title, phone) VALUES (?, ?, ?)')
    .run(data.name, data.title ?? null, data.phone ?? null);
  return { id: Number(result.lastInsertRowid), ...data };
};

const listSubcontractorPayments = (): SubcontractorPayment[] =>
  getDb().prepare('SELECT * FROM subcontractor_payments ORDER BY date DESC, id DESC').all() as SubcontractorPayment[];

const createSubcontractorPayment = (
  payload: Omit<SubcontractorPayment, 'id'>
): SubcontractorPayment => {
  const data = subcontractorPaymentSchema.parse(payload);
  const result = getDb()
    .prepare(
      'INSERT INTO subcontractor_payments (date, person_id, site_id, amount, note) VALUES (?, ?, ?, ?, ?)'
    )
    .run(data.date, data.person_id, toSql(data.site_id), data.amount, data.note ?? null);
  return { id: Number(result.lastInsertRowid), ...data };
};

const deleteSubcontractorPayment = (id: number) => {
  getDb().prepare('DELETE FROM subcontractor_payments WHERE id = ?').run(id);
};

const listSubcontractorEntitlements = (): SubcontractorEntitlement[] =>
  getDb()
    .prepare('SELECT * FROM subcontractor_entitlements ORDER BY date DESC, id DESC')
    .all() as SubcontractorEntitlement[];

const createSubcontractorEntitlement = (
  payload: Omit<SubcontractorEntitlement, 'id'>
): SubcontractorEntitlement => {
  const data = subcontractorEntitlementSchema.parse(payload);
  const result = getDb()
    .prepare(
      'INSERT INTO subcontractor_entitlements (date, person_id, site_id, work, unit, quantity, unit_price, total, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .run(
      data.date,
      data.person_id,
      toSql(data.site_id),
      data.work,
      data.unit ?? null,
      toSql(data.quantity),
      toSql(data.unit_price),
      data.total,
      data.note ?? null
    );
  return { id: Number(result.lastInsertRowid), ...data };
};

const updateSubcontractorEntitlement = (payload: SubcontractorEntitlement): SubcontractorEntitlement => {
  const data = subcontractorEntitlementSchema.parse(payload);
  getDb()
    .prepare(
      'UPDATE subcontractor_entitlements SET date = ?, person_id = ?, site_id = ?, work = ?, unit = ?, quantity = ?, unit_price = ?, total = ?, note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    )
    .run(
      data.date,
      data.person_id,
      toSql(data.site_id),
      data.work,
      data.unit ?? null,
      toSql(data.quantity),
      toSql(data.unit_price),
      data.total,
      data.note ?? null,
      payload.id
    );
  return { ...payload, ...data };
};

const deleteSubcontractorEntitlement = (id: number) => {
  getDb().prepare('DELETE FROM subcontractor_entitlements WHERE id = ?').run(id);
};

const listEmployeePayroll = (): EmployeePayrollRecord[] =>
  getDb().prepare('SELECT * FROM employee_payroll ORDER BY date DESC, id DESC').all() as EmployeePayrollRecord[];

const createEmployeePayroll = (
  payload: Omit<EmployeePayrollRecord, 'id'>
): EmployeePayrollRecord => {
  const data = employeePayrollSchema.parse(payload);
  const result = getDb()
    .prepare(
      'INSERT INTO employee_payroll (date, person_id, site_id, type, amount, note) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(data.date, data.person_id, toSql(data.site_id), data.type, data.amount, data.note ?? null);
  return { id: Number(result.lastInsertRowid), ...data };
};

const updateEmployeePayroll = (payload: EmployeePayrollRecord): EmployeePayrollRecord => {
  const data = employeePayrollSchema.parse(payload);
  getDb()
    .prepare(
      'UPDATE employee_payroll SET date = ?, person_id = ?, site_id = ?, type = ?, amount = ?, note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    )
    .run(
      data.date,
      data.person_id,
      toSql(data.site_id),
      data.type,
      data.amount,
      data.note ?? null,
      payload.id
    );
  return { ...payload, ...data };
};

const deleteEmployeePayroll = (id: number) => {
  getDb().prepare('DELETE FROM employee_payroll WHERE id = ?').run(id);
};

const listChecksNotes = (): CheckNoteRecord[] =>
  getDb().prepare('SELECT * FROM checks_notes ORDER BY due_date ASC, id DESC').all() as CheckNoteRecord[];

const createCheckNote = (payload: Omit<CheckNoteRecord, 'id'>): CheckNoteRecord => {
  const data = checkNoteSchema.parse(payload);
  const result = getDb()
    .prepare(
      'INSERT INTO checks_notes (kind, direction, issue_date, due_date, person_id, site_id, amount, bank, serial_no, status, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .run(
      data.kind,
      data.direction,
      data.issue_date,
      data.due_date,
      toSql(data.person_id),
      toSql(data.site_id),
      data.amount,
      data.bank ?? null,
      data.serial_no ?? null,
      data.status ?? 'pending',
      data.note ?? null
    );
  return { id: Number(result.lastInsertRowid), status: data.status ?? 'pending', ...data };
};

const updateCheckNote = (payload: CheckNoteRecord): CheckNoteRecord => {
  const data = checkNoteSchema.parse(payload);
  const status = data.status ?? payload.status;
  getDb()
    .prepare(
      'UPDATE checks_notes SET kind = ?, direction = ?, issue_date = ?, due_date = ?, person_id = ?, site_id = ?, amount = ?, bank = ?, serial_no = ?, status = ?, note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    )
    .run(
      data.kind,
      data.direction,
      data.issue_date,
      data.due_date,
      toSql(data.person_id),
      toSql(data.site_id),
      data.amount,
      data.bank ?? null,
      data.serial_no ?? null,
      status,
      data.note ?? null,
      payload.id
    );
  return { ...payload, ...data, status };
};

const deleteCheckNote = (id: number) => {
  getDb().prepare('DELETE FROM checks_notes WHERE id = ?').run(id);
};

const summarizeChecks = (rows: CheckNoteRecord[]) => {
  const totals = {
    pendingTotal: 0,
    clearedTotal: 0,
    bouncedTotal: 0,
    cancelledTotal: 0,
    dueSoonCount: 0,
    overdueCount: 0
  };
  const today = new Date();
  const soon = new Date();
  soon.setDate(today.getDate() + 7);

  for (const row of rows) {
    switch (row.status) {
      case 'pending':
        totals.pendingTotal += row.amount;
        break;
      case 'cleared':
        totals.clearedTotal += row.amount;
        break;
      case 'bounced':
        totals.bouncedTotal += row.amount;
        break;
      case 'cancelled':
        totals.cancelledTotal += row.amount;
        break;
      default:
        break;
    }

    if (row.status === 'pending') {
      const due = new Date(row.due_date);
      if (due < today) {
        totals.overdueCount += 1;
      } else if (due <= soon) {
        totals.dueSoonCount += 1;
      }
    }
  }

  return totals;
};

const summarizePayroll = (rows: EmployeePayrollRecord[]) => {
  const totals = {
    salary: 0,
    advance: 0,
    deduction: 0,
    other: 0,
    net: 0
  };
  for (const row of rows) {
    totals[row.type] += row.amount;
  }
  totals.net = totals.salary + totals.other - totals.advance - totals.deduction;
  return totals;
};

const generalSearchByPerson = (personId: number): GeneralSearchResult => {
  const subcontractorPayments = getDb()
    .prepare('SELECT * FROM subcontractor_payments WHERE person_id = ? ORDER BY date DESC, id DESC')
    .all(personId) as SubcontractorPayment[];
  const subcontractorEntitlements = getDb()
    .prepare('SELECT * FROM subcontractor_entitlements WHERE person_id = ? ORDER BY date DESC, id DESC')
    .all(personId) as SubcontractorEntitlement[];
  const employeePayroll = getDb()
    .prepare('SELECT * FROM employee_payroll WHERE person_id = ? ORDER BY date DESC, id DESC')
    .all(personId) as EmployeePayrollRecord[];
  const checksNotes = getDb()
    .prepare('SELECT * FROM checks_notes WHERE person_id = ? ORDER BY due_date ASC, id DESC')
    .all(personId) as CheckNoteRecord[];

  const paymentsTotal = subcontractorPayments.reduce((sum, row) => sum + row.amount, 0);
  const entitlementsTotal = subcontractorEntitlements.reduce((sum, row) => sum + row.total, 0);
  const payrollTotals = summarizePayroll(employeePayroll);
  const checkTotals = summarizeChecks(checksNotes);

  return {
    subcontractorPayments,
    subcontractorEntitlements,
    employeePayroll,
    checksNotes,
    totals: {
      subcontractorPaymentsTotal: paymentsTotal,
      subcontractorEntitlementsTotal: entitlementsTotal,
      subcontractorNet: entitlementsTotal - paymentsTotal,
      employeePayroll: payrollTotals,
      checksNotes: checkTotals
    }
  };
};

const generalSearchBySite = (siteId: number): GeneralSearchResult => {
  const subcontractorPayments = getDb()
    .prepare('SELECT * FROM subcontractor_payments WHERE site_id = ? ORDER BY date DESC, id DESC')
    .all(siteId) as SubcontractorPayment[];
  const subcontractorEntitlements = getDb()
    .prepare('SELECT * FROM subcontractor_entitlements WHERE site_id = ? ORDER BY date DESC, id DESC')
    .all(siteId) as SubcontractorEntitlement[];
  const employeePayroll = getDb()
    .prepare('SELECT * FROM employee_payroll WHERE site_id = ? ORDER BY date DESC, id DESC')
    .all(siteId) as EmployeePayrollRecord[];
  const checksNotes = getDb()
    .prepare('SELECT * FROM checks_notes WHERE site_id = ? ORDER BY due_date ASC, id DESC')
    .all(siteId) as CheckNoteRecord[];

  const paymentsTotal = subcontractorPayments.reduce((sum, row) => sum + row.amount, 0);
  const entitlementsTotal = subcontractorEntitlements.reduce((sum, row) => sum + row.total, 0);
  const payrollTotals = summarizePayroll(employeePayroll);
  const checkTotals = summarizeChecks(checksNotes);

  return {
    subcontractorPayments,
    subcontractorEntitlements,
    employeePayroll,
    checksNotes,
    totals: {
      subcontractorPaymentsTotal: paymentsTotal,
      subcontractorEntitlementsTotal: entitlementsTotal,
      subcontractorNet: entitlementsTotal - paymentsTotal,
      employeePayroll: payrollTotals,
      checksNotes: checkTotals
    }
  };
};

const monthlyTotals = (month: string): MonthlyTotals => {
  const [year, mon] = month.split('-').map((part) => Number(part));
  const start = `${year}-${String(mon).padStart(2, '0')}-01`;
  const endDate = new Date(year, mon, 0);
  const end = `${year}-${String(mon).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

  const entitlementsTotal =
    (getDb()
      .prepare('SELECT SUM(total) as total FROM subcontractor_entitlements WHERE date BETWEEN ? AND ?')
      .get(start, end) as { total: number | null }).total ?? 0;
  const paymentsTotal =
    (getDb()
      .prepare('SELECT SUM(amount) as total FROM subcontractor_payments WHERE date BETWEEN ? AND ?')
      .get(start, end) as { total: number | null }).total ?? 0;
  const payrollTotal =
    (getDb()
      .prepare('SELECT SUM(amount) as total FROM employee_payroll WHERE date BETWEEN ? AND ?')
      .get(start, end) as { total: number | null }).total ?? 0;
  const checksTotal =
    (getDb()
      .prepare('SELECT SUM(amount) as total FROM checks_notes WHERE issue_date BETWEEN ? AND ?')
      .get(start, end) as { total: number | null }).total ?? 0;

  const checksNotes = getDb()
    .prepare('SELECT * FROM checks_notes WHERE due_date BETWEEN ? AND ?')
    .all(start, end) as CheckNoteRecord[];
  const checkSummary = summarizeChecks(checksNotes);

  return {
    month,
    subcontractorEntitlementsTotal: entitlementsTotal,
    subcontractorPaymentsTotal: paymentsTotal,
    employeePayrollTotal: payrollTotal,
    checksNotesTotal: checksTotal,
    dueSoonCount: checkSummary.dueSoonCount,
    overdueCount: checkSummary.overdueCount
  };
};

export const dbApi = {
  listSites,
  listPeople,
  createSite,
  createPerson,
  listSubcontractorPayments,
  createSubcontractorPayment,
  deleteSubcontractorPayment,
  listSubcontractorEntitlements,
  createSubcontractorEntitlement,
  updateSubcontractorEntitlement,
  deleteSubcontractorEntitlement,
  listEmployeePayroll,
  createEmployeePayroll,
  updateEmployeePayroll,
  deleteEmployeePayroll,
  listChecksNotes,
  createCheckNote,
  updateCheckNote,
  deleteCheckNote,
  monthlyTotals,
  generalSearchByPerson,
  generalSearchBySite
};

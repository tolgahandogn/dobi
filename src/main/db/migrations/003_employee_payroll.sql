CREATE TABLE IF NOT EXISTS employee_payroll (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  person_id INTEGER NOT NULL,
  site_id INTEGER,
  type TEXT NOT NULL CHECK(type IN ('salary','advance','deduction','other')),
  amount REAL NOT NULL,
  note TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (person_id) REFERENCES people(id),
  FOREIGN KEY (site_id) REFERENCES sites(id)
);

CREATE TABLE IF NOT EXISTS subcontractor_entitlements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  person_id INTEGER NOT NULL,
  site_id INTEGER,
  work TEXT NOT NULL,
  unit TEXT,
  quantity REAL,
  unit_price REAL,
  total REAL NOT NULL,
  note TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (person_id) REFERENCES people(id),
  FOREIGN KEY (site_id) REFERENCES sites(id)
);

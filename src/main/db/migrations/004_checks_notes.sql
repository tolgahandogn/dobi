CREATE TABLE IF NOT EXISTS checks_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK(kind IN ('check','note')),
  direction TEXT NOT NULL CHECK(direction IN ('given','received')),
  issue_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  person_id INTEGER,
  site_id INTEGER,
  amount REAL NOT NULL,
  bank TEXT,
  serial_no TEXT,
  status TEXT NOT NULL CHECK(status IN ('pending','cleared','bounced','cancelled')) DEFAULT 'pending',
  note TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (person_id) REFERENCES people(id),
  FOREIGN KEY (site_id) REFERENCES sites(id)
);

import React, { useMemo, useState } from 'react';
import Dashboard from './pages/Dashboard';
import GeneralSearch from './pages/GeneralSearch';
import SitesPeople from './pages/SitesPeople';
import SubcontractorEntitlements from './pages/SubcontractorEntitlements';
import SubcontractorPayments from './pages/SubcontractorPayments';
import EmployeePayroll from './pages/EmployeePayroll';
import ChecksNotes from './pages/ChecksNotes';

const pages = {
  dashboard: { label: 'Dashboard', element: <Dashboard /> },
  generalSearch: { label: 'Genel Arama', element: <GeneralSearch /> },
  sitesPeople: { label: 'Şantiyeler & Kişiler', element: <SitesPeople /> },
  subcontractorEntitlements: { label: 'Taşeron Hakediş', element: <SubcontractorEntitlements /> },
  subcontractorPayments: { label: 'Taşeron Ödeme', element: <SubcontractorPayments /> },
  employeePayroll: { label: 'Maaş / Avans', element: <EmployeePayroll /> },
  checksNotes: { label: 'Çek / Senet', element: <ChecksNotes /> }
};

type PageKey = keyof typeof pages;

const App = () => {
  const [active, setActive] = useState<PageKey>('dashboard');
  const activeElement = useMemo(() => pages[active].element, [active]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>DOBİ</h1>
        <ul className="nav-list">
          {(Object.keys(pages) as PageKey[]).map((key) => (
            <li key={key}>
              <button
                type="button"
                className={active === key ? 'active' : undefined}
                onClick={() => setActive(key)}
              >
                {pages[key].label}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <main className="main-content">{activeElement}</main>
    </div>
  );
};

export default App;

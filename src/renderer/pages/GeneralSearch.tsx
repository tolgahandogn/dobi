import React, { useEffect, useMemo, useState } from 'react';
import type { GeneralSearchResult, Person, Site } from '@shared/types';
import { Button, Select } from '../components/ui';
import { exportToCsv } from '../utils/exportToCsv';

const emptyResult: GeneralSearchResult = {
  subcontractorPayments: [],
  subcontractorEntitlements: [],
  employeePayroll: [],
  checksNotes: [],
  totals: {
    subcontractorPaymentsTotal: 0,
    subcontractorEntitlementsTotal: 0,
    subcontractorNet: 0,
    employeePayroll: { salary: 0, advance: 0, deduction: 0, other: 0, net: 0 },
    checksNotes: {
      pendingTotal: 0,
      clearedTotal: 0,
      bouncedTotal: 0,
      cancelledTotal: 0,
      dueSoonCount: 0,
      overdueCount: 0
    }
  }
};

const GeneralSearch = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [personId, setPersonId] = useState('');
  const [siteId, setSiteId] = useState('');
  const [result, setResult] = useState<GeneralSearchResult>(emptyResult);

  useEffect(() => {
    window.api.listPeople().then(setPeople).catch(console.error);
    window.api.listSites().then(setSites).catch(console.error);
  }, []);

  const fetchResult = async () => {
    if (personId) {
      const data = await window.api.generalSearchByPerson(Number(personId));
      setResult(data);
      return;
    }
    if (siteId) {
      const data = await window.api.generalSearchBySite(Number(siteId));
      setResult(data);
      return;
    }
    setResult(emptyResult);
  };

  useEffect(() => {
    void fetchResult();
  }, [personId, siteId]);

  const payrollTotals = result.totals.employeePayroll;
  const checksTotals = result.totals.checksNotes;

  const exportSummary = () => {
    exportToCsv(
      [
        {
          subcontractorPaymentsTotal: result.totals.subcontractorPaymentsTotal,
          subcontractorEntitlementsTotal: result.totals.subcontractorEntitlementsTotal,
          subcontractorNet: result.totals.subcontractorNet,
          payrollNet: payrollTotals.net,
          pendingChecks: checksTotals.pendingTotal,
          dueSoonCount: checksTotals.dueSoonCount,
          overdueCount: checksTotals.overdueCount
        }
      ],
      { filename: 'genel-ozet.csv' }
    );
  };

  const subtitle = useMemo(() => {
    if (personId) {
      return `Kişi: ${people.find((person) => person.id === Number(personId))?.name ?? ''}`;
    }
    if (siteId) {
      return `Şantiye: ${sites.find((site) => site.id === Number(siteId))?.name ?? ''}`;
    }
    return 'Filtre seçin';
  }, [personId, siteId, people, sites]);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="card">
        <h2>Genel Arama</h2>
        <p>{subtitle}</p>
        <div className="form-grid">
          <Select label="Kişi" value={personId} onChange={(event) => setPersonId(event.target.value)}>
            <option value="">Seçin</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </Select>
          <Select label="Şantiye" value={siteId} onChange={(event) => setSiteId(event.target.value)}>
            <option value="">Seçin</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </Select>
          <div className="actions" style={{ alignItems: 'flex-end' }}>
            <Button variant="secondary" onClick={exportSummary}>
              CSV Dışa Aktar
            </Button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Özet</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          <div>Hakediş Toplamı: {result.totals.subcontractorEntitlementsTotal.toFixed(2)} ₺</div>
          <div>Taşeron Ödeme: {result.totals.subcontractorPaymentsTotal.toFixed(2)} ₺</div>
          <div>Taşeron Net: {result.totals.subcontractorNet.toFixed(2)} ₺</div>
          <div>
            Maaş/Avans: Maaş {payrollTotals.salary.toFixed(2)} ₺, Avans {payrollTotals.advance.toFixed(2)} ₺,
            Kesinti {payrollTotals.deduction.toFixed(2)} ₺, Diğer {payrollTotals.other.toFixed(2)} ₺, Net{' '}
            {payrollTotals.net.toFixed(2)} ₺
          </div>
          <div>
            Çek/Senet: Bekleyen {checksTotals.pendingTotal.toFixed(2)} ₺, Tahsil {checksTotals.clearedTotal.toFixed(2)} ₺,
            Karşılıksız {checksTotals.bouncedTotal.toFixed(2)} ₺, İptal {checksTotals.cancelledTotal.toFixed(2)} ₺
          </div>
          <div>
            Uyarılar: {checksTotals.dueSoonCount} vade yaklaşan, {checksTotals.overdueCount} geciken
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSearch;

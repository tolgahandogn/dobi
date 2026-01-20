import React, { useEffect, useState } from 'react';
import type { MonthlyTotals, PingResponse } from '@shared/types';

const getCurrentMonth = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
};

const Dashboard = () => {
  const [ping, setPing] = useState<PingResponse | null>(null);
  const [month, setMonth] = useState(getCurrentMonth());
  const [totals, setTotals] = useState<MonthlyTotals | null>(null);

  useEffect(() => {
    window.api.ping().then(setPing).catch(console.error);
  }, []);

  useEffect(() => {
    window.api.monthlyTotals(month).then(setTotals).catch(console.error);
  }, [month]);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="banner">
        <strong>DOBİ</strong> offline-first yönetim paneli. {ping ? `Sürüm: ${ping.version}` : ''}
      </div>

      <div className="card">
        <h2>Dashboard</h2>
        <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          Ay
          <input
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          />
        </label>
        {totals ? (
          <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
            <div>Hakediş Toplamı: {totals.subcontractorEntitlementsTotal.toFixed(2)} ₺</div>
            <div>Taşeron Ödeme: {totals.subcontractorPaymentsTotal.toFixed(2)} ₺</div>
            <div>Maaş/Avans Hareketleri: {totals.employeePayrollTotal.toFixed(2)} ₺</div>
            <div>Çek/Senet Tutarı: {totals.checksNotesTotal.toFixed(2)} ₺</div>
            <div>
              Uyarılar: {totals.dueSoonCount} vadesi yaklaşan, {totals.overdueCount} geciken
            </div>
          </div>
        ) : (
          <p>Yükleniyor...</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

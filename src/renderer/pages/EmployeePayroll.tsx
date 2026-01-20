import React, { useEffect, useMemo, useState } from 'react';
import type { EmployeePayrollRecord, Person, Site } from '@shared/types';
import { Button, Input, Modal, Select } from '../components/ui';
import { exportToCsv } from '../utils/exportToCsv';

const emptyForm = {
  date: '',
  person_id: '',
  site_id: '',
  type: 'salary',
  amount: '',
  note: ''
};

const EmployeePayroll = () => {
  const [records, setRecords] = useState<EmployeePayrollRecord[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [filterPerson, setFilterPerson] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    window.api.listEmployeePayroll().then(setRecords).catch(console.error);
    window.api.listPeople().then(setPeople).catch(console.error);
    window.api.listSites().then(setSites).catch(console.error);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return records.filter((record) => {
      if (filterPerson && record.person_id !== Number(filterPerson)) {
        return false;
      }
      if (filterSite && record.site_id !== Number(filterSite)) {
        return false;
      }
      return true;
    });
  }, [records, filterPerson, filterSite]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, record) => {
        acc[record.type] += record.amount;
        return acc;
      },
      { salary: 0, advance: 0, deduction: 0, other: 0 }
    );
  }, [filtered]);

  const net = totals.salary + totals.other - totals.advance - totals.deduction;

  const submit = async () => {
    if (!form.date || !form.person_id || !form.amount) {
      return;
    }
    await window.api.createEmployeePayroll({
      date: form.date,
      person_id: Number(form.person_id),
      site_id: form.site_id ? Number(form.site_id) : null,
      type: form.type as EmployeePayrollRecord['type'],
      amount: Number(form.amount),
      note: form.note || null
    });
    setForm(emptyForm);
    setOpen(false);
    load();
  };

  const remove = async (id: number) => {
    await window.api.deleteEmployeePayroll(id);
    load();
  };

  return (
    <div className="card">
      <div className="actions" style={{ justifyContent: 'space-between' }}>
        <h2>Maaş / Avans</h2>
        <div className="actions">
          <Button variant="secondary" onClick={() => exportToCsv(filtered, { filename: 'maas-avans.csv' })}>
            CSV
          </Button>
          <Button onClick={() => setOpen(true)}>Yeni Kayıt</Button>
        </div>
      </div>

      <div className="form-grid" style={{ marginTop: 12 }}>
        <Select label="Kişi" value={filterPerson} onChange={(event) => setFilterPerson(event.target.value)}>
          <option value="">Tümü</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </Select>
        <Select label="Şantiye" value={filterSite} onChange={(event) => setFilterSite(event.target.value)}>
          <option value="">Tümü</option>
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name}
            </option>
          ))}
        </Select>
      </div>

      <div style={{ marginTop: 12 }}>
        <div>Maaş: {totals.salary.toFixed(2)} ₺</div>
        <div>Avans: {totals.advance.toFixed(2)} ₺</div>
        <div>Kesinti: {totals.deduction.toFixed(2)} ₺</div>
        <div>Diğer: {totals.other.toFixed(2)} ₺</div>
        <strong>Net Bakiye: {net.toFixed(2)} ₺</strong>
      </div>

      <table className="table" style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Kişi</th>
            <th>Şantiye</th>
            <th>Tür</th>
            <th>Tutar</th>
            <th>Not</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((record) => (
            <tr key={record.id}>
              <td>{record.date}</td>
              <td>{people.find((person) => person.id === record.person_id)?.name ?? record.person_id}</td>
              <td>{sites.find((site) => site.id === record.site_id)?.name ?? '-'}</td>
              <td>{record.type}</td>
              <td>{record.amount.toFixed(2)}</td>
              <td>{record.note ?? '-'}</td>
              <td>
                <Button variant="ghost" onClick={() => remove(record.id)}>
                  Sil
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={open} title="Yeni Maaş/Avans" onClose={() => setOpen(false)}>
        <div className="form-grid">
          <Input label="Tarih" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
          <Select
            label="Kişi"
            value={form.person_id}
            onChange={(event) => setForm({ ...form, person_id: event.target.value })}
          >
            <option value="">Seçin</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </Select>
          <Select
            label="Şantiye"
            value={form.site_id}
            onChange={(event) => setForm({ ...form, site_id: event.target.value })}
          >
            <option value="">Seçin</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </Select>
          <Select label="Tür" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
            <option value="salary">Maaş</option>
            <option value="advance">Avans</option>
            <option value="deduction">Kesinti</option>
            <option value="other">Diğer</option>
          </Select>
          <Input label="Tutar" type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
          <Input label="Not" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
        </div>
        <div className="actions" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
          <Button onClick={submit}>Kaydet</Button>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeePayroll;

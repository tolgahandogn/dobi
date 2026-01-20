import React, { useEffect, useState } from 'react';
import type { Person, Site, SubcontractorPayment } from '@shared/types';
import { Button, Input, Modal, Select } from '../components/ui';
import { exportToCsv } from '../utils/exportToCsv';

const emptyForm = {
  date: '',
  person_id: '',
  site_id: '',
  amount: '',
  note: ''
};

const SubcontractorPayments = () => {
  const [payments, setPayments] = useState<SubcontractorPayment[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    window.api.listSubcontractorPayments().then(setPayments).catch(console.error);
    window.api.listPeople().then(setPeople).catch(console.error);
    window.api.listSites().then(setSites).catch(console.error);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (!form.date || !form.person_id || !form.amount) {
      return;
    }
    await window.api.createSubcontractorPayment({
      date: form.date,
      person_id: Number(form.person_id),
      site_id: form.site_id ? Number(form.site_id) : null,
      amount: Number(form.amount),
      note: form.note || null
    });
    setForm(emptyForm);
    setOpen(false);
    load();
  };

  const remove = async (id: number) => {
    await window.api.deleteSubcontractorPayment(id);
    load();
  };

  return (
    <div className="card">
      <div className="actions" style={{ justifyContent: 'space-between' }}>
        <h2>Taşeron Ödemeleri</h2>
        <div className="actions">
          <Button variant="secondary" onClick={() => exportToCsv(payments, { filename: 'taseron-odemeler.csv' })}>
            CSV
          </Button>
          <Button onClick={() => setOpen(true)}>Yeni Ödeme</Button>
        </div>
      </div>

      <table className="table" style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Kişi</th>
            <th>Şantiye</th>
            <th>Tutar</th>
            <th>Not</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td>{payment.date}</td>
              <td>{people.find((person) => person.id === payment.person_id)?.name ?? payment.person_id}</td>
              <td>{sites.find((site) => site.id === payment.site_id)?.name ?? '-'}</td>
              <td>{payment.amount.toFixed(2)}</td>
              <td>{payment.note ?? '-'}</td>
              <td>
                <Button variant="ghost" onClick={() => remove(payment.id)}>
                  Sil
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={open} title="Yeni Ödeme" onClose={() => setOpen(false)}>
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

export default SubcontractorPayments;

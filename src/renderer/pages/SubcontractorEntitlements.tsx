import React, { useEffect, useMemo, useState } from 'react';
import type { Person, Site, SubcontractorEntitlement } from '@shared/types';
import { Button, Input, Modal, Select } from '../components/ui';
import { exportToCsv } from '../utils/exportToCsv';

const emptyForm = {
  date: '',
  person_id: '',
  site_id: '',
  work: '',
  unit: '',
  quantity: '',
  unit_price: '',
  total: '',
  note: ''
};

const SubcontractorEntitlements = () => {
  const [entitlements, setEntitlements] = useState<SubcontractorEntitlement[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    window.api.listSubcontractorEntitlements().then(setEntitlements).catch(console.error);
    window.api.listPeople().then(setPeople).catch(console.error);
    window.api.listSites().then(setSites).catch(console.error);
  };

  useEffect(() => {
    load();
  }, []);

  const totalValue = useMemo(() => {
    const quantity = Number(form.quantity || 0);
    const unitPrice = Number(form.unit_price || 0);
    if (quantity && unitPrice) {
      return quantity * unitPrice;
    }
    return Number(form.total || 0);
  }, [form.quantity, form.unit_price, form.total]);

  const submit = async () => {
    if (!form.date || !form.person_id || !form.work) {
      return;
    }
    await window.api.createSubcontractorEntitlement({
      date: form.date,
      person_id: Number(form.person_id),
      site_id: form.site_id ? Number(form.site_id) : null,
      work: form.work,
      unit: form.unit || null,
      quantity: form.quantity ? Number(form.quantity) : null,
      unit_price: form.unit_price ? Number(form.unit_price) : null,
      total: totalValue,
      note: form.note || null
    });
    setForm(emptyForm);
    setOpen(false);
    load();
  };

  const remove = async (id: number) => {
    await window.api.deleteSubcontractorEntitlement(id);
    load();
  };

  return (
    <div className="card">
      <div className="actions" style={{ justifyContent: 'space-between' }}>
        <h2>Taşeron Hakediş</h2>
        <div className="actions">
          <Button variant="secondary" onClick={() => exportToCsv(entitlements, { filename: 'taseron-hakedis.csv' })}>
            CSV
          </Button>
          <Button onClick={() => setOpen(true)}>Yeni Hakediş</Button>
        </div>
      </div>

      <table className="table" style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Kişi</th>
            <th>Şantiye</th>
            <th>İş</th>
            <th>Miktar</th>
            <th>Fiyat</th>
            <th>Tutar</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {entitlements.map((item) => (
            <tr key={item.id}>
              <td>{item.date}</td>
              <td>{people.find((person) => person.id === item.person_id)?.name ?? item.person_id}</td>
              <td>{sites.find((site) => site.id === item.site_id)?.name ?? '-'}</td>
              <td>{item.work}</td>
              <td>{item.quantity ?? '-'}</td>
              <td>{item.unit_price ?? '-'}</td>
              <td>{item.total.toFixed(2)}</td>
              <td>
                <Button variant="ghost" onClick={() => remove(item.id)}>
                  Sil
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={open} title="Yeni Hakediş" onClose={() => setOpen(false)}>
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
          <Input label="İş" value={form.work} onChange={(event) => setForm({ ...form, work: event.target.value })} />
          <Input label="Birim" value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} />
          <Input label="Miktar" type="number" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} />
          <Input
            label="Birim Fiyat"
            type="number"
            value={form.unit_price}
            onChange={(event) => setForm({ ...form, unit_price: event.target.value })}
          />
          <Input label="Tutar" type="number" value={totalValue} onChange={(event) => setForm({ ...form, total: event.target.value })} />
          <Input label="Not" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
        </div>
        <div className="actions" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
          <Button onClick={submit}>Kaydet</Button>
        </div>
      </Modal>
    </div>
  );
};

export default SubcontractorEntitlements;

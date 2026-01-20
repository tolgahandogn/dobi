import React, { useEffect, useMemo, useState } from 'react';
import type { CheckNoteRecord, Person, Site } from '@shared/types';
import { Button, Input, Modal, Select } from '../components/ui';
import { exportToCsv } from '../utils/exportToCsv';

const emptyForm = {
  kind: 'check',
  direction: 'given',
  issue_date: '',
  due_date: '',
  person_id: '',
  site_id: '',
  amount: '',
  bank: '',
  serial_no: '',
  status: 'pending',
  note: ''
};

const ChecksNotes = () => {
  const [records, setRecords] = useState<CheckNoteRecord[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    window.api.listChecksNotes().then(setRecords).catch(console.error);
    window.api.listPeople().then(setPeople).catch(console.error);
    window.api.listSites().then(setSites).catch(console.error);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (!form.issue_date || !form.due_date || !form.amount) {
      return;
    }
    await window.api.createCheckNote({
      kind: form.kind as CheckNoteRecord['kind'],
      direction: form.direction as CheckNoteRecord['direction'],
      issue_date: form.issue_date,
      due_date: form.due_date,
      person_id: form.person_id ? Number(form.person_id) : null,
      site_id: form.site_id ? Number(form.site_id) : null,
      amount: Number(form.amount),
      bank: form.bank || null,
      serial_no: form.serial_no || null,
      status: form.status as CheckNoteRecord['status'],
      note: form.note || null
    });
    setForm(emptyForm);
    setOpen(false);
    load();
  };

  const updateStatus = async (record: CheckNoteRecord, status: CheckNoteRecord['status']) => {
    await window.api.updateCheckNote({ ...record, status });
    load();
  };

  const remove = async (id: number) => {
    await window.api.deleteCheckNote(id);
    load();
  };

  const warnings = useMemo(() => {
    const today = new Date();
    const soon = new Date();
    soon.setDate(today.getDate() + 7);
    return records.map((record) => {
      if (record.status !== 'pending') {
        return null;
      }
      const due = new Date(record.due_date);
      if (due < today) {
        return { id: record.id, label: 'Gecikmiş' };
      }
      if (due <= soon) {
        return { id: record.id, label: 'Vadesi Yakın' };
      }
      return null;
    });
  }, [records]);

  return (
    <div className="card">
      <div className="actions" style={{ justifyContent: 'space-between' }}>
        <h2>Çek / Senet</h2>
        <div className="actions">
          <Button variant="secondary" onClick={() => exportToCsv(records, { filename: 'cek-senet.csv' })}>
            CSV
          </Button>
          <Button onClick={() => setOpen(true)}>Yeni Kayıt</Button>
        </div>
      </div>

      <table className="table" style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th>Tür</th>
            <th>Yön</th>
            <th>Vade</th>
            <th>İlgili</th>
            <th>Şantiye</th>
            <th>Tutar</th>
            <th>Durum</th>
            <th>Uyarı</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => {
            const warning = warnings.find((item) => item?.id === record.id);
            return (
              <tr key={record.id}>
                <td>{record.kind}</td>
                <td>{record.direction}</td>
                <td>{record.due_date}</td>
                <td>{people.find((person) => person.id === record.person_id)?.name ?? '-'}</td>
                <td>{sites.find((site) => site.id === record.site_id)?.name ?? '-'}</td>
                <td>{record.amount.toFixed(2)}</td>
                <td>
                  <Select
                    value={record.status}
                    onChange={(event) => updateStatus(record, event.target.value as CheckNoteRecord['status'])}
                  >
                    <option value="pending">Bekliyor</option>
                    <option value="cleared">Tahsil</option>
                    <option value="bounced">Karşılıksız</option>
                    <option value="cancelled">İptal</option>
                  </Select>
                </td>
                <td>{warning ? <span className="badge">{warning.label}</span> : '-'}</td>
                <td>
                  <Button variant="ghost" onClick={() => remove(record.id)}>
                    Sil
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Modal open={open} title="Yeni Çek/Senet" onClose={() => setOpen(false)}>
        <div className="form-grid">
          <Select label="Tür" value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value })}>
            <option value="check">Çek</option>
            <option value="note">Senet</option>
          </Select>
          <Select
            label="Yön"
            value={form.direction}
            onChange={(event) => setForm({ ...form, direction: event.target.value })}
          >
            <option value="given">Verilen</option>
            <option value="received">Alınan</option>
          </Select>
          <Input
            label="Düzenleme Tarihi"
            type="date"
            value={form.issue_date}
            onChange={(event) => setForm({ ...form, issue_date: event.target.value })}
          />
          <Input
            label="Vade"
            type="date"
            value={form.due_date}
            onChange={(event) => setForm({ ...form, due_date: event.target.value })}
          />
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
          <Input label="Banka" value={form.bank} onChange={(event) => setForm({ ...form, bank: event.target.value })} />
          <Input label="Seri No" value={form.serial_no} onChange={(event) => setForm({ ...form, serial_no: event.target.value })} />
          <Select label="Durum" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
            <option value="pending">Bekliyor</option>
            <option value="cleared">Tahsil</option>
            <option value="bounced">Karşılıksız</option>
            <option value="cancelled">İptal</option>
          </Select>
          <Input label="Not" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
        </div>
        <div className="actions" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
          <Button onClick={submit}>Kaydet</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ChecksNotes;

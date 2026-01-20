import React, { useEffect, useState } from 'react';
import type { Person, Site } from '@shared/types';
import { Button, Input } from '../components/ui';
import { exportToCsv } from '../utils/exportToCsv';

const SitesPeople = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [siteName, setSiteName] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [personName, setPersonName] = useState('');
  const [personTitle, setPersonTitle] = useState('');
  const [personPhone, setPersonPhone] = useState('');

  const load = () => {
    window.api.listSites().then(setSites).catch(console.error);
    window.api.listPeople().then(setPeople).catch(console.error);
  };

  useEffect(() => {
    load();
  }, []);

  const addSite = async () => {
    if (!siteName) {
      return;
    }
    await window.api.createSite({ name: siteName, location: siteLocation || null });
    setSiteName('');
    setSiteLocation('');
    load();
  };

  const addPerson = async () => {
    if (!personName) {
      return;
    }
    await window.api.createPerson({ name: personName, title: personTitle || null, phone: personPhone || null });
    setPersonName('');
    setPersonTitle('');
    setPersonPhone('');
    load();
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="card">
        <h2>Şantiyeler</h2>
        <div className="form-grid">
          <Input label="Şantiye Adı" value={siteName} onChange={(event) => setSiteName(event.target.value)} />
          <Input label="Lokasyon" value={siteLocation} onChange={(event) => setSiteLocation(event.target.value)} />
          <div className="actions" style={{ alignItems: 'flex-end' }}>
            <Button onClick={addSite}>Ekle</Button>
            <Button
              variant="secondary"
              onClick={() => exportToCsv(sites, { filename: 'siteler.csv' })}
            >
              CSV
            </Button>
          </div>
        </div>
        <table className="table" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>Ad</th>
              <th>Lokasyon</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((site) => (
              <tr key={site.id}>
                <td>{site.name}</td>
                <td>{site.location ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Kişiler</h2>
        <div className="form-grid">
          <Input label="Ad Soyad" value={personName} onChange={(event) => setPersonName(event.target.value)} />
          <Input label="Ünvan" value={personTitle} onChange={(event) => setPersonTitle(event.target.value)} />
          <Input label="Telefon" value={personPhone} onChange={(event) => setPersonPhone(event.target.value)} />
          <div className="actions" style={{ alignItems: 'flex-end' }}>
            <Button onClick={addPerson}>Ekle</Button>
            <Button
              variant="secondary"
              onClick={() => exportToCsv(people, { filename: 'kisiler.csv' })}
            >
              CSV
            </Button>
          </div>
        </div>
        <table className="table" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>Ad</th>
              <th>Ünvan</th>
              <th>Telefon</th>
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr key={person.id}>
                <td>{person.name}</td>
                <td>{person.title ?? '-'}</td>
                <td>{person.phone ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SitesPeople;

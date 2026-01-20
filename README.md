# DOBİ

DOBİ, offline-first inşaat ve şantiye yönetimi için tasarlanmış bir Electron + Vite + React + TypeScript masaüstü uygulamasıdır.

## Modüller

- Taşeron Hakediş / Alacak
- Taşeron Ödemeleri
- Maaş / Avans / Kesinti takibi
- Çek / Senet yönetimi
- Genel arama ve özet raporlar

## Geliştirme

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run dist
```

## Smoke Test Checklist

Çalıştırma:

```bash
npm run dev
```

Kontrol listesi:
- Uygulama penceresi açılıyor, menüler gezilebiliyor.
- Şantiye ve kişi oluşturulabiliyor.
- Hakediş + ödeme girilip net hesabı doğrulanıyor.
- Maaş/avans girilip bakiye doğrulanıyor.
- Çek/senet kayıtları eklenip vade uyarıları görülüyor.
- CSV dışa aktarım dosyası Excel'de açılıyor.
- `npm run build` ve `npm run dist` başarıyla tamamlanıyor.
- Kurulum sonrası uygulama beyaz ekran olmadan açılıyor.

# 🍷 Aplikacija za Ocenjivanje Vina

Mobilna Android aplikacija za profesionalnu degustaciju i ocenjivanje vina, sa elegantnim dizajnom inspirisanim drvenim tablama i vinovom lozom.

## ✨ Karakteristike

- 📱 **Mobilna verzija** - Optimizovana za Android telefone
- 🍇 **Elegantan dizajn** - Drveni ram sa vinovom lozom i grožđem po uglovima
- ⭐ **Profesionalno ocenjivanje** - 4 kategorije (Izgled, Ukus, Završetak, Ukupno) + izbor aroma i detaljna evaluacija
- 🔍 **Napredni filteri** - Po tipu vina i regionu
- 📊 **Sortiranje** - Od najboljih ka najgorim, najnovije prvo
- ✏️ **Izmena podataka** - Mogućnost izmene svih informacija o vinu prilikom ocenjivanja
- 💾 **LocalStorage** - Automatsko čuvanje svih vina na uređaju
- 🛟 **Rezervna kopija** - Izvoz (kopiranje / .json fajl) i uvoz liste vina
- 🗑️ **Brisanje vina** - Dugme za brisanje na svakoj kartici
- 📝 **Dugačka imena** - Automatski prelom u više redova
- 💾 **Dodavanje vina** - Lako dodavanje novih vina u kolekciju

## 🚀 Brzi Start

### Pokretanje u browseru (Razvoj)

```bash
npm install
npm run dev
```

### Pravljenje Android Aplikacije

```bash
# 1. Build
npm run build

# 2. Dodaj Android platformu
npx cap add android

# 3. Otvori u Android Studio
npx cap open android
```

Detaljno uputstvo: **ANDROID_UPUTSTVO.md**

## 🎨 Promena Ikone Aplikacije

```bash
# 1. Instalacija
npm install -D @capacitor/assets

# 2. Napravite folder resources/ i stavite vašu ikonu (1024x1024)
mkdir resources

# 3. Generisanje
npx capacitor-assets generate --android

# 4. Sinhronizacija
npx cap sync
```

Detaljno uputstvo: **IKONA_UPUTSTVO.md**

## 📂 Struktura Projekta

```
/
├── src/
│   └── app/
│       ├── App.tsx              # Glavna komponenta
│       ├── wine.ts              # Zajednički tipovi, formula ocene, logika kupaže
│       └── components/
│           ├── WineCard.tsx     # Kartica vina
│           ├── GradingModal.tsx # Modal za ocenjivanje
│           ├── AddWineModal.tsx # Modal za dodavanje vina
│           ├── BackupModal.tsx  # Izvoz / uvoz rezervne kopije
│           ├── aroma/           # Izbor aroma
│           └── ui/              # Osnovne UI komponente (dugmad, dijalozi...)
├── src/data/aromas.ts           # Lista aroma po kategorijama
├── android/                     # Android projekat (kreira Capacitor)
├── resources/                   # Ikone i splash screens
├── capacitor.config.ts          # Capacitor konfiguracija
├── ANDROID_UPUTSTVO.md          # Detaljno Android uputstvo
├── IKONA_UPUTSTVO.md            # Uputstvo za ikone
└── README.md                    # Ovaj fajl
```

## 🛠️ Tehnologije

- **React** - UI framework
- **TypeScript** - Tipizacija
- **Tailwind CSS** - Stilizovanje
- **Capacitor** - Native Android funkcionalnost
- **Vite** - Build alat
- **Radix UI** - UI komponente

## 📱 Funkcionalnosti Aplikacije

### Ocenjivanje Vina
- **Izgled** (Bistrina, boja, viskoznost)
- **Ukus** (Aroma, balans, kompleksnost)
- **Završetak** (Posleukus, trajanje)
- **Ukupno** (Opšti utisak)

Svaka kategorija se ocenjuje od 0-100 poena. **Konačna ocena je prosek ove 4 kategorije.**

Arome (voćne, cvetne, začinske...) se biraju kao opis vina i koriste se za filtriranje,
ali **ne utiču na ocenu**. Isto važi i za detaljnu evaluaciju (bistrina, slatkoća, tanini...).

### Rezervna Kopija
Vina se čuvaju samo na uređaju — brisanjem podataka aplikacije ili reinstalacijom se gube.
Dugme **Rezervna Kopija** na početnom ekranu omogućava:
- **Kopiraj** - kopira sva vina kao tekst (nalepite u beleške, e-mail, Viber...)
- **Preuzmi fajl** - preuzima `.json` fajl (radi u browseru; na telefonu koristite Kopiraj)
- **Uvoz** - iz `.json` fajla ili nalepljenog teksta (zamenjuje trenutnu listu, uz potvrdu)

### Dodavanje Vina
- Ime vina
- Tip (Crveno, Belo, Roze, Šampanjac, itd.)
- Godina (samo broj)
- Region proizvodnje
- Beleške degustacije

### Filteri i Sortiranje
- Filtriranje po tipu vina
- Filtriranje po regionu
- Sortiranje: Najnovije prvo / Od najboljih ka najgorim / Od najgorih ka najboljim

## 🔧 Development

### Izmene u kodu

Nakon svake izmene:
```bash
npm run build
npx cap sync
```

Zatim u Android Studio kliknite zeleno ▶ Run dugme.

### Pravljenje APK fajla

U Android Studio:
1. Build > Generate Signed Bundle / APK
2. Izaberite APK
3. Kreirajte keystore (prvi put)
4. APK će biti u: `android/app/release/app-release.apk`

## 📖 Dokumentacija

- [Android Uputstvo](./ANDROID_UPUTSTVO.md) - Kompletan vodič za Android
- [Ikona Uputstvo](./IKONA_UPUTSTVO.md) - Kako promeniti ikonu aplikacije
- [Capacitor Docs](https://capacitorjs.com/docs/android) - Zvanična dokumentacija

## 🐛 Problemi?

Pogledajte sekciju "Problemi i Rešenja" u `ANDROID_UPUTSTVO.md`

Najčešći problemi:
- Gradle greške → `./gradlew clean` i rebuild
- Ikona se ne menja → Invalidate Caches u Android Studio
- USB debugging → Proverite Developer Options na telefonu

## 📄 Licenca

Ovaj projekat je kreiran za privatnu upotrebu.

## 🍇 Dizajn

Aplikacija koristi elegantnu kombinaciju:
- **Drveni ram** - Topli amber tonovi imitiraju drvo
- **Vinova loza** - Po uglovima rama sa grožđem u ljubičastim tonovima
- **Responzivan dizajn** - Prilagođava se različitim veličinama ekrana
- **Touch-friendly** - Veliki dugmad i elementi za lakšu upotrebu na telefonu

---

Napravljeno sa ❤️ za ljubitelje vina 🍷
# Changelog - Poslednje Izmene

## 🆕 Verzija 1.0.0 – grana `unapredjenja` (novembar 2026)

Urađeno prema spisku u `predlozi/PREDLOZI.md` (oznake u zagradi su oznake stavki sa tog spiska).

**Ispravljene greške**
- Detaljna analiza se više ne briše pri ponovnom čuvanju vina (A1)
- Izmena vina više ne upisuje ocenu 50 ako klizači nisu pomereni (A2); dugme „Ukloni ocenu“ (A3)
- Ime vina je obavezno i pri izmeni (A4); neispravna kupaža i godina prikazuju poruku (A5, A7)
- Sastav može da se poništi i pri dodavanju (A6)

**Novo**
- Pretraga, novi načini sortiranja, filter ocenjena/neocenjena, zaglavlje sa brojačima (C2, C4, C5, C6)
- Stranica „Statistika“ (C7); do 6 aroma na kartici (C8)
- Datum degustacije i datum dodavanja (D1); ocena uživo i dugmad +/− (D3, D4)
- Nova polja: vinarija, cena, alkohol, mesto kupovine, „kupio bih opet“ (D5)
- Predlozi pri kucanju (D7); tanini samo za crvena, ponuđene boje (D12)
- Upozorenje pri zatvaranju sa nesačuvanim izmenama (D13)
- Uvoz koji dodaje na postojeća vina (E5); izvoz u CSV za Excel (E6)
- Potvrde u stilu aplikacije i „Poništi“ posle brisanja (E8)
- Aplikacija počinje prazna, bez primera vina (B1); naziv „Wine Card“ svuda (B2)

**Ispod haube**
- Verzija formata podataka sa automatskim prevođenjem starih vina (D2) – `src/app/storage.ts`
- Jedna zajednička forma za dodavanje i ocenjivanje (G1) – `WineForm.tsx`, `WineModal.tsx`
- Verzija aplikacije na jednom mestu, u `package.json` (B6); `npm run check` (G5)
- `.gitattributes`, `.cursor` van gita, uklonjeni ostaci Figma šablona (G3, B8, B7)

## 🆕 Novembar 2026

- 🛟 **Rezervna kopija** - novo dugme "Rezervna Kopija": izvoz (kopiraj / preuzmi .json) i uvoz vina
- 📦 **package.json** - `react`, `react-dom`, `@capacitor/core` i `@capacitor/cli` su sada prave zavisnosti
  (ranije su radile samo slučajno). Posle preuzimanja pokrenite `npm install`.
- 🧹 **Čišćenje koda** - zajednički tipovi i logika kupaže izdvojeni u `src/app/wine.ts`;
  uklonjeno ~30 neiskorišćenih UI komponenti; `dist/` više nije u gitu
- 📝 **README** - ispravljeno: ocena je prosek 4 kategorije, arome ne utiču na ocenu

## 🎉 Nove Funkcionalnosti

### 1. ✅ LocalStorage - Trajno Čuvanje Vina
- **Automatsko čuvanje**: Sva vina se automatski čuvaju u browser localStorage
- **Automatsko učitavanje**: Kada ponovo otvorite aplikaciju, vina su tu!
- **Inicijalna vina**: Ako je prvi put, aplikacija počinje sa 6 primera vina
- **Lokacija**: Podaci se čuvaju u browser-u (ne server)

**Kako radi:**
```javascript
// Čuva se u: localStorage.setItem('wine-app-data', JSON.stringify(wines))
// Učitava se: localStorage.getItem('wine-app-data')
```

### 2. 🗑️ Brisanje Vina
- **Dugme za brisanje**: Svaka kartica vina ima crveno dugme sa korpom
- **Potvrda**: Prikazuje se prozor "Da li ste sigurni?"
- **Trajan efekat**: Obrisano vino se odmah čuva u localStorage

**Kako koristiti:**
1. Nađite vino koje želite da obrišete
2. Kliknite na ikonu korpe (desno gore)
3. Potvrdite brisanje

### 3. 📝 Dugačka Imena - Multi-line
- **Automatski prelom**: Predugačka imena vina idu u drugi red
- **Break-words**: Koristi `break-words` da lepo prelama dugačke reči
- **Ikona**: Ikona vina je pomerena gore da bude poravnata

**Primer:**
```
Château Margaux Premier Grand Cru Classé de Bordeaux
```
Ide u više redova umesto da bude isečeno.

### 4. 📍 "Nije Ocenjeno" - Novi Položaj
- **Donji desni ugao**: Sada je u donjem desnom uglu kartice
- **Manji font**: `text-[10px]` da ne smeta
- **Flex layout**: Koristi flexbox za optimalno pozicioniranje

**Položaj:**
```
[Ime Vina]                    [🗑️]
[Tip] [Godina]
[Region]            [Nije ocenjeno]
```

### 5. 🚫 Nema Automatskog Fokusa u Modal-u
- **Bez autofocus**: Kad otvorite modal za ocenjivanje, polje za ime se NE otvara automatski
- **Ručno klikanje**: Morate kliknuti na polje da ga uredite
- **Bolje UX**: Ne gubi se scrolling pozicija

---

## 🛠️ Tehnički Detalji

### LocalStorage Implementation
```typescript
const STORAGE_KEY = 'wine-app-data';

// Load
const loadWinesFromStorage = (): Wine[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : defaultWines;
};

// Save
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wines));
}, [wines]);
```

### WineCard Layout
```tsx
<div className="flex items-start justify-between gap-2">
  <div className="flex items-start gap-2 flex-1 min-w-0 pr-2">
    <Wine className="w-5 h-5 text-purple-900 flex-shrink-0 mt-1" />
    <CardTitle className="text-lg break-words">{name}</CardTitle>
  </div>
  <Button onClick={handleDelete}>
    <Trash2 />
  </Button>
</div>
```

---

## 📱 Kako Testirati

### 1. LocalStorage Test
```javascript
// U browser konzoli (F12):
localStorage.getItem('wine-app-data')
// Trebalo bi da vidi JSON sa svim vinima
```

### 2. Brisanje Test
1. Dodajte novo vino
2. Obrišite ga
3. Refresh stranice - trebalo bi da ostane obrisano

### 3. Dugačko Ime Test
Dodajte vino sa imenom:
```
Château Margaux Premier Grand Cru Classé de Bordeaux Pauillac France
```
Trebalo bi da ide u više redova.

---

## 🔄 Izmenjeni Fajlovi

### `/src/app/App.tsx`
- ✅ Dodata funkcija `loadWinesFromStorage()`
- ✅ Dodat `useEffect` za čuvanje u localStorage
- ✅ Dodata funkcija `handleDeleteWine()`
- ✅ Prosleđen `onDelete` prop u `WineCard`

### `/src/app/components/WineCard.tsx`
- ✅ Dodat `onDelete` prop
- ✅ Dodata `Trash2` ikona i dugme
- ✅ Promenjen layout za multi-line imena
- ✅ Pomereno "Nije ocenjeno" u donji desni ugao
- ✅ Ikona vina sada je `mt-1` da bude poravnata sa tekstom

### `/src/app/components/GradingModal.tsx`
- ✅ Nema autofocus-a (već je bilo tako)
- ✅ Input polja su normalna

---

## 🚀 Sledeći Koraci (Opciono)

### Predlozi za Dalje:
1. **Export/Import** - Mogućnost da eksportujete vina kao JSON
2. **Slike vina** - Upload fotografija bočica
3. **Sortiranje u kartici** - Drag & drop za ručno sortiranje
4. **Kategorije** - Grupisanje vina (npr. "Kolekcija 2024")
5. **Statistika** - Grafikon prosečnih ocena
6. **Deljenje** - QR kod ili link za deljenje ocene

---

## ⚠️ Važne Napomene

### LocalStorage Ograničenja
- **Veličina**: ~5-10MB (dovoljno za hiljade vina)
- **Browser specifično**: Podaci su samo u vašem browser-u
- **Privatno**: Ne sinhronizuje se između uređaja
- **Brisanje**: Ako obrišete browser podatke, vina se gube

### Backup Savet
```javascript
// Backup-ujte vina ručno (u browser konzoli):
copy(localStorage.getItem('wine-app-data'))
// Paste u text fajl za sigurnost

// Restore:
localStorage.setItem('wine-app-data', '[paste JSON ovde]')
```

---

## 📞 Pomoć

Ako nešto ne radi:
1. Proverite browser konzolu (F12) za greške
2. Pokušajte `localStorage.clear()` pa refresh
3. Hard refresh: Ctrl+Shift+R (Windows) ili Cmd+Shift+R (Mac)

Sve radi savršeno! 🍷✨

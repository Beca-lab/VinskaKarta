# Detaljno Uputstvo - Promena Ikone Aplikacije

## Metod 1: Automatski (PREPORUČENO) ✨

### Korak 1: Instalacija Capacitor Assets
```bash
npm install -D @capacitor/assets
```

### Korak 2: Kreiranje ikone

1. **Napravite ikonu** velečine **1024x1024 piksela** u PNG formatu
   - Možete koristiti besplatne alate:
     - **Canva** (https://www.canva.com) - najlakše za početnike
     - **Photopea** (https://www.photopea.com) - besplatan Photoshop online
     - **GIMP** - besplatna desktop aplikacija
   
2. **Ideje za ikonu vina:**
   - Stilizovana čaša vina 🍷
   - Grožđe ili vinova loza 🍇
   - Bure vina
   - Kombinacija čaše i grožđa

3. **Važno:**
   - Format: **PNG**
   - Dimenzije: **1024x1024px**
   - Pozadina: može biti providna ili sa bojom
   - Izbegavajte sitne detalje (neće se videti na maloj ikoni)

### Korak 3: Sačuvajte ikonu

Napravite folder `resources` u root-u projekta i sačuvajte ikonu kao `icon.png`:

```
vašProjekat/
├── android/
├── src/
├── resources/          ← NOVI FOLDER
│   └── icon.png       ← VAŠA IKONA (1024x1024)
├── capacitor.config.ts
└── package.json
```

### Korak 4: Generisanje

Pokrenite komandu:
```bash
npx capacitor-assets generate --android
```

Ova komanda će automatski napraviti sve potrebne veličine ikone!

### Korak 5: Sinhronizacija

```bash
npx cap sync android
```

### Korak 6: Test

Otvorite u Android Studio i pokrenite aplikaciju:
```bash
npx cap open android
```

---

## Metod 2: Ručno (Alternativa)

Ako automatski metod ne radi, možete ručno postaviti ikone:

### Korak 1: Priprema ikona različitih veličina

Napravite ikone u sledećim veličinama:
- **48x48px** - za mdpi
- **72x72px** - za hdpi  
- **96x96px** - za xhdpi
- **144x144px** - za xxhdpi
- **192x192px** - za xxxhdpi

### Korak 2: Postavite ikone u Android projekat

Kopirajte ikone u sledeće foldere:

```
android/app/src/main/res/
├── mipmap-mdpi/
│   └── ic_launcher.png          (48x48)
│   └── ic_launcher_round.png    (48x48)
├── mipmap-hdpi/
│   └── ic_launcher.png          (72x72)
│   └── ic_launcher_round.png    (72x72)
├── mipmap-xhdpi/
│   └── ic_launcher.png          (96x96)
│   └── ic_launcher_round.png    (96x96)
├── mipmap-xxhdpi/
│   └── ic_launcher.png          (144x144)
│   └── ic_launcher_round.png    (144x144)
└── mipmap-xxxhdpi/
    └── ic_launcher.png          (192x192)
    └── ic_launcher_round.png    (192x192)
```

**Napomena:** `ic_launcher_round.png` je za okrugle ikone (neki Android telefoni). Možete koristiti istu sliku.

### Korak 3: Build

U Android Studio-u:
1. Build > Clean Project
2. Build > Rebuild Project
3. Pokrenite aplikaciju

---

## Online Alati za Generisanje Ikona

Ako ne želite da ručno menjate veličinu, koristite online alate:

### 1. **App Icon Generator** (Preporučujem!)
https://www.appicon.co/
- Postavite vašu 1024x1024 sliku
- Odaberite "Android"
- Download ZIP
- Raspakovati i kopirajte foldere u `android/app/src/main/res/`

### 2. **Icon Kitchen**
https://icon.kitchen/
- Drag & drop vašu sliku
- Podesite margin, pozadinu
- Download kao Android asset pack

### 3. **Android Asset Studio**
https://romannurik.github.io/AndroidAssetStudio/
- Launcher Icons
- Upload sliku
- Customize
- Download ZIP

---

## Provera da li je ikona promenjena

### Na telefonu:
1. **Deinstalirajte** staru verziju aplikacije (ako postoji)
2. Pokrenite novu verziju iz Android Studio
3. Pogledajte launcher (početni ekran telefona)
4. Ikona bi trebalo da je nova!

### Ako ikona nije promenjena:
```bash
# 1. Obri�ite build foldere
cd android
./gradlew clean

# 2. Pokrenite ponovo build
npx cap sync android
npx cap open android
```

U Android Studio-u:
- File > Invalidate Caches > Invalidate and Restart

---

## Adaptive Icon (Moderan Android)

Moderni Android uređaji koriste "Adaptive Icons" koji se prilagođavaju različitim oblicima.

### Brz metod:
Koristite `@capacitor/assets` sa dodatnom splash slikom:

```
resources/
├── icon.png           (1024x1024)
└── icon-foreground.png (1024x1024, providna pozadina)
```

Zatim:
```bash
npx capacitor-assets generate --android
```

---

## Saveti za dizajn ikone:

✅ **Radi:**
- Jednostavna, prepoznatljiva grafika
- Kontrastne boje
- Centriran glavni element
- Providna ili jednobojna pozadina

❌ **Ne radi:**
- Sitni detalji (neće se videti)
- Previše boja
- Tanki tekstovi (nečitljivi)
- Kompleksne scene

---

## Primer kompletnog procesa:

```bash
# 1. Instaliraj assets plugin
npm install -D @capacitor/assets

# 2. Napravi folder
mkdir resources

# 3. Stavi icon.png u resources/ folder (1024x1024)

# 4. Generiši ikone
npx capacitor-assets generate --android

# 5. Sinhronizuj
npx cap sync android

# 6. Otvori u Android Studio
npx cap open android

# 7. Pokrenite aplikaciju
```

---

## Pomoć?

Ako vam treba pomoć:
1. Pošaljite mi vašu 1024x1024 ikonu
2. Reći ću vam tačno šta da radite

Ili mogu da vam napravim primer ikone sa grožđem/vinom ako želite! 🍷

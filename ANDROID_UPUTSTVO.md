# Uputstvo za kreiranje Android aplikacije

## Priprema

Potrebno je da instalirate:
1. **Android Studio** - preuzmite sa https://developer.android.com/studio
2. **Java JDK 11 ili noviji** - https://www.oracle.com/java/technologies/downloads/
3. **Node.js** (već imate)

## Koraci

### 1. Build web aplikacije
```bash
npm run build
```

### 2. Dodavanje Android platforme
```bash
npx cap add android
```

### 3. Sinhronizacija
```bash
npx cap sync
```

### 4. Otvaranje u Android Studio
```bash
npx cap open android
```

Ili ručno otvorite folder `android` u Android Studio-u.

### 5. Pokretanje aplikacije

U Android Studio-u:
1. Sačekajte da se Gradle build završi (prvi put može potrajati 5-10 minuta)
2. **Povežite Android telefon preko USB** i omogućite USB debugging:
   - Na telefonu: Settings > About phone > kucnite **7 puta** na "Build number"
   - Zatim: Settings > Developer options > uključite **USB debugging**
   - Kada povežete telefon, pojaviće se poruka - izaberite **"Allow"**
3. **ILI pokrenite Android emulator:**
   - Tools > Device Manager > Create Device
   - Izaberite neki uređaj (npr. Pixel 6)
   - Download sistem image (preporučujem najnoviji Android)
   - Finish i kliknite ▶ play dugme pored emulatora
4. Izaberite uređaj u gornjem meniju Android Studio-a
5. Kliknite na zeleno **▶ Run** dugme (ili pritisnite Shift+F10)

**Aplikacija će se automatski instalirati i pokrenuti na vašem telefonu/emulatoru!** 🎉

### 6. Za buduće izmene koda

Svaki put kada napravite izmene u kodu:
```bash
npm run build
npx cap sync
```
Zatim u Android Studio-u kliknite na zeleno **▶ Run** dugme.

**NAPOMENA:** Ne morate da zatvarate i ponovo otvarate Android Studio!

---

## Promena Ikone i Splash Screen-a

### 📱 PROMENA IKONE APLIKACIJE

**Najlakši metod (PREPORUČENO):**

#### 1. Instalacija
```bash
npm install -D @capacitor/assets
```

#### 2. Kreiranje ikone
- Napravite sliku **1024x1024 piksela** u PNG formatu
- Stavite je u novi folder: `resources/icon.png`

```
vašProjekat/
├── resources/          ← NAPRAVITE OVAJ FOLDER
│   └── icon.png       ← VAŠA IKONA (1024x1024)
└── android/
```

#### 3. Generisanje
```bash
npx capacitor-assets generate --android
```

#### 4. Sinhronizacija i test
```bash
npx cap sync
npx cap open android
```

Pokrenite aplikaciju - ikona je promenjena! ✅

**Detaljnije uputstvo:** Pogledajte `IKONA_UPUTSTVO.md` fajl za više metoda i savete.

---

### 🎨 SPLASH SCREEN (Početni ekran)

Isti proces kao ikona:

1. Napravite sliku **2732x2732px** (PNG)
2. Stavite u: `resources/splash.png`
3. Pokrenite:
```bash
npx capacitor-assets generate --android
npx cap sync
```

---

## Kreiranje APK fajla za instalaciju

Kada želite da podelite aplikaciju sa drugima ili da je instalirate bez Android Studio-a:

### Korak 1: Build Release verzije

U Android Studio-u:
1. **Build** > **Generate Signed Bundle / APK**
2. Izaberite **APK**
3. Kliknite **Next**

### Korak 2: Kreiranje Keystore (prvi put)

Ako nemate keystore:
1. Kliknite **Create new...**
2. Popunite:
   - **Key store path**: izaberite lokaciju (npr. `C:/moj-keystore.jks`)
   - **Password**: napravite šifru (dobro zapamtite!)
   - **Alias**: npr. `wine-app-key`
   - **Alias password**: ista ili različita šifra
   - **Validity**: 25 godina
   - Popunite ostala polja (ime, grad, itd.)
3. **OK**

**VAŽNO:** Sačuvajte keystore fajl i šifre! Bez njih ne možete ažurirati aplikaciju!

### Korak 3: Finish

1. Izaberite **release** build variant
2. ✅ **V1 (Jar Signature)**
3. ✅ **V2 (Full APK Signature)**
4. **Finish**

### Korak 4: Pronađite APK

APK će biti u:
```
android/app/release/app-release.apk
```

Ovaj fajl možete poslati na telefon i instalirati!

---

## Promena Imena Aplikacije

Editujte: `android/app/src/main/res/values/strings.xml`

```xml
<resources>
    <string name="app_name">Ocenjivanje Vina</string>
    <string name="title_activity_main">Ocenjivanje Vina</string>
</resources>
```

Zatim:
```bash
npx cap sync
```

---

## Problemi i Rešenja

### ❌ Gradle greška prilikom build-a
```bash
cd android
./gradlew clean
cd ..
npx cap sync
```

U Android Studio: File > Invalidate Caches > Invalidate and Restart

### ❌ USB debugging ne radi
- Proverite da li ste omogućili Developer options
- Probajte drugi USB kabl
- Na telefonu izaberite "File Transfer" mod
- Restart telefona i računara

### ❌ Aplikacija pada odmah po pokretanju
- Proverite **Logcat** u Android Studio-u (donji panel)
- Greška će biti prikazana u crveno
- Build > Clean Project > Build > Rebuild Project

### ❌ Ikona se nije promenila
```bash
# Obrišite staru aplikaciju sa telefona
# Zatim:
cd android
./gradlew clean
cd ..
npx cap sync
npx cap open android
```

U Android Studio-u: File > Invalidate Caches > Invalidate and Restart

### ❌ "SDK not found" greška
- Otvorite Android Studio
- Tools > SDK Manager
- Instalirajte Android SDK (obično verzija 34 ili novija)
- File > Project Structure > izaberite SDK

---

## Dodatne Informacije

- **Capacitor dokumentacija**: https://capacitorjs.com/docs/android
- **Android Studio vodič**: https://developer.android.com/studio/intro
- **Ionic forum** (za Capacitor pitanja): https://forum.ionicframework.com/

---

## Šta Dalje?

✅ Aplikacija radi na telefonu  
✅ Ikona je promenjena  
✅ Možete praviti APK za deljenje

### Sledeći koraci:
- Dodajte aplikaciju na **Google Play Store** (potreban Google Play Console nalog - $25 jednokratno)
- Dodajte **permissions** ako vam treba (kamera, lokacija, itd.)
- Testirajte na više različitih Android uređaja
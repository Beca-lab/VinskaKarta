# ⚡ Brze Komande - Šta Kada?

## 🆕 Prvi Put - Setup Android

```bash
npm run build
npx cap add android
npx cap sync
npx cap open android
```
_(Zatim u Android Studio kliknite zeleno ▶ dugme)_

---

## ✏️ Napravio Sam Izmene u Kodu

```bash
npm run build
npx cap sync
```
_(Zatim u Android Studio kliknite zeleno ▶ dugme)_

**NAPOMENA:** Ne morate ponovo da otvarate Android Studio!

---

## 🎨 Hoću da Promenim Ikonu

### Metod 1: Automatski (NAJLAKŠI)
```bash
npm install -D @capacitor/assets
mkdir resources
# Stavite icon.png (1024x1024) u resources/
npx capacitor-assets generate --android
npx cap sync
npx cap open android
```

### Metod 2: Online
1. Idite na https://www.appicon.co/
2. Upload vašu 1024x1024 sliku
3. Download Android ikone
4. Kopirajte foldere u `android/app/src/main/res/`
5. Build > Clean Project > Run

---

## 🖼️ Hoću da Dodam Splash Screen

```bash
# Stavite splash.png (2732x2732) u resources/
npx capacitor-assets generate --android
npx cap sync
```

---

## 📦 Hoću APK da Pošaljem Nekome

**U Android Studio:**
1. Build > Generate Signed Bundle / APK
2. APK
3. Next
4. Kreiraj/Izaberi keystore
5. Finish
6. Fajl je u: `android/app/release/app-release.apk`

---

## ❌ Imam Grešku - Quick Fix

### Gradle Greška
```bash
cd android
./gradlew clean
cd ..
npx cap sync
npx cap open android
```

### Ikona se Nije Promenila
```bash
# U Android Studio:
# File > Invalidate Caches > Invalidate and Restart

# ILI:
cd android
./gradlew clean
cd ..
npx cap sync
npx cap open android
```

### App Pada Odmah
1. Otvori Android Studio
2. Pogledaj **Logcat** (donji panel)
3. Traži crvenu grešku
4. Build > Clean Project
5. Build > Rebuild Project

### USB Debugging Ne Radi
1. Na telefonu: Settings > About phone
2. Kucni 7 puta na "Build number"
3. Settings > Developer options > USB debugging ON
4. Ponovo povežite telefon
5. Na telefonu: izaberite "Allow"

---

## 🔄 Svaki Put Kada...

| Šta Sam Uradio? | Komanda |
|-----------------|---------|
| Izmenio sam kod | `npm run build` → `npx cap sync` → ▶ Run |
| Dodao sam paket | `npm install paket-ime` → `npm run build` → `npx cap sync` |
| Promenio ikonu | `npx capacitor-assets generate --android` → `npx cap sync` |
| Imam grešku | `cd android` → `./gradlew clean` → `cd ..` → `npx cap sync` |

---

## 📂 Gde Je Šta?

| Šta Tražim? | Lokacija |
|-------------|----------|
| Moj kod | `/src/app/` |
| Ikona | `/resources/icon.png` (stavite ovde) |
| APK | `/android/app/release/app-release.apk` |
| Android projekat | `/android/` folder |
| Konfiguracija | `/capacitor.config.ts` |

---

## 🎯 Najčešće Korišćene Komande

```bash
# Development (browser)
npm run dev

# Build za Android
npm run build
npx cap sync

# Otvori Android Studio
npx cap open android

# Generiši ikone
npx capacitor-assets generate --android

# Clean build
cd android && ./gradlew clean && cd ..
```

---

## 💡 Pro Saveti

✅ **Uvek prvo** `npm run build` pa onda `npx cap sync`  
✅ **Ne zatvaraj** Android Studio između izmena  
✅ **Sačuvaj keystore** na sigurno mesto (backup!)  
✅ **Test na pravom telefonu** što pre (emulator nije isto)  
✅ **Invalidate Caches** ako nešto čudno ne radi  

❌ **Nemoj** menjati kod direktno u `/android` folderu  
❌ **Nemoj** brisati `android` folder bez razloga  
❌ **Nemoj** zaboraviti keystore šifru  

---

## 🆘 Hitna Pomoć

| Problem | Rešenje |
|---------|---------|
| "Gradle sync failed" | `cd android` → `./gradlew clean` |
| Ikona nije nova | Invalidate Caches + Clean + Rebuild |
| Ne mogu da spojim telefon | Developer Options + USB Debugging |
| App pada | Pogledaj Logcat za grešku |
| Zaboravio sam keystore šifru | 😢 Moraš napraviti novi |

---

## 📞 Treba Mi Još Pomoći?

1. **ANDROID_UPUTSTVO.md** - Detaljno Android uputstvo
2. **IKONA_UPUTSTVO.md** - Sve o ikonama
3. **README.md** - Opšte informacije
4. Google: "capacitor android [tvoj problem]"
5. Stack Overflow

---

**Kopaj dalje - uspećeš! 🍷**

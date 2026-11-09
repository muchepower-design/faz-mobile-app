# Event Verify — Native React Native (JavaScript)

Event Verify is a **bare React Native CLI** application. It does not use Expo or Expo Go. The source is JavaScript (no TypeScript) and UI styling uses **NativeWind (Tailwind CSS for React Native)**. Environment configuration is loaded from `.env` using `react-native-config`.

## Included application features
- Login and secure token storage (Android Keystore / iOS Keychain).
- Device activation and event selection.
- Native camera QR/barcode scanning with Vision Camera.
- On-demand printed-text OCR using ML Kit.
- Manual/pasted code verification.
- SQLite local participant and credential cache.
- Offline check-in recording and pending attendance queue.
- Incremental directory synchronisation; scanner-mounted 60-second polling.
- Dashboard, participant search, attendance history and settings.

## Requirements
- Node.js 18+ (Node 20 LTS recommended).
- Android Studio with Android SDK Platform 35, Build Tools 35, Android SDK Platform Tools.
- JDK 17.
- Gradle 8.10.2 (Android Studio can manage Gradle; `android/gradlew` in this package delegates to a system Gradle installation).
- Physical Android phone or emulator. Camera scanning requires camera permission.

## 1. Configure environment
The project includes a development `.env` file. Edit it before running.

```dotenv
API_BASE_URL=http://10.0.2.2:5000/api/v1
APP_ENV=development
```

- Android emulator: `10.0.2.2` reaches the host computer.
- Physical phone: replace it with the computer's LAN IP, e.g. `http://172.16.1.80:5000/api/v1`, and ensure both devices share the network.
- Production: copy `.env.production.example` to `.env.production` and use an HTTPS API URL.

`react-native-config` reads these values at native build time. Do not put passwords, JWT secrets, database credentials or private keys in `.env`; mobile app configuration is not a secure secret store.

## 2. Install JavaScript dependencies
From the project root in VS Code terminal / PowerShell:

```powershell
npm install
```

## 3. Run on Android
Start Metro in one terminal:

```powershell
npm start
```

In another terminal:

```powershell
npm run android
```

The `android/` directory is the native Android Gradle project. Open `android/` in Android Studio to sync Gradle and build from the IDE.

## 4. Generate APKs
From the project root, with Gradle 8.10.2 available on PATH:

```powershell
cd android
gradle assembleDebug
```

Debug APK output:
`android/app/build/outputs/apk/debug/app-debug.apk`

For a release APK:

```powershell
gradle assembleRelease
```

Release APK output:
`android/app/build/outputs/apk/release/app-release.apk`

A production release must be signed with your own upload/release keystore. Configure signing in `android/app/build.gradle` before distributing the release APK. Do not commit keystore files or passwords.

## 5. Native modules and permissions
The app uses native modules (Vision Camera, ML Kit, SQLite, Keychain/Keystore, and react-native-config). These require a native Android build; they do not run in Expo Go. Camera and internet permissions are declared in `android/app/src/main/AndroidManifest.xml`.

## Tailwind styling
Tailwind classes are provided by NativeWind. Configuration is in `tailwind.config.js`, Babel in `babel.config.js`, and Metro in `metro.config.js`. Global Tailwind directives are in `global.css`. Use `className` on React Native components for styling.

## Backend integration notes
The Flask API must be reachable from the phone. The backend currently requires administrator provisioning for device registration and a separate device token for device sync/attendance endpoints. Provision the event and device in the backend before field use.

## Important operational limitations to validate before production
1. The 60-second sync loop runs while the scanner screen is mounted; Android may suspend the app in the background. It is not a guaranteed background service.
2. Test snapshot download and SQLite throughput using representative event sizes (including hundreds of thousands / million participants). Transactional bulk inserts and indexes may be needed for very large events.
3. Validate the backend response shapes and device provisioning flow against the deployed Flask API before production.
4. Test duplicate scanning across multiple devices. The server must enforce the unique event/participant check-in rule.
5. Configure release signing, HTTPS, privacy disclosures and device testing before distributing APKs.

## Project layout
```text
android/              Native Android Gradle project and APK build output
src/api/              Axios API client (reads API_BASE_URL from .env)
src/components/       Shared UI components (NativeWind classes)
src/database/         SQLite database and repository
src/hooks/            Scanner lifecycle sync hook
src/navigation/       Native stack and bottom-tab navigation
src/screens/          Login, activation, dashboard, scanner, search, attendance, settings
src/services/         Auth, tokens, verification and sync
src/store/            Zustand session store
src/utils/            Credential normalisation and OCR extraction
global.css            Tailwind directives
tailwind.config.js    NativeWind/Tailwind configuration
.env                  Local API configuration (not committed)
```

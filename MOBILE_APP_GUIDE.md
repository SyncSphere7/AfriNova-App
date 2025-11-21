# 📱 AfriNova Mobile App Development Guide

**Build Android & iOS apps with AfriNova's AI-powered mobile code generation**

---

## 🎯 Overview

AfriNova now supports **native mobile app development** with React Native, Flutter, and Ionic. Generate production-ready iOS and Android apps with AI assistance, then build and publish them yourself.

**Supported Frameworks:**
- 📱 **React Native (Expo)** - Recommended for beginners
- 📱 **React Native (CLI)** - Full control, more complex
- 📱 **Flutter** - Google's cross-platform framework
- 📱 **Ionic** - Web technologies for mobile

---

## 🚀 Quick Start (React Native Expo)

### Step 1: Generate Your App on AfriNova

1. Go to **Dashboard → New Project**
2. Select **Frontend: React Native (Expo)**
3. Describe your app: *"E-commerce mobile app with M-Pesa payments"*
4. Click **Generate Code**
5. Download the generated code as ZIP

### Step 2: Set Up Your Development Environment

**Prerequisites:**
- Node.js 18+ installed
- npm or yarn
- iOS Simulator (Mac only) or Android Studio

**Install Expo CLI:**
```bash
npm install -g expo-cli
```

### Step 3: Run Your App Locally

```bash
# Extract downloaded ZIP
unzip afrinova-mobile-app.zip
cd afrinova-mobile-app

# Install dependencies
npm install

# Start development server
npx expo start
```

**Run on device:**
- Install **Expo Go** app (iOS/Android)
- Scan QR code from terminal
- App runs on your phone!

---

## 📦 Building for Production

### React Native (Expo) - Cloud Builds

**iOS Build:**
```bash
# Create iOS build
eas build --platform ios

# Download .ipa file when ready
# Install on device via Xcode or TestFlight
```

**Android Build:**
```bash
# Create Android build
eas build --platform android

# Download .apk file when ready
# Install directly on Android device
```

**Requirements:**
- Expo account (free at expo.dev)
- Apple Developer account ($99/year for iOS)
- Google Play Console account ($25 one-time for Android)

---

## 🏪 Publishing to App Stores

### iOS App Store (Apple)

**Prerequisites:**
1. **Apple Developer Account** ($99/year) at developer.apple.com
2. **App Store Connect** access
3. **iOS build (.ipa file)** from Expo EAS or Xcode

**Steps:**

1. **Create App in App Store Connect:**
   - Go to appstoreconnect.apple.com
   - Click "My Apps" → "+" → "New App"
   - Fill in app details (name, bundle ID, SKU)

2. **Prepare App Metadata:**
   - App description (4000 characters max)
   - Screenshots (5 required sizes):
     - 6.7" iPhone (1290x2796)
     - 6.5" iPhone (1284x2778)
     - 5.5" iPhone (1242x2208)
   - App icon (1024x1024 PNG)
   - Keywords (100 characters)
   - Privacy policy URL (required)

3. **Upload Build:**
   ```bash
   # Using Expo EAS
   eas submit --platform ios
   
   # Or manually via Xcode
   # Open Xcode → Organizer → Upload to App Store
   ```

4. **Submit for Review:**
   - Answer questionnaire (content, privacy, encryption)
   - Submit for review (3-7 days)
   - Monitor status in App Store Connect

**Common Rejection Reasons:**
- Missing privacy policy
- Incomplete app functionality
- Crashes on launch
- Violates App Store guidelines
- Missing age rating

---

### Android Play Store (Google)

**Prerequisites:**
1. **Google Play Console** account ($25 one-time) at play.google.com/console
2. **Android build (.aab or .apk file)** from Expo EAS

**Steps:**

1. **Create App in Play Console:**
   - Click "Create app"
   - Choose app name, default language, app/game type
   - Accept developer program policies

2. **Prepare Store Listing:**
   - App description (4000 characters max)
   - Screenshots (2-8 required):
     - Phone: 1080x1920 or 1080x2340
     - Tablet (optional): 1920x1200
   - Feature graphic (1024x500)
   - App icon (512x512 PNG)
   - Privacy policy URL (required)

3. **Upload Build:**
   ```bash
   # Using Expo EAS
   eas submit --platform android
   
   # Or manually upload .aab file in Play Console
   # Production → Releases → Create new release
   ```

4. **Complete Content Rating:**
   - Fill questionnaire (IARC rating system)
   - Get age rating (E, T, M, etc.)

5. **Publish:**
   - Review and rollout to production
   - App goes live in hours (usually < 3 hours)

**Tips:**
- Use App Bundle (.aab) instead of APK (smaller size, Play Store requirement)
- Enable internal testing track first
- Gradual rollout recommended (10% → 50% → 100%)

---

## 🔧 Development Best Practices

### Environment Variables

**React Native (Expo):**
```bash
# .env.local (not committed to git)
EXPO_PUBLIC_API_URL=https://api.afrinova.com
EXPO_PUBLIC_STRIPE_KEY=pk_test_...
MPESA_CONSUMER_KEY=your_key
```

**Access in code:**
```typescript
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
```

**Security:**
- Prefix public vars with `EXPO_PUBLIC_`
- Keep secrets server-side only
- Never commit `.env.local` to git

---

### Testing on Real Devices

**iOS (Mac required):**
```bash
# Run on iOS Simulator
npx expo start --ios

# Or manually: Xcode → Open Simulator
```

**Android:**
```bash
# Run on Android Emulator
npx expo start --android

# Or connect physical device via USB (enable Developer Mode)
adb devices  # Check device connected
```

---

### Performance Optimization

1. **Image Optimization:**
   ```typescript
   // Use optimized image component
   import { Image } from 'expo-image';
   
   <Image
     source={{ uri: 'https://...' }}
     style={{ width: 300, height: 200 }}
     contentFit="cover"
     cachePolicy="memory-disk"
   />
   ```

2. **List Rendering:**
   ```typescript
   // Use FlatList for large lists
   <FlatList
     data={items}
     renderItem={({ item }) => <Item data={item} />}
     keyExtractor={item => item.id}
     removeClippedSubviews={true}
     maxToRenderPerBatch={10}
   />
   ```

3. **Bundle Size:**
   ```bash
   # Analyze bundle size
   npx expo-doctor
   
   # Remove unused dependencies
   npm prune
   ```

---

## 🌍 Africa-Specific Features

### M-Pesa Integration (Kenya, Tanzania, etc.)

AfriNova generates M-Pesa-ready mobile apps:

```typescript
// Generated by AfriNova
import MpesaSDK from '@mpesa/react-native';

export async function payWithMpesa(phone: string, amount: number) {
  const mpesa = new MpesaSDK({
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  });

  const result = await mpesa.stkPush({
    phoneNumber: phone,
    amount,
    accountReference: 'AfriNova App',
  });

  return result;
}
```

**Setup:**
1. Get M-Pesa API keys from Safaricom Daraja
2. Add to `.env.local`
3. Test in sandbox mode first

---

### Offline-First Architecture

Mobile apps in Africa need offline support:

```typescript
// Generated by AfriNova
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export async function fetchDataWithOffline(url: string) {
  const netInfo = await NetInfo.fetch();
  
  if (netInfo.isConnected) {
    // Online: Fetch from API
    const response = await fetch(url);
    const data = await response.json();
    
    // Cache for offline use
    await AsyncStorage.setItem('cached_data', JSON.stringify(data));
    
    return data;
  } else {
    // Offline: Load from cache
    const cached = await AsyncStorage.getItem('cached_data');
    return cached ? JSON.parse(cached) : null;
  }
}
```

---

## 🐛 Troubleshooting

### Common Issues

**1. "Expo Go not connecting"**
```bash
# Ensure devices on same WiFi
# Restart Expo server
npx expo start --clear

# Use tunnel mode
npx expo start --tunnel
```

**2. "Build failed on EAS"**
```bash
# Check build logs
eas build:list

# Clear cache
eas build --clear-cache --platform ios
```

**3. "App crashes on launch"**
```bash
# Check logs
npx react-native log-android
npx react-native log-ios

# Common fix: Clear cache
rm -rf node_modules
npm install
```

**4. "Cannot find module"**
```bash
# Reset Metro bundler
npx expo start --clear

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Resources

### Official Documentation
- **React Native:** reactnative.dev
- **Expo:** docs.expo.dev
- **Flutter:** flutter.dev
- **Ionic:** ionicframework.com

### App Store Guidelines
- **Apple:** developer.apple.com/app-store/review/guidelines
- **Google:** play.google.com/console/about/guides/releasewithconfidence

### AfriNova Community
- **Discord:** discord.gg/afrinova
- **GitHub:** github.com/SyncSphere7/AfriNova-App
- **Support:** support@afrinova.com

---

## 🎓 Learning Path

**Beginner (Week 1-2):**
1. Generate simple app with AfriNova
2. Run on Expo Go
3. Modify UI components
4. Add basic navigation

**Intermediate (Week 3-4):**
1. Integrate M-Pesa payments
2. Add offline support
3. Implement push notifications
4. Build for TestFlight/Internal Testing

**Advanced (Month 2):**
1. Optimize performance
2. Add analytics
3. Implement CI/CD
4. Publish to production stores

---

## ✨ Next Steps

1. **Generate Your App:** Go to AfriNova Dashboard
2. **Join Community:** Discord/GitHub for help
3. **Ship Fast:** Build → Test → Publish
4. **Iterate:** User feedback → Update → Repeat

**Need help?** Contact support@afrinova.com or join our Discord!

---

**Made with ❤️ by SyncSphere LLC**

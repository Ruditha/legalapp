# 📱 Deployment Guide - Legal Document Analyzer

Complete guide for building and deploying the Legal Document Analyzer app.

## 🚀 Getting APK for Your Phone

### Method 1: EAS Build (Recommended)

This is the easiest and most reliable method for getting an APK.

```bash
# 1. Install EAS CLI
npm install -g @expo/eas-cli

# 2. Navigate to the project directory
cd frontend/public

# 3. Login to Expo (create free account at expo.dev if needed)
eas login

# 4. Configure your project
eas build:configure

# 5. Build APK for development/testing
eas build --platform android --profile development

# 6. Build APK for sharing (optimized)
eas build --platform android --profile preview
```

**What happens:**
- EAS will build your app in the cloud
- You'll get a download link when it's ready
- Download the APK to your computer
- Transfer to your phone via USB, email, or cloud storage
- Install on your phone (enable "Install from unknown sources" in Android settings)

### Method 2: Local Build with Expo CLI

```bash
# 1. Install dependencies
cd frontend/public
npm install

# 2. Build locally (requires Android SDK)
expo build:android --type apk

# 3. Follow the prompts and wait for build completion
# 4. Download APK from the provided URL
```

### Method 3: Development Build (For Testing)

```bash
# 1. Start the development server
cd frontend/public
expo start

# 2. Install Expo Go on your phone
# 3. Scan QR code to run the app
# 4. Perfect for testing during development
```

## 🔧 Pre-Build Setup

### 1. Update App Configuration

Edit `frontend/public/app.json`:

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "version": "1.0.0",
    "android": {
      "package": "com.yourcompany.yourapp"
    }
  }
}
```

### 2. Add App Icons

Create these files in `frontend/public/assets/`:
- `icon.png` (1024x1024) - Main app icon
- `adaptive-icon.png` (1024x1024) - Android adaptive icon
- `splash.png` - Splash screen image

### 3. Configure Build Settings

Update `frontend/public/eas.json` for custom build configurations.

## 📦 Build Types Explained

### Development APK
- **Purpose**: Testing and development
- **Features**: Includes debugging tools, larger file size
- **Command**: `eas build --platform android --profile development`

### Preview APK  
- **Purpose**: Sharing with testers, demo purposes
- **Features**: Optimized but not for store submission
- **Command**: `eas build --platform android --profile preview`

### Production AAB
- **Purpose**: Google Play Store submission
- **Features**: Highly optimized, smaller download size
- **Command**: `eas build --platform android --profile production`

## 🏪 App Store Deployment

### Google Play Store

1. **Prepare Release**:
   ```bash
   eas build --platform android --profile production
   ```

2. **Create Play Console Account**: 
   - Go to [Google Play Console](https://play.google.com/console)
   - Pay $25 one-time registration fee

3. **Upload & Configure**:
   - Upload your AAB file
   - Add store listing details
   - Set content rating
   - Submit for review

### Apple App Store (iOS)

1. **Build for iOS**:
   ```bash
   eas build --platform ios --profile production
   ```

2. **Apple Developer Account**:
   - Enroll in [Apple Developer Program](https://developer.apple.com) ($99/year)

3. **Submit via App Store Connect**:
   - Upload IPA file
   - Configure app metadata
   - Submit for review

## ���� Web Deployment

### Build Web Version
```bash
cd frontend/public
npm run build
```

### Deploy to Hosting Services

#### Netlify
```bash
# 1. Build the project
npm run build

# 2. Install Netlify CLI
npm install -g netlify-cli

# 3. Deploy
netlify deploy --prod --dir=dist
```

#### Vercel
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel --prod
```

#### Firebase Hosting
```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Initialize Firebase
firebase init hosting

# 3. Deploy
firebase deploy
```

## 🔍 Troubleshooting Build Issues

### Common Problems & Solutions

**1. Build Fails with Dependencies Error**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
expo install --fix
```

**2. Android Build Issues**
```bash
# Check for Android SDK issues
expo doctor
eas build:inspect --platform android
```

**3. Assets Not Found**
- Ensure all required assets exist in `assets/` folder
- Check file names match exactly what's in `app.json`
- Verify asset dimensions are correct

**4. Bundle Size Too Large**
```bash
# Analyze bundle size
npx expo-bundle-analyzer

# Optimize by removing unused dependencies
npm uninstall [unused-package]
```

## 📊 Build Optimization

### Reduce APK Size
1. **Remove unused dependencies**
2. **Optimize images** (use WebP format when possible)
3. **Enable proguard** (for Android)
4. **Use dynamic imports** for large libraries

### Performance Optimization
1. **Enable Hermes** (JavaScript engine for React Native)
2. **Optimize images** with proper compression
3. **Implement lazy loading** for screens
4. **Use production builds** for final deployment

## 🔐 Security for Production

### Environment Variables
```bash
# Never commit sensitive data
# Use EAS secrets for production
eas secret:create --scope project --name API_KEY --value your-api-key
```

### Code Signing
- **Android**: Automatic with EAS Build
- **iOS**: Requires Apple Developer certificates

## 📈 Analytics & Monitoring

### Add Crash Reporting
```bash
# Install Sentry for error tracking
expo install @sentry/react-native
```

### Performance Monitoring
```bash
# Install analytics
expo install expo-analytics-amplitude
```

## 🎯 Testing Strategy

### Testing Methods
1. **Development build** - Internal testing
2. **Preview build** - Beta testing with users
3. **Production build** - Final release testing

### Testing Checklist
- ✅ Camera functionality works
- ✅ Image upload and analysis
- ✅ Navigation between screens
- ✅ Settings persist correctly
- ✅ App doesn't crash on various devices
- ✅ Performance is acceptable

## 📞 Support

### Getting Help
1. **Expo Documentation**: [docs.expo.dev](https://docs.expo.dev)
2. **EAS Build Docs**: [docs.expo.dev/build](https://docs.expo.dev/build/introduction/)
3. **Community Forums**: [forums.expo.dev](https://forums.expo.dev)
4. **Discord**: Expo Community Discord

### Common Commands Reference
```bash
# Check project health
expo doctor

# Clear Metro cache
expo start --clear

# Update Expo SDK
expo upgrade

# View build logs
eas build:list

# Download build
eas build:download [BUILD_ID]
```

---

**🎉 Congratulations!** 

Your Legal Document Analyzer is now ready for deployment. The app includes:
- ✅ Professional UI with multiple screens
- ✅ AI-powered document analysis
- ✅ Document history tracking
- ✅ Advanced settings and features
- ✅ Mobile-optimized experience
- ✅ Ready for app store submission

**Next Steps:**
1. Build your APK using Method 1 above
2. Test thoroughly on real devices
3. Consider adding your own AI API keys for production
4. Submit to app stores when ready

Happy deploying! 🚀

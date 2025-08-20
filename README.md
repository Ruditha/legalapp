# Legal Document Analyzer 📄⚖️

A powerful AI-powered mobile application for analyzing legal documents, extracting key points, and providing comprehensive summaries. Built with React Native (Expo) and AI integration.

## 🚀 Features

- 📱 **Mobile-First Design**: Native mobile experience with responsive web support
- 🤖 **AI-Powered Analysis**: Advanced document analysis using Google Gemini API and local BART+BERT models
- 📄 **Document Upload**: Camera capture and gallery selection
- 🔍 **Key Point Extraction**: Identifies critical dates, obligations, penalties, and terms
- 📊 **Document History**: Track and manage analyzed documents
- 🏛️ **Legal Compliance**: Specialized for legal document analysis
- 💾 **Offline Support**: Demo mode for offline usage
- 🔒 **Secure Processing**: Local and cloud-based analysis options

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Expo CLI** - Install globally: `npm install -g expo-cli`
- **Python 3.8+** (for backend AI processing) - [Download here](https://python.org/)
- **Git** - [Download here](https://git-scm.com/)

### For Mobile Development:
- **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- **Android Studio** (for Android APK builds)
- **Xcode** (for iOS builds - macOS only)

## 📱 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd legal-document-analyzer
```

### 2. Install Dependencies
```bash
# Navigate to frontend directory
cd frontend/public

# Install dependencies
npm install

# Install Expo CLI globally if not already installed
npm install -g expo-cli
```

### 3. Start the Development Server
```bash
# Start the web development server
npm run web-dev

# OR start Expo development server for mobile
expo start
```

### 4. Access the Application

#### Web Version:
- Open your browser and go to `http://localhost:19009`

#### Mobile Version:
1. Install **Expo Go** on your phone
2. Scan the QR code displayed in your terminal/browser
3. The app will load on your device

## 🏗️ Building for Production

### Web Build
```bash
cd frontend/public
npm run build
```

### Mobile APK (Android)
```bash
# Build for Android
expo build:android

# OR using EAS Build (recommended)
npm install -g @expo/eas-cli
eas build --platform android
```

### iOS Build
```bash
# Build for iOS (macOS only)
expo build:ios

# OR using EAS Build
eas build --platform ios
```

## 🔧 Backend Setup (Optional - for Real AI Analysis)

The app works in demo mode by default. For real AI analysis:

### Python Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env file with your API keys

# Start the backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Environment Variables
Create a `.env` file in the backend directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

## 📁 Project Structure

```
legal-document-analyzer/
├── frontend/
│   ├── public/
│   │   ├── components/
│   │   │   ├── HomeScreen.js          # Main dashboard
│   │   │   ├── AnalysisScreen.js      # Document analysis
│   │   │   ├── HistoryScreen.js       # Document history
│   │   │   └── SettingsScreen.js      # App settings
│   │   ├── App.js                     # Main app component
│   │   ├── package.json
│   │   └── webpack.config.simple.js
│   └── assets/                        # Images and assets
├── backend/
│   ├── main.py                        # FastAPI backend
│   ├── requirements.txt               # Python dependencies
│   └── models/                        # AI models
├── README.md
└── app.json                          # Expo configuration
```

## 📱 Getting APK for Your Phone

### Method 1: Expo Build Service (Recommended)
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure the build
eas build:configure

# Build APK
eas build --platform android --profile development
```

### Method 2: Direct APK Build
```bash
# Generate APK
expo build:android -t apk

# Download APK from the provided URL
# Transfer to your phone and install
```

### Method 3: Development Build
```bash
# For testing during development
expo install expo-dev-client
expo run:android
```

## 🔍 Key Features Explained

### Document Analysis
- **Smart OCR**: Extracts text from images and PDFs
- **AI Processing**: Uses advanced NLP models for analysis
- **Key Point Detection**: Identifies:
  - Critical dates and deadlines
  - Financial obligations and penalties
  - Party responsibilities
  - Termination clauses
  - Risk factors

### Example Key Points Output:
- 💰 **Payment Due**: Payment of $50,000 must be completed by January 1, 2025
- ⚠️ **Penalty Clause**: Late payment incurs 5% monthly penalty
- 🏠 **Collateral Risk**: Property ownership transfers to John Smith if payment defaults
- 📅 **Contract Term**: Agreement valid until December 31, 2025
- 🔄 **Renewal Option**: Auto-renewal unless 30-day notice provided

## 🛠️ Troubleshooting

### Common Issues:

**1. Metro bundler issues:**
```bash
npx expo start --clear
```

**2. Dependency conflicts:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**3. Build errors:**
```bash
expo doctor
expo install --fix
```

**4. Backend connection issues:**
- Ensure backend is running on port 8000
- Check firewall settings
- Verify API keys in .env file

## 🔐 Security Notes

- API keys should never be committed to version control
- Use environment variables for sensitive configuration
- Enable HTTPS in production
- Implement proper authentication for production use

## 📈 Performance Optimization

- Images are automatically compressed
- Lazy loading for better performance
- Efficient state management
- Optimized bundle size

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the Expo documentation

## 🚀 Deployment

### Web Deployment
```bash
# Build the project
npm run build

# Deploy to your preferred hosting service
# (Netlify, Vercel, Firebase Hosting, etc.)
```

### Mobile App Store Deployment
1. Build production APK/IPA
2. Follow platform-specific store guidelines
3. Submit for review

---

**Made with ❤️ for legal professionals and document analysis**

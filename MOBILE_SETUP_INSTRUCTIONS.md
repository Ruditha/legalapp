# 📱 Legal Document Analyzer - Mobile Setup Instructions

## 🎯 Get Your Real AI Legal App Running on Your Phone

Follow these simple steps to get the **Legal Document Analyzer** with real Gemini AI working on your mobile device.

---

## 📥 **STEP 1: Download and Setup**

### After downloading the Builder.io project folder:

1. **Extract the downloaded folder** to your computer
2. **Open Command Prompt/Terminal** in the extracted folder
3. **Choose your setup method:**

#### **🪟 Windows Users:**
```cmd
setup-mobile.bat
```

#### **🐧 Linux/Mac Users:**
```bash
chmod +x setup-mobile.sh
./setup-mobile.sh
```

#### **📝 Manual Setup (if scripts don't work):**
```bash
cd frontend/public
npm install
npm run web-dev
```

---

## 🔑 **STEP 2: Get Real AI Working (IMPORTANT)**

### **Get Your Gemini API Key:**
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account  
3. Click "Create API Key"
4. Copy the key (starts with "AIza...")

### **Configure Backend:**
1. **Open** `backend/.env` file
2. **Replace** this line:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
3. **With your real key:**
   ```
   GEMINI_API_KEY=AIzaSyC-your-actual-api-key-here
   ```

### **Start the Backend:**
```bash
# Open new terminal window
cd backend
pip install -r requirements.txt
python main.py
```

---

## 📱 **STEP 3: Access on Your Phone**

### **Find Your Computer's IP Address:**

#### **Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter (usually 192.168.1.X or 10.0.0.X)

#### **Mac/Linux:**
```bash
ifconfig | grep inet
```

### **Connect from Phone:**
1. **Make sure** your phone and computer are on the **same WiFi network**
2. **Open browser** on your phone
3. **Go to:** `http://YOUR_COMPUTER_IP:19009`
   - Example: `http://192.168.1.100:19009`
   - Example: `http://10.0.0.105:19009`

---

## 📲 **STEP 4: Install as Mobile App (PWA)**

### **For Best Mobile Experience:**
1. **Open the app** in your phone's browser
2. **Tap browser menu** (three dots ⋮)
3. **Select "Add to Home Screen"** or "Install App"
4. **App appears** on your home screen like a native app!

### **Mobile Features You'll Get:**
- ✅ **Native camera access** for document photos
- ✅ **Real AI analysis** with Gemini API
- ✅ **Offline capabilities** after first load
- ✅ **Full-screen experience** without browser bars
- ✅ **Push notifications** (if enabled)

---

## 🤖 **STEP 5: Using Real AI Analysis**

### **To Get Real AI (Not Demo):**
1. **Upload/Take photo** of legal document
2. **Select "🤖 Gemini API"** (NOT "🧠 BART + BERT")
3. **Wait 5-10 seconds** for real analysis
4. **Get professional legal insights!**

### **What Real AI Provides:**
- 📄 **OCR Text Extraction** from document images
- ⚖️ **Legal Contract Analysis** with key points
- 💰 **Financial Terms** and payment obligations
- 📅 **Important Dates** and deadlines
- ⚠️ **Risk Assessment** and warnings
- 📋 **Plain English Summary** for non-lawyers

---

## 🔧 **Troubleshooting**

### **❌ If App Won't Load:**
- Check your computer and phone are on same WiFi
- Try `http://localhost:19009` if testing on same computer
- Restart the dev server: `Ctrl+C` then `npm run web-dev`

### **❌ If Getting Demo Mode:**
- Make sure backend is running: `python main.py`
- Check API key is set correctly in `.env` file
- Select "🤖 Gemini API" not "🧠 BART + BERT"

### **❌ If Camera Won't Work:**
- Make sure you're using HTTPS or localhost
- Grant camera permissions when prompted
- Try refreshing the page

### **❌ If Dependencies Fail:**
- Install Node.js from: https://nodejs.org/
- Install Python from: https://python.org/
- Run `npm install` again

---

## 🎉 **Final Result**

You'll have a **professional-grade legal document analyzer** on your phone that:

- 📱 **Works like a native app** (PWA)
- 🤖 **Uses real Google Gemini AI** for analysis
- 📸 **Has full camera integration** for document capture
- ⚖️ **Provides expert legal insights** for contracts, agreements, etc.
- 🌐 **Works offline** after initial load
- 🔒 **Keeps your documents private** (processed locally)

Perfect for helping anyone understand complex legal documents! 📱⚖️✨

---

## 🆘 **Need Help?**

If you encounter any issues:
1. Check the `TROUBLESHOOTING.md` file
2. Make sure all steps were followed exactly
3. Verify your internet connection
4. Try restarting both frontend and backend servers

**Happy Legal Document Analysis!** 🎊

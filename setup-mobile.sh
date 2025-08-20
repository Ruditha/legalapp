#!/bin/bash

echo "================================================="
echo "     LEGAL DOCUMENT ANALYZER - MOBILE SETUP"
echo "================================================="
echo

echo "Step 1: Installing dependencies..."
cd frontend/public
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo
echo "Step 2: Getting your computer's IP address..."
# Try to get IP address automatically
IP_ADDRESS=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+' || hostname -I | awk '{print $1}' || echo "UNABLE_TO_DETECT")

echo
echo "================================================="
echo "          MOBILE ACCESS INSTRUCTIONS"
echo "================================================="
echo
echo "1. Make sure your phone and computer are on the same WiFi network"
echo
if [ "$IP_ADDRESS" != "UNABLE_TO_DETECT" ]; then
    echo "2. On your phone's browser, go to: http://$IP_ADDRESS:19009"
else
    echo "2. Find your computer's IP address and go to: http://YOUR_IP:19009"
    echo "   Common IP formats: 192.168.1.X or 10.0.0.X"
fi
echo
echo "3. For best experience, tap 'Add to Home Screen' in your browser"
echo "   to install as a PWA (Progressive Web App)"
echo
echo "4. The app will have real camera access and AI analysis!"
echo
echo "================================================="
echo "Starting the development server..."
echo "================================================="

npm run web-dev

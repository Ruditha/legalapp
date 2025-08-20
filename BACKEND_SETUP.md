# Backend Setup Instructions

## Current Status
The app is currently running in **Demo Mode** for reliability and immediate functionality.

## To Enable Real Backend Analysis

### Option 1: Start Demo Backend (Recommended for testing)
```bash
cd frontend/public
node demo-backend.js
```

### Option 2: Start Python Backend (For real AI analysis)
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Option 3: Enable Backend Connection in Code
In `frontend/public/components/StructuredAnalysisScreen.js`, uncomment the backend connection code in the `processDocument` function (around line 40-90).

## Backend Health Check
The app will automatically detect when a backend is available at:
- `http://localhost:8000/health` (for local development)
- Or the appropriate network URL for your environment

## Demo Mode Features
- Professional sample legal document analysis
- All UI features functional
- No external dependencies
- Reliable for demonstrations and testing

## Production Considerations
For production deployment:
1. Set up proper backend infrastructure
2. Configure environment variables
3. Enable HTTPS
4. Implement proper authentication
5. Add rate limiting

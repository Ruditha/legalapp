// Simple demo backend for testing when main backend is not available
// This can be run with: node demo-backend.js

const http = require('http');
const url = require('url');

const PORT = 8000;

// Demo legal analysis responses
const demoResponses = [
  {
    summary: "🏦 LOAN AGREEMENT ANALYSIS: This is a secured personal loan agreement between the borrower and John Smith (lender) with significant risk factors. The loan involves property collateral with strict payment terms and severe default consequences. Critical attention required for payment deadlines and collateral protection clauses.",
    key_points: [
      "💰 CRITICAL: $50,000 loan amount must be paid in full by January 1, 2025",
      "⚠️ HIGH RISK: Property ownership (123 Main Street) automatically transfers to John Smith if payment is missed",
      "📅 Monthly payments: $2,200 due by 15th of each month, starting February 2024",
      "💸 Late payment penalty: 5% of monthly payment amount for each day past due",
      "🏠 Collateral at risk: Primary residence deed held as security by lender",
      "⚖️ No grace period: Default triggers immediate foreclosure proceedings",
      "📞 Notice requirement: 10-day written notice before default declaration",
      "💼 Legal fees: Borrower responsible for all collection and legal costs"
    ],
    metadata: {
      ai_model_selected: "demo",
      processing_method: "Demo Analysis"
    }
  },
  {
    summary: "🏠 RENTAL AGREEMENT ANALYSIS: Standard residential lease with typical landlord-favorable terms. Contains some tenant-protective clauses but includes several financial obligations and restrictions. Moderate risk level with clear payment and occupancy requirements.",
    key_points: [
      "💰 Monthly rent: $2,500 due by 1st of each month (late fee applies after 5th)",
      "💸 Security deposit: $5,000 due at signing (refundable with conditions)",
      "📅 Lease term: 12 months ending December 31, 2024 (auto-renewal clause)",
      "⚠️ Late fee: $100 charged for payments received after 5th of month",
      "🚫 Pet restriction: No pets allowed without written landlord consent and $500 pet deposit",
      "🔧 Maintenance: Tenant responsible for repairs under $200 per incident",
      "📞 Notice period: 30 days required for lease termination by either party",
      "🏠 Occupancy limit: Maximum 2 adults, children under 18 permitted"
    ],
    metadata: {
      ai_model_selected: "demo",
      processing_method: "Demo Analysis"
    }
  }
];

const server = http.createServer((req, res) => {
  // Set CORS headers to allow frontend access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  console.log(`${new Date().toISOString()} - ${req.method} ${path}`);

  // Health check endpoint
  if (path === '/health' && req.method === 'GET') {
    const healthResponse = {
      status: "healthy",
      message: "Demo Legal Awareness App Backend is running",
      llm_available: false,
      version: "demo-1.0.0"
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(healthResponse));
    return;
  }

  // Document processing endpoint
  if (path === '/process_document' && req.method === 'POST') {
    // Parse multipart data (simplified for demo)
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      // Simulate processing time
      setTimeout(() => {
        // Return a random demo response
        const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
        
        console.log('Returning demo analysis response');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(randomResponse));
      }, 2000); // 2 second delay to simulate AI processing
    });
    return;
  }

  // 404 for unknown endpoints
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    error: 'Endpoint not found',
    available_endpoints: [
      'GET /health',
      'POST /process_document'
    ]
  }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Demo Legal Awareness Backend running on http://localhost:${PORT}`);
  console.log('📊 Available endpoints:');
  console.log('  GET  /health - Health check');
  console.log('  POST /process_document - Process uploaded document (demo responses)');
  console.log('');
  console.log('🎭 This is a demo backend providing sample legal analysis responses');
  console.log('⚠️  For real AI analysis, use the Python FastAPI backend instead');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
});

// Handle server errors gracefully
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please stop the other server first or use a different port.`);
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down demo backend server...');
  server.close(() => {
    console.log('✅ Demo backend server stopped successfully');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Demo backend server stopped successfully');
    process.exit(0);
  });
});

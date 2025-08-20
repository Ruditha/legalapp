const http = require('http');
const url = require('url');
const querystring = require('querystring');

const PORT = 8000;

// Mock responses for demo purposes
const mockResponse = {
  summary: "This is a mock legal document summary generated for demo purposes. The document appears to be a standard service agreement with the following key elements: Terms of service, payment obligations, liability limitations, and termination clauses. Please review all sections carefully before signing.",
  key_points: [
    "Service term: 12 months with automatic renewal",
    "Payment due within 30 days of invoice date",
    "Liability limited to the amount paid in the previous 12 months", 
    "Either party may terminate with 30 days written notice",
    "Confidentiality obligations survive termination",
    "Dispute resolution through binding arbitration",
    "Intellectual property rights remain with respective owners"
  ]
};

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url);
  const path = parsedUrl.pathname;

  console.log(`${req.method} ${path}`);

  if (path === '/process_document' && req.method === 'POST') {
    // Simulate processing time
    setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(mockResponse));
    }, 2000); // 2 second delay to simulate processing
  } else if (path === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'Mock backend server is running' }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Mock backend server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST /process_document - Process uploaded document');
  console.log('  GET /health - Health check');
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down mock server...');
  server.close(() => {
    console.log('Mock server stopped');
    process.exit(0);
  });
});

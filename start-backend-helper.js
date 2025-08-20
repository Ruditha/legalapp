// Helper script to start demo backend
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Attempting to start demo backend...');

const backendPath = path.join(__dirname, 'frontend', 'public');
const nodeProcess = spawn('node', ['demo-backend.js'], {
  cwd: backendPath,
  stdio: 'inherit'
});

nodeProcess.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
});

nodeProcess.on('error', (err) => {
  console.error('Failed to start backend:', err);
});

console.log('Backend startup initiated. Check for success messages...');

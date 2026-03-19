#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const HOST = '0.0.0.0';

// MIME types for different file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Simple static file server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Handle health check endpoints first
  if (req.url === '/health' || req.url === '/ping') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'dewclaw-dashboard'
    }));
    return;
  }
  
  let filePath = req.url === '/' ? '/index.html' : req.url;
  
  // Remove query parameters
  filePath = filePath.split('?')[0];
  
  // Security: prevent directory traversal
  if (filePath.includes('..')) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }
  
  const fullPath = path.join(__dirname, filePath);
  
  // Check if file exists
  fs.access(fullPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.log(`File not found: ${fullPath}`);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    
    // Get file stats
    fs.stat(fullPath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
      
      // Determine MIME type
      const ext = path.extname(fullPath).toLowerCase();
      const mimeType = mimeTypes[ext] || 'application/octet-stream';
      
      // Set headers
      res.writeHead(200, {
        'Content-Type': mimeType,
        'Content-Length': stats.size,
        'Cache-Control': 'public, max-age=300', // 5 minute cache
        'X-Powered-By': 'DewClaw Dashboard'
      });
      
      // Stream the file
      const readStream = fs.createReadStream(fullPath);
      readStream.pipe(res);
      
      readStream.on('error', (err) => {
        console.error(`Error reading file ${fullPath}:`, err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      });
    });
  });
});

// Error handling
server.on('error', (err) => {
  console.error('Server error:', err);
});

// Start server
server.listen(PORT, HOST, () => {
  console.log('🎯 DewClaw Project Dashboard starting...');
  console.log(`📊 Server running at http://${HOST}:${PORT}/`);
  console.log(`🔗 Access dashboard: http://localhost:${PORT}`);
  console.log(`⚡ Auto-refresh: 30s interval`);
  console.log(`🔄 GitHub API integration: ${process.env.GITHUB_TOKEN ? 'Enabled' : 'Mock data'}`);
  console.log('');
  console.log('Features:');
  console.log('  📋 Real-time GitHub Issues sync');
  console.log('  🎯 Visual Kanban board');
  console.log('  📊 Performance metrics');
  console.log('  🚀 One-click actions');
  console.log('  💰 Cost tracking');
  console.log('');
  console.log('Press Ctrl+C to stop');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down dashboard server...');
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down...');
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
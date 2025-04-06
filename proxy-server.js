const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Proxy middleware configuration
const proxyOptions = {
  target: 'https://perfectcv-production.up.railway.app',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api/v1', // rewrite path
  },
  onProxyRes: function(proxyRes, req, res) {
    // Log proxy responses
    console.log(`Proxying ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
  },
  onError: function(err, req, res) {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error: ' + err.message);
  }
};

// Use the proxy for /api routes
app.use('/api', createProxyMiddleware(proxyOptions));

// Serve the test_login.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'test_login.html'));
});

// Serve the test_register.html file
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'test_register.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
  console.log(`Test login page available at http://localhost:${PORT}/test_login.html`);
  console.log(`Test register page available at http://localhost:${PORT}/register`);
}); 
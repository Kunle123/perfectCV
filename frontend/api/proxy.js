// Simplified server-side proxy that handles path normalization
// This focuses solely on fixing path duplication issues

export default async function handler(req, res) {
  // Get the path and query parameters
  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : path || '';
  
  // Log the original request for debugging
  console.log('Original request path:', apiPath);
  
  // Fix path duplication - this is the critical part
  let normalizedPath = apiPath;
  
  // Handle /api/api/v1/ pattern (double api)
  if (normalizedPath.includes('api/api/v1/')) {
    normalizedPath = normalizedPath.replace('api/api/v1/', '');
    console.log('Fixed double api/v1 path:', normalizedPath);
  }
  // Handle /api/v1/api/v1/ pattern (completely duplicated path)
  else if (normalizedPath.includes('api/v1/api/v1/')) {
    normalizedPath = normalizedPath.replace('api/v1/api/v1/', '');
    console.log('Fixed completely duplicated path:', normalizedPath);
  }
  // Handle /api/v1/ prefix if present
  else if (normalizedPath.startsWith('api/v1/')) {
    normalizedPath = normalizedPath.replace('api/v1/', '');
    console.log('Removed api/v1/ prefix:', normalizedPath);
  }
  // Handle /api/ prefix if present
  else if (normalizedPath.startsWith('api/')) {
    normalizedPath = normalizedPath.replace('api/', '');
    console.log('Removed api/ prefix:', normalizedPath);
  }
  
  // Construct the final URL to Railway
  const url = `https://perfectcv-production.up.railway.app/api/v1/${normalizedPath}`;
  console.log('Forwarding to:', url) ;
  
  // Copy all headers except host
  const headers = { ...req.headers };
  delete headers.host;
  
  try {
    // Handle different HTTP methods
    let fetchOptions = {
      method: req.method,
      headers,
    };
    
    // Add body for non-GET/HEAD requests
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }
    
    // Forward the request to Railway
    const response = await fetch(url, fetchOptions);
    
    // Log the response status
    console.log('Response status:', response.status);
    
    // Copy response headers
    for (const [key, value] of Object.entries(Object.fromEntries(response.headers.entries()))) {
      res.setHeader(key, value);
    }
    
    // Handle response based on content type
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      // JSON response
      const data = await response.json();
      res.status(response.status).json(data);
    } else if (contentType.includes('text/')) {
      // Text response
      const text = await response.text();
      res.status(response.status).send(text);
    } else {
      // Binary response (PDF, images, etc.)
      const buffer = await response.arrayBuffer();
      res.status(response.status)
         .setHeader('Content-Type', contentType)
         .send(Buffer.from(buffer));
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to proxy request',
      message: error.message,
      originalPath: apiPath,
      normalizedPath: normalizedPath
    });
  }
}


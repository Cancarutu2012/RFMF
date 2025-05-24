// Simple CORS proxy for audio streams
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/stream', async (req, res) => {
  const url = req.query.url;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  try {
    const response = await axios({
      method: 'get',
      url,
      responseType: 'stream'
    });
    
    // Set headers from original response
    Object.keys(response.headers).forEach(header => {
      res.setHeader(header, response.headers[header]);
    });
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    // Pipe the stream response
    response.data.pipe(res);
  } catch (error) {
    console.error('Error proxying stream:', error);
    res.status(500).json({ error: 'Failed to proxy stream' });
  }
});

module.exports = router;
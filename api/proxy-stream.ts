import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const url = req.query.url as string;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  console.log('Proxying stream from:', url);
  
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
    
    // Pipe the stream response
    response.data.pipe(res);
  } catch (error) {
    console.error('Error proxying stream:', error);
    return res.status(500).json({ error: 'Failed to proxy stream' });
  }
}
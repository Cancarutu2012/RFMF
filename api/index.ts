import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// Serverless function for stream info
export async function streamInfo(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Fetch metadata from the status-json.xsl
    const metadataResponse = await axios.get('http://katolikusradio.hu:9000/status-json.xsl');
    const metadata = metadataResponse.data;
    
    // Find the RadetzkyFM station data
    const sources = metadata.icestats.source;
    let radetzkyfmData = null;
    
    if (Array.isArray(sources)) {
      radetzkyfmData = sources.find((source: any) => 
        source.server_name === 'RadetzkyFM' || 
        source.listenurl?.includes('radetzkyfm')
      );
    } else if (sources && (sources.server_name === 'RadetzkyFM' || sources.listenurl?.includes('radetzkyfm'))) {
      radetzkyfmData = sources;
    }
    
    console.log('Found station data:', radetzkyfmData ? 'yes' : 'no');
    
    if (radetzkyfmData) {
      return res.status(200).json({
        streamUrl: 'http://katolikusradio.hu:9000/radetzkyfm',
        stationName: radetzkyfmData.server_name || 'RadetzkyFM',
        description: radetzkyfmData.server_description || 'Catholic Radio Stream',
        currentTrack: radetzkyfmData.title || 'Unknown Track',
        bitrate: radetzkyfmData.bitrate || 96,
        genre: radetzkyfmData.genre || 'Music',
        listeners: radetzkyfmData.listeners || 0,
        serverType: radetzkyfmData.server_type || 'audio/aac'
      });
    } else {
      // Fallback if we can't find the specific station data
      return res.status(200).json({
        streamUrl: 'http://katolikusradio.hu:9000/radetzkyfm',
        stationName: 'RadetzkyFM',
        description: 'Catholic Radio Stream',
        currentTrack: 'Unknown Track',
        bitrate: 96,
        genre: 'Music'
      });
    }
  } catch (error) {
    console.error('Error fetching stream metadata:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch stream metadata',
      streamUrl: 'http://katolikusradio.hu:9000/radetzkyfm',
      stationName: 'RadetzkyFM',
      description: 'Catholic Radio Stream'
    });
  }
}

// Serverless function for proxy stream
export async function proxyStream(req: VercelRequest, res: VercelResponse) {
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

// Health check endpoint
export async function health(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({ status: 'ok' });
}

// Default export for backwards compatibility
export default async (req: VercelRequest, res: VercelResponse) => {
  const path = req.url?.split('?')[0];
  
  if (path === '/api/stream-info') {
    return streamInfo(req, res);
  } else if (path === '/api/proxy-stream') {
    return proxyStream(req, res);
  } else if (path === '/api/health') {
    return health(req, res);
  } else {
    return res.status(404).json({ error: 'Not found' });
  }
};
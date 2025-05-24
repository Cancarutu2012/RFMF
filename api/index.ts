import express, { type Request, Response, NextFunction } from "express";
import axios from 'axios';
import path from 'path';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS middleware for Vercel deployment
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Stream info endpoint with real-time metadata
app.get('/api/stream-info', async (req, res) => {
  try {
    // Fetch metadata from the status-json.xsl
    const metadataResponse = await axios.get('http://katolikusradio.hu:9000/status-json.xsl');
    const metadata = metadataResponse.data;
    
    // Find the RadetzkyFM station data
    const sources = metadata.icestats.source;
    let radetzkyfmData = null;
    
    if (Array.isArray(sources)) {
      radetzkyfmData = sources.find(source => 
        source.server_name === 'RadetzkyFM' || 
        source.listenurl?.includes('radetzkyfm')
      );
    } else if (sources && (sources.server_name === 'RadetzkyFM' || sources.listenurl?.includes('radetzkyfm'))) {
      radetzkyfmData = sources;
    }
    
    if (radetzkyfmData) {
      res.json({
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
      res.json({
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
    res.status(500).json({ 
      error: 'Failed to fetch stream metadata',
      streamUrl: 'http://katolikusradio.hu:9000/radetzkyfm',
      stationName: 'RadetzkyFM',
      description: 'Catholic Radio Stream'
    });
  }
});

// Proxy endpoint for audio stream
app.get('/api/proxy-stream', async (req: Request, res: Response) => {
  const url = req.query.url as string;
  
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless function
export default app;
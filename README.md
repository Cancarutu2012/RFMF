# RadetzkyFM Radio Player

A beautiful audio streaming application for katolikusradio.hu with engaging visualizations and a modern interface.

## Features

- Audio streaming with play/pause controls
- Volume control with mute functionality
- Real-time track metadata from the station
- Beautiful audio visualizations
- Mobile-friendly responsive design
- Stream information display (bitrate, genre, listeners)

## Deployment

### Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```
   
   For Windows users:
   ```
   set HOST=localhost
   set PORT=3000
   set NODE_ENV=development
   npx tsx server/index.ts
   ```

3. Open [http://localhost:5000](http://localhost:5000) in your browser (or port 3000 for Windows).

### Deploying to Vercel

1. Push this repository to GitHub.

2. Connect the repository to Vercel and deploy it.

3. The application will be automatically deployed and available at your Vercel URL.

## Technologies Used

- React with TypeScript
- Tailwind CSS
- Web Audio API for visualizations
- Express.js for backend API
- Axios for data fetching

## License

MIT
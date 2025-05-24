@echo off
echo Starting RadetzkyFM Radio Player...
echo.
echo Note: Please make sure you have run "npm install" first
echo.

REM Set the HOST to localhost instead of 0.0.0.0
set HOST=localhost
REM Try port 3000 instead of 5000
set PORT=3000
set NODE_ENV=development

echo Starting server on http://localhost:3000
echo (Press Ctrl+C to stop the server)
echo.

npx tsx server/index.ts

pause
@echo off
echo Starting RadetzkyFM Radio Player with custom port...
echo.

set /p PORT="Enter port number (default is 3000): "
if "%PORT%"=="" set PORT=3000

REM Set the environment variables
set HOST=localhost
set NODE_ENV=development

echo Starting server on http://localhost:%PORT%
echo.

npx tsx server/index.ts

pause
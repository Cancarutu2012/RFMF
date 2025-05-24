@echo off
echo Starting RadetzkyFM Radio Player...
echo.
echo Note: Please make sure you have run "npm install" first
echo.

REM Set the environment variables
set NODE_ENV=development

echo Starting server...
echo.

npm run dev

pause
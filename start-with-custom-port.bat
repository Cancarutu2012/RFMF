@echo off
echo Starting RadetzkyFM Radio Player on port 3000...
set PORT=3000
npx cross-env NODE_ENV=development tsx server/index.ts
pause
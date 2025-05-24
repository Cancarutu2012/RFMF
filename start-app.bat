@echo off
echo Starting RadetzkyFM Radio Player...
npx cross-env NODE_ENV=development tsx server/index.ts
pause
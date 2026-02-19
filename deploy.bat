@echo off
echo ===================================================
echo  DEPLOYING DOCUMENTATION UPDATE
echo ===================================================
echo.
echo This script will:
echo 1. Scan your public/docs folder for new files
echo 2. Rebuild the website locally
echo 3. Initialize/Update the gh-pages branch
echo 4. Push the update to GitHub
echo.
echo Press any key to start...
pause >nul

echo.
echo [1/3] Generating Navigation Tree & Building Site...
call npm run deploy

echo.
echo ===================================================
echo  DEPLOYMENT COMPLETE!
echo ===================================================
echo.
echo You can close this window now.
pause

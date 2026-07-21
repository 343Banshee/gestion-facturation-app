@echo off
cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo Node.js n'est pas installe sur cet ordinateur.
  echo Va sur https://nodejs.org, telecharge la version LTS, installe-la, puis relance ce fichier.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Premiere installation - ca peut prendre 1-2 minutes, c'est normal...
  call npm install
)

if not exist ".env" (
  copy .env.example .env >nul
)

call npx prisma migrate deploy

start "" /min cmd /c "timeout /t 4 /nobreak >nul && start http://localhost:3000"

echo.
echo Demarrage de l'application...
echo Laisse cette fenetre ouverte tant que tu utilises l'app.
echo Pour l'arreter : ferme cette fenetre, ou appuie sur Ctrl+C.
echo.
call npm run dev

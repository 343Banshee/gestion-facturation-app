#!/bin/bash
cd "$(dirname "$0")"

if ! command -v node &> /dev/null; then
  echo "Node.js n'est pas installé sur cet ordinateur."
  echo "Va sur https://nodejs.org, télécharge la version LTS, installe-la, puis relance ce fichier."
  read -p "Appuie sur Entrée pour fermer..."
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "Première installation — ça peut prendre 1-2 minutes, c'est normal..."
  npm install
fi

if [ ! -f ".env" ]; then
  cp .env.example .env
fi

npx prisma migrate deploy

(
  for i in $(seq 1 30); do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
      open http://localhost:3000
      break
    fi
    sleep 1
  done
) &

echo ""
echo "Démarrage de l'application..."
echo "Laisse cette fenêtre ouverte tant que tu utilises l'app."
echo "Pour l'arrêter : ferme cette fenêtre, ou appuie sur Ctrl+C."
echo ""
npm run dev

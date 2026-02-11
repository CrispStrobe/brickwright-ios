#!/bin/bash

# Installation des dépendances principales
npm install

# Aller dans le répertoire scratch-blocks et installer les dépendances
cd ./node_modules/scratch-blocks
npm install

# Construction de scratch-blocks avec Python
python build.py

# Revenir à la racine du projet
cd ../..

# Ajout des extensions
node ./scripts/postinstall.js

# Construction du projet
NODE_ENV=production BUILD_MODE=dist NODE_OPTIONS="--max-old-space-size=8192" npm run build
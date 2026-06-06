#!/bin/bash

NODE_DIR="$HOME/Library/Application Support/life-rpg-node"
NODE="$NODE_DIR/bin/node"
NPX="$NODE_DIR/bin/npx"
NPM_CLI="$NODE_DIR/lib/node_modules/npm/bin/npm-cli.js"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Fallback: download Node.js if the permanent install was lost
if [ ! -f "$NODE" ]; then
  echo "Node.js introuvable, téléchargement en cours (~40 Mo)..."
  ARCH=$(uname -m)
  if [ "$ARCH" = "arm64" ]; then
    URL="https://nodejs.org/dist/v20.11.1/node-v20.11.1-darwin-arm64.tar.gz"
  else
    URL="https://nodejs.org/dist/v20.11.1/node-v20.11.1-darwin-x64.tar.gz"
  fi
  curl -fsSL "$URL" -o /tmp/node.tar.gz
  mkdir -p "$NODE_DIR"
  tar -xzf /tmp/node.tar.gz --strip-components=1 -C "$NODE_DIR"
  rm /tmp/node.tar.gz
fi

cd "$PROJECT_DIR"

# Install deps if node_modules missing
if [ ! -d "node_modules" ]; then
  echo "Installation des dépendances npm..."
  "$NODE" "$NPM_CLI" install
fi

echo ""
echo "╔══════════════════════════════════╗"
echo "║   LIFE RPG — Serveur démarré     ║"
echo "╠══════════════════════════════════╣"
echo "║   Ouvrez : http://localhost:5174 ║"
echo "║   Ctrl+C pour arrêter            ║"
echo "╚══════════════════════════════════╝"
echo ""

# Open browser after 2 seconds
(sleep 2 && open "http://localhost:5174") &

# Start Vite
"$NODE" "$NPX" vite --port 5174

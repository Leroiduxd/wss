import fetch from 'node-fetch';
import { WebSocketServer } from 'ws';

// Configuration
const PORT = process.env.PORT || 8080;
const API_KEY = "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2";
const BASE_URL = "https://prod-kline-rest.supra.com";
const TRADING_PAIR = "btc_usdt";

// Créer le serveur WebSocket
const wss = new WebSocketServer({ port: PORT });

console.log(`✅ Serveur WebSocket lancé sur le port ${PORT}`);

// Fonction pour fetch le prix
async function fetchPriceAndBroadcast() {
  try {
    const res = await fetch(`${BASE_URL}/latest?trading_pair=${TRADING_PAIR}`, {
      headers: { 'x-api-key': API_KEY }
    });
    const json = await res.json();

    if (json.instruments && json.instruments.length > 0) {
      const data = json.instruments[0];
      const payload = JSON.stringify(data);

      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(payload);
        }
      });
    }
  } catch (err) {
    console.error("❌ Erreur récupération prix:", err.message);
  }
}

// Appel toutes les secondes
setInterval(fetchPriceAndBroadcast, 1000);

// Log nouvelle connexion
wss.on('connection', ws => {
  console.log("🟢 Nouveau client connecté");
});

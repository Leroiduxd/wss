import fetch from 'node-fetch';
import { WebSocketServer } from 'ws';

// Configuration
const PORT = process.env.PORT || 8080;
const API_KEY = "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2";
const BASE_URL = "https://prod-kline-rest.supra.com";

// Liste de toutes les paires à surveiller
const PAIRS = [
  "xau_usd","xag_usd","xpd_usd","xpt_usd","xg_usd","eur_usd","usd_jpy","gbp_usd","eur_gbp","usd_krw","usd_hkd","usd_inr",
  "usd_cny","usd_sgd","usd_thb","aud_usd","usd_cad","usd_chf","nzd_usd"
];

// Serveur WebSocket
const wss = new WebSocketServer({ port: PORT });
console.log(`✅ Serveur WebSocket lancé sur le port ${PORT}`);

// Fonction pour récupérer tous les prix
async function fetchAllPricesAndBroadcast() {
  try {
    const responses = await Promise.all(PAIRS.map(pair =>
      fetch(`${BASE_URL}/latest?trading_pair=${pair}`, {
        headers: { 'x-api-key': API_KEY }
      }).then(res => res.json().then(data => ({ pair, data })))
    ));

    const results = {};
    for (const { pair, data } of responses) {
      if (data.instruments && data.instruments.length > 0) {
        results[pair] = data.instruments[0];
      }
    }

    const payload = JSON.stringify(results);

    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(payload);
      }
    });

  } catch (err) {
    console.error("❌ Erreur récupération prix:", err.message);
  }
}

// Récupérer les prix toutes les 3 secondes (éviter saturation)
setInterval(fetchAllPricesAndBroadcast, 1000);

wss.on('connection', ws => {
  console.log("🟢 Nouveau client connecté");
});

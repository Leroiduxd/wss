import fetch from 'node-fetch';
import { WebSocketServer } from 'ws';

// Configuration
const PORT = process.env.PORT || 8080;
const API_KEY = "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2";
const BASE_URL = "https://prod-kline-rest.supra.com";

// Liste des paires à surveiller
const PAIRS = [
  "eth_usdt", "xau_usd", "xag_usd", "xpd_usd", "xpt_usd", "xg_usd",
  "eur_usd", "usd_jpy", "gbp_usd", "eur_gbp", "usd_krw",
  "usd_hkd", "usd_inr", "usd_cny", "usd_sgd", "usd_thb",
  "aud_usd", "usd_cad", "usd_chf", "nzd_usd"
];

// Dictionnaire de correspondance des IDs (issu du fichier CSV)
const PAIR_IDS = {
  "eur_usd": 5000,
  "eth_usdt" : 1,
  "usd_jpy": 5001,
  "gbp_usd": 5002,
  "eur_gbp": 5003,
  "usd_krw": 5004,
  "usd_hkd": 5005,
  "usd_inr": 5006,
  "usd_cny": 5007,
  "usd_sgd": 5008,
  "usd_thb": 5009,
  "aud_usd": 5010,
  "usd_cad": 5011,
  "usd_chf": 5012,
  "nzd_usd": 5013,
  "xau_usd": 5500,
  "xag_usd": 5501,
  "xpd_usd": 5502,
  "xpt_usd": 5503,
  "xg_usd": 5504
};

// Serveur WebSocket
const wss = new WebSocketServer({ port: PORT });
console.log(`✅ Serveur WebSocket lancé sur le port ${PORT}`);

// Fonction pour récupérer tous les prix et diffuser
async function fetchAllPricesAndBroadcast() {
  try {
    const responses = await Promise.all(PAIRS.map(pair =>
      fetch(`${BASE_URL}/latest?trading_pair=${pair}`, {
        headers: { 'x-api-key': API_KEY }
      }).then(res => res.json().then(data => ({ pair, data })))
    ));

    const results = {};
    for (const { pair, data } of responses) {
      results[pair] = {
        id: PAIR_IDS[pair] || null,
        ...data
      };
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

// Rafraîchissement toutes les secondes
setInterval(fetchAllPricesAndBroadcast, 1000);

// Connexion client WebSocket
wss.on('connection', ws => {
  console.log("🟢 Nouveau client connecté");
});

import dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';
import { WebSocketServer } from 'ws';

// Configuration
const PORT = process.env.PORT || 8080;
const API_KEY = process.env.API_KEY;
const BASE_URL = "https://prod-kline-rest.supra.com";

// Liste des paires à surveiller
const PAIRS = [
  "aapl_usd", "amzn_usd", "coin_usd", "goog_usd", "gme_usd",
  "intc_usd", "ko_usd", "mcd_usd", "msft_usd", "ibm_usd",
  "meta_usd", "nvda_usd", "tsla_usd",
  "aud_usd", "eur_usd", "gbp_usd", "nzd_usd",
  "usd_cad", "usd_chf", "usd_jpy",
  "xag_usd", "xau_usd",
  "btc_usdt", "eth_usdt", "sol_usdt", "xrp_usdt",
  "avax_usdt", "doge_usdt", "trx_usdt", "ada_usdt",
  "sui_usdt", "link_usdt"
];

// Dictionnaire de correspondance des IDs
const PAIR_IDS = {
  "aapl_usd": 6004,
  "amzn_usd": 6005,
  "coin_usd": 6010,
  "goog_usd": 6003,
  "gme_usd": 6011,
  "intc_usd": 6009,
  "ko_usd": 6059,
  "mcd_usd": 6068,
  "msft_usd": 6001,
  "ibm_usd": 6066,
  "meta_usd": 6006,
  "nvda_usd": 6002,
  "tsla_usd": 6000,
  "aud_usd": 5010,
  "eur_usd": 5000,
  "gbp_usd": 5002,
  "nzd_usd": 5013,
  "usd_cad": 5011,
  "usd_chf": 5012,
  "usd_jpy": 5001,
  "xag_usd": 5501,
  "xau_usd": 5500,
  "btc_usdt": 0,
  "eth_usdt": 1,
  "sol_usdt": 10,
  "xrp_usdt": 14,
  "avax_usdt": 5,
  "doge_usdt": 3,
  "trx_usdt": 15,
  "ada_usdt": 16,
  "sui_usdt": 90,
  "link_usdt": 2
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

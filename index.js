import 'dotenv/config'; // Ajouté pour lire .env automatiquement
import fetch from 'node-fetch';
import { WebSocketServer } from 'ws';

// Configuration
const PORT = process.env.PORT || 8080;
const API_KEY = process.env.API_KEY; // Remplace la valeur directe
const BASE_URL = "https://prod-kline-rest.supra.com";

// Liste de toutes les paires à surveiller
const PAIRS = [
  "xau_usd","xag_usd","xpd_usd","xpt_usd","xg_usd","eur_usd","usd_jpy","gbp_usd","eur_gbp","usd_krw","usd_hkd","usd_inr",
  "usd_cny","usd_sgd","usd_thb","aud_usd","usd_cad","usd_chf","nzd_usd","usd_vnd","usd_php","usd_uah","usd_pkr","usd_brl",
  "usd_rub","usd_idr","usd_try","usd_ngn","usd_ars","eur_aud","gbp_jpy","chf_jpy","eur_chf","aud_jpy","gbp_cad","nzd_jpy",
  "tsla_usd","msft_usd","nvda_usd","goog_usd","aapl_usd","amzn_usd","meta_usd","nflx_usd","pypl_usd","intc_usd","coin_usd",
  "gme_usd","amd_usd","dis_usd","brk.a_usd","baba_usd","xom_usd","tmo_usd","unh_usd","lly_usd","hd_usd","ttd_usd","crm_usd",
  "qcom_usd","pfe_usd","abnb_usd","shop_usd","jd_usd","cvx_usd","jpm_usd","mu_usd","snap_usd","uber_usd","zm_usd","nike_usd",
  "jnj_usd","pg_usd","cost_usd","orcle_usd","mstr_usd","spy_usd","ibit_usd","ethe_usd","etha_usd","ethv_usd","feth_usd",
  "ethw_usd","fbtc_usd","gbtc_usd","arkb_usd","bitb_usd","v_usd","ma_usd","wmt_usd","bac_usd","abbv_usd","wfc_usd","csco_usd",
  "mrk_usd","ko_usd","now_usd","acn_usd","abt_usd","ge_usd","lin_usd","isrg_usd","ibm_usd","pep_usd","mcd_usd","gs_usd",
  "pm_usd","cat_usd","adbe_usd","axp_usd","ms_usd","txn_usd","intu_usd","trtx_usd","vz_usd","spgi_usd","pltr_usd","dhr_usd"
];

// Serveur WebSocket
const wss = new WebSocketServer({ port: PORT });
console.log(`✅ Serveur WebSocket lancé sur le port ${PORT}`);

// Fonction pour récupérer tous les prix avec tous les champs de retour
async function fetchAllPricesAndBroadcast() {
  try {
    const responses = await Promise.all(PAIRS.map(pair =>
      fetch(`${BASE_URL}/latest?trading_pair=${pair}`, {
        headers: { 'x-api-key': API_KEY }
      }).then(res => res.json().then(data => ({ pair, data })))
    ));

    const results = {};
    for (const { pair, data } of responses) {
      results[pair] = data;
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

// Récupération toutes les 3 secondes
setInterval(fetchAllPricesAndBroadcast, 3000);

wss.on('connection', ws => {
  console.log("🟢 Nouveau client connecté");
});

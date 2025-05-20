import fetch from 'node-fetch';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 8080;
const API_KEY = "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2";
const BASE_URL = "https://prod-kline-rest.supra.com";
const TRADING_PAIRS = "xau_usd,xag_usd,xpd_usd,xpt_usd,xg_usd,eur_usd,usd_jpy,gbp_usd,eur_gbp,usd_krw,usd_hkd,usd_inr,usd_cny,usd_sgd,usd_thb,aud_usd,usd_cad,usd_chf,nzd_usd,usd_vnd,usd_php,usd_uah,usd_pkr,usd_brl,usd_rub,usd_idr,usd_try,usd_ngn,usd_ars,eur_aud,gbp_jpy,chf_jpy,eur_chf,aud_jpy,gbp_cad,nzd_jpy,tsla_usd,msft_usd,nvda_usd,goog_usd,aapl_usd,amzn_usd,meta_usd,nflx_usd,pypl_usd,intc_usd,coin_usd,gme_usd,amd_usd,dis_usd,brk.a_usd,baba_usd,xom_usd,tmo_usd,unh_usd,lly_usd,hd_usd,ttd_usd,crm_usd,qcom_usd,pfe_usd,abnb_usd,shop_usd,jd_usd,cvx_usd,jpm_usd,mu_usd,snap_usd,uber_usd,zm_usd,nike_usd,jnj_usd,pg_usd,cost_usd,orcle_usd,mstr_usd,spy_usd (etf),ibit_usd (etf),ethe_usd (etf),etha_usd (etf),ethv_usd (etf),feth_usd (etf),ethw_usd (etf),fbtc_usd (etf),gbtc_usd (etf),arkb_usd (etf),bitb_usd rtf),v_usd,ma_usd,wmt_usd,bac_usd,abbv_usd,wfc_usd,csco_usd,mrk_usd,ko_usd,now_usd,acn_usd,abt_usd,ge_usd,lin_usd,isrg_usd,ibm_usd,pep_usd,mcd_usd,gs_usd,pm_usd,cat_usd,adbe_usd,axp_usd,ms_usd,txn_usd,intu_usd,trtx_usd,vz_usd,spgi_usd,pltr_usd,dhr_usd";

const wss = new WebSocketServer({ port: PORT });
console.log(`✅ WebSocket lancé sur le port ${PORT} avec $118 paires`);

async function fetchAndBroadcast() {
  try {
    const res = await fetch(`${BASE_URL}/latest?trading_pairs=${TRADING_PAIRS}`, {
      headers: { 'x-api-key': API_KEY }
    });
    const json = await res.json();

    if (json.instruments && json.instruments.length > 0) {
      const payload = JSON.stringify(json.instruments);
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(payload);
        }
      });
    }
  } catch (err) {
    console.error("❌ Erreur récupération:", err.message);
  }
}

setInterval(fetchAndBroadcast, 1000);

wss.on('connection', ws => {
  console.log("🟢 Client connecté");
});

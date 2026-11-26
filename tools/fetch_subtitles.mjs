#!/usr/bin/env node
// fetch_subtitles.mjs —— 抓取B站视频的 AI 字幕（ai-zh）并保存为带时间戳的转写稿
// 用法：
//   BILI_SESSDATA=你的SESSDATA node fetch_subtitles.mjs BV1xxx [BV1yyy ...]
//   （多P视频会逐P抓取；输出保存到 ./transcripts/）
// 说明：
//   - SESSDATA 从浏览器登录B站后的 Cookie 里取（开发者工具 → Application → Cookies → SESSDATA）
//   - AI 字幕仅登录用户可见；没有 AI 字幕的视频会跳过并提示
import fs from "fs";
import path from "path";
import { createHash } from "crypto";

const SESSDATA = process.env.BILI_SESSDATA || "";
const bvids = process.argv.slice(2);
if (!bvids.length) { console.error("用法: node fetch_subtitles.mjs BV1xxx [BV2 ...]"); process.exit(1); }
if (!SESSDATA) console.error("警告: 未设置 BILI_SESSDATA，可能拿不到字幕数据");

const cookie = `SESSDATA=${SESSDATA}`;
const OUT = path.resolve("transcripts");
fs.mkdirSync(OUT, { recursive: true });
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// ---- wbi 签名（B站公开算法）----
const TAB = [46,47,18,2,53,8,23,32,15,50,10,31,58,3,45,35,27,43,5,49,33,9,42,19,29,28,14,39,12,38,41,13,37,48,7,16,24,55,40,61,26,17,0,1,60,51,30,4,22,25,54,21,56,59,6,63,57,62,11,36,20,34,44,52];
function md5(s) { return createHash("md5").update(s).digest("hex"); }

let mixinKey = null;
async function getMixinKey() {
  if (mixinKey) return mixinKey;
  const nav = await (await fetch("https://api.bilibili.com/x/web-interface/nav", { headers: { Cookie: cookie } })).json();
  const img = (nav?.data?.wbi_img?.img_url || "").split("/").pop().split(".")[0];
  const sub = (nav?.data?.wbi_img?.sub_url || "").split("/").pop().split(".")[0];
  mixinKey = TAB.map((i) => (img + sub)[i]).join("").slice(0, 32);
  return mixinKey;
}
async function signedParams(extra) {
  const mixin = await getMixinKey();
  const params = { ...extra, wts: Math.floor(Date.now() / 1000) };
  const q = Object.keys(params).sort().map((k) => `${k}=${encodeURIComponent(String(params[k]).replace(/[!'()*]/g, ""))}`).join("&");
  return `${q}&w_rid=${md5(q + mixin)}`;
}

const headers = { Cookie: cookie, Referer: "https://www.bilibili.com/", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" };

for (const bv of bvids) {
  try {
    const v = await (await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bv}`, { headers })).json();
    const d = v?.data;
    if (!d) { console.error(`${bv}: 视频信息获取失败 ${v?.message || ""}`); continue; }
    console.log(`${bv}: ${d.title}（${(d.pages || []).length} 个分P）`);
    let n = 0;
    for (let i = 0; i < (d.pages || []).length; i++) {
      const p = d.pages[i];
      const qs = await signedParams({ bvid: bv, cid: p.cid });
      const j = await (await fetch(`https://api.bilibili.com/x/player/wbi/v2?${qs}`, { headers })).json();
      const zh = (j?.data?.subtitle?.subtitles || []).find((x) => x.lan === "ai-zh");
      if (!zh || !zh.subtitle_url) { console.log(`  P${i + 1} ${p.part}: 无AI字幕，跳过`); continue; }
      const url = zh.subtitle_url.startsWith("//") ? "https:" + zh.subtitle_url : zh.subtitle_url;
      const sub = await (await fetch(url, { headers })).json();
      const fname = path.join(OUT, `${bv}_p${String(i + 1).padStart(2, "0")}_${String(p.part).replace(/[\\/:*?"<>|\s]/g, "_").slice(0, 30)}.txt`);
      fs.writeFileSync(fname, `# ${d.title} | ${p.part}\n` + (sub.body || []).map((l) => `[${fmt(l.from)}] ${l.content}`).join("\n"), "utf-8");
      n++;
      await new Promise((r) => setTimeout(r, 400));
    }
    console.log(`  已保存 ${n} 个分P的转写稿`);
  } catch (e) {
    console.error(`${bv}: ${e.message}`);
  }
}
console.log("完成");

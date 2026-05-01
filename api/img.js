export const config = { runtime: 'edge' };

// 簡易記憶體快取（每個 edge instance 自己一份，但已足夠）
const cache = new Map();
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7天

export default async function handler(req) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");

  if (!q) {
    return new Response(JSON.stringify({ error: "missing q" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 檢查快取
  const cached = cache.get(q);
  if (cached && Date.now() - cached.t < CACHE_TTL) {
    return new Response(JSON.stringify({ ok: true, image: cached.url, cached: true }), {
      headers: corsHeaders(),
    });
  }

  try {
    // Step 1: 取得 DuckDuckGo vqd token
    const tokenRes = await fetch(
      `https://duckduckgo.com/?q=${encodeURIComponent(q)}&iar=images&iax=images&ia=images`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0",
        },
      }
    );
    const html = await tokenRes.text();
    const vqdMatch = html.match(/vqd=['"]([\d-]+)['"]/);
    if (!vqdMatch) throw new Error("no vqd token");
    const vqd = vqdMatch[1];

    // Step 2: 用 token 呼叫圖片搜尋 API
    const imgRes = await fetch(
      `https://duckduckgo.com/i.js?l=tw-tzh&o=json&q=${encodeURIComponent(q)}&vqd=${vqd}&p=1`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0",
          "Referer": "https://duckduckgo.com/",
          "Accept": "application/json",
        },
      }
    );
    const data = await imgRes.json();
    const first = data?.results?.[0];
    if (!first) throw new Error("no results");

    const imageUrl = first.thumbnail || first.image;
    cache.set(q, { url: imageUrl, t: Date.now() });

    return new Response(JSON.stringify({ ok: true, image: imageUrl }), {
      headers: corsHeaders(),
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: corsHeaders(),
    });
  }
}

function corsHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "s-maxage=604800, stale-while-revalidate=2592000", // CDN快取7天
  };
}

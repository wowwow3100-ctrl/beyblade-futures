export const config = { runtime: 'edge' };

const KEYWORDS = [
  { id: 1, code: "UX-15", keyword: "UX-15 鯊魚" },
  { id: 2, code: "UX-03", keyword: "UX-03 神杖" },
  { id: 3, code: "BX-23", keyword: "BX-23 鳳凰" },
  { id: 4, code: "BX-00", keyword: "BX-00 25週年" },
  { id: 5, code: "BXG-17", keyword: "BXG-17 黑金" },
];

export default async function handler(req) {
  const results = [];

  for (const item of KEYWORDS) {
    try {
      const q = encodeURIComponent(`戰鬥陀螺 ${item.keyword}`);
      const url = `https://shopee.tw/api/v4/search/search_items?by=relevancy&keyword=${q}&limit=5&newest=0&order=desc&page_type=search&scenario=PAGE_GLOBAL_SEARCH&version=2`;

      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
          "Referer": "https://shopee.tw/",
          "Accept": "application/json",
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const items = data?.items || [];

      if (items.length === 0) {
        results.push({ id: item.id, code: item.code, inStock: false, count: 0, minPrice: null, listings: [] });
        continue;
      }

      const listings = items.slice(0, 3).map(it => ({
        name: it.item_basic?.name?.slice(0, 30) || "",
        price: Math.round((it.item_basic?.price || 0) / 100000),
        sold: it.item_basic?.historical_sold || 0,
        stock: it.item_basic?.stock || 0,
      })).filter(l => l.price > 0);

      const prices = listings.map(l => l.price).filter(p => p > 0);
      results.push({
        id: item.id,
        code: item.code,
        inStock: listings.some(l => l.stock > 0),
        count: listings.length,
        minPrice: prices.length ? Math.min(...prices) : null,
        listings,
      });
    } catch (e) {
      results.push({ id: item.id, code: item.code, inStock: false, count: 0, minPrice: null, listings: [], error: e.message });
    }
  }

  return new Response(JSON.stringify({ ok: true, updatedAt: new Date().toISOString(), results }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
    },
  });
}

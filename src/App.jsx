import { useState, useRef, useEffect } from "react";
import "./App.css";

// ── Full Beyblade X catalogue ──────────────────────────────────────────────
export const ALL_BLADES = [
  { id:1,  series:"UX", code:"UX-15", name:"鯊魚組",       fullName:"Shark Scale 4-50UF",      type:"攻擊", emoji:"🦈", officialPrice:700,  history:[1200,1400,1700,2000,2200,2500] },
  { id:2,  series:"UX", code:"UX-03", name:"神杖",          fullName:"Wizard Arrow 4-80B",       type:"耐久", emoji:"🪄", officialPrice:550,  history:[900,950,1050,1200,1400,1600] },
  { id:3,  series:"BX", code:"BX-23", name:"鳳凰",          fullName:"Phoenix Wing 4-70GF",      type:"平衡", emoji:"🦅", officialPrice:495,  history:[600,650,700,850,950,1100] },
  { id:4,  series:"BX", code:"BX-00", name:"25週年紀念組",  fullName:"25th Anniversary Set",     type:"限定", emoji:"🏆", officialPrice:2800, history:[2800,3000,3500,4200,4800,5500] },
  { id:5,  series:"BX", code:"BXG-17",name:"黑金限定軸心",  fullName:"黑金版 APP限定",            type:"限定", emoji:"⚡", officialPrice:460,  history:[460,600,900,1200,1500,1800] },
  { id:6,  series:"UX", code:"UX-01", name:"獅子組",        fullName:"Leon Claw 4-55P",          type:"攻擊", emoji:"🦁", officialPrice:550,  history:[550,580,620,700,820,980] },
  { id:7,  series:"UX", code:"UX-07", name:"蜘蛛",          fullName:"Dran Sword 3-60T",         type:"攻擊", emoji:"🕷️", officialPrice:495,  history:[495,520,560,650,720,850] },
  { id:8,  series:"BX", code:"BX-34", name:"龍組",          fullName:"Dragoon Legacy 4-60HT",    type:"平衡", emoji:"🐉", officialPrice:660,  history:[660,700,780,900,1050,1200] },
  { id:9,  series:"BX", code:"BX-18", name:"地獄犬",        fullName:"Hell Scythe 4-70B",        type:"耐久", emoji:"🐺", officialPrice:495,  history:[495,510,540,600,680,780] },
  { id:10, series:"CX", code:"CX-01", name:"猛禽",          fullName:"Raptor Talon 4-60LF",      type:"攻擊", emoji:"🦅", officialPrice:770,  history:[770,800,880,1000,1150,1350] },
  { id:11, series:"CX", code:"CX-03", name:"海神",          fullName:"Poseidon Fin 4-80HN",      type:"耐久", emoji:"🔱", officialPrice:770,  history:[770,790,830,900,980,1100] },
  { id:12, series:"BX", code:"BX-41", name:"獨角獸",        fullName:"Unicorn Sting 3-70GP",     type:"平衡", emoji:"🦄", officialPrice:495,  history:[495,520,600,720,880,1050] },
];

const MONTHS = ["11月", "12月", "1月", "2月", "3月", "4月(現在)"];

// ── Helpers ────────────────────────────────────────────────────────────────
const pct = (a, b) => (((b - a) / a) * 100).toFixed(1);
const gain = b => b.history[b.history.length - 1] - b.history[0];
const totalPct = b => pct(b.history[0], b.history[b.history.length - 1]);
const currentPrice = b => b.history[b.history.length - 1];

// ── Sparkline SVG ──────────────────────────────────────────────────────────
function Sparkline({ history, color = "#ffaa00" }) {
  const w = 80, h = 28, pad = 2;
  const min = Math.min(...history), max = Math.max(...history);
  const range = max - min || 1;
  const pts = history.map((v, i) => {
    const x = pad + (i / (history.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" opacity="0.8" />
      <polyline points={pts} fill={`url(#sg${history[0]})`} stroke="none" opacity="0.15" />
      <defs>
        <linearGradient id={`sg${history[0]}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Monthly price row ──────────────────────────────────────────────────────
function MonthlyTable({ blade }) {
  return (
    <div className="monthly-table">
      <div className="mt-head">
        {MONTHS.map((m, i) => (
          <div key={i} className={`mt-cell ${i === MONTHS.length - 1 ? "mt-now" : ""}`}>
            <div className="mt-month">{m}</div>
            <div className="mt-price">NT${blade.history[i].toLocaleString()}</div>
            {i > 0 && (
              <div className={`mt-delta ${blade.history[i] >= blade.history[i-1] ? "up" : "dn"}`}>
                {blade.history[i] >= blade.history[i-1] ? "▲" : "▼"}
                {Math.abs(pct(blade.history[i-1], blade.history[i]))}%
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [tracked, setTracked] = useState(new Set([1, 2, 3, 4, 5]));
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [unit, setUnit] = useState(1);
  const [activeTab, setActiveTab] = useState("tracker"); // tracker | catalogue | tournament
  const [loading, setLoading] = useState(false);
  const [tourneyLoading, setTourneyLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [tourneyError, setTourneyError] = useState(null);
  const [bladeData, setBladeData] = useState(() =>
    Object.fromEntries(ALL_BLADES.map(b => [b.id, { history: [...b.history], reason: "" }]))
  );
  const abortRef = useRef(null);

  const trackedBlades = ALL_BLADES.filter(b => tracked.has(b.id)).map(b => ({
    ...b, history: bladeData[b.id].history, reason: bladeData[b.id].reason
  }));

  const searchResults = search.trim()
    ? ALL_BLADES.filter(b =>
        b.name.includes(search) || b.code.toLowerCase().includes(search.toLowerCase()) ||
        b.fullName.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  // ── AI: refresh prices ─────────────────────────────────────────────────
  const refreshPrices = async () => {
    setLoading(true); setError(null);
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController(); abortRef.current = ctrl;

    const trackedList = trackedBlades.map(b =>
      `${b.id}. ${b.code} ${b.name} (半年前NT$${b.history[0]})`
    ).join("\n");

    const prompt = `你是台灣戰鬥陀螺(Beyblade X)二手市場分析師。
請搜尋台灣蝦皮、露天、巴哈、PTT最新二手行情，更新以下陀螺每月售價。
只回傳JSON，不加任何其他文字：
{
  "blades": [
    {"id":數字,"history":[月1,月2,月3,月4,月5,月6],"reason":"一句話近況"}
  ]
}
其中 history 為近六個月每月台幣中位成交價（2025年11月→2026年4月）。

追蹤清單：
${trackedList}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", signal: ctrl.signal,
        headers: {
  "Content-Type": "application/json",
  "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true",
},
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content.filter(b => b.type === "text").map(b => b.text).join("");
      const m = text.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("parse fail");
      const parsed = JSON.parse(m[0]);
      setBladeData(prev => {
        const next = { ...prev };
        parsed.blades.forEach(u => {
          if (next[u.id]) next[u.id] = { history: u.history, reason: u.reason };
        });
        return next;
      });
      setLastUpdated(new Date().toLocaleTimeString("zh-TW"));
    } catch (e) {
      if (e.name !== "AbortError") setError("更新失敗，請確認 API Key 是否設定正確");
    } finally { setLoading(false); }
  };

  // ── AI: fetch tournament results ───────────────────────────────────────
  const fetchTournaments = async () => {
    setTourneyLoading(true); setTourneyError(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
  "Content-Type": "application/json",
  "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true",
},
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{
            role: "user",
            content: `搜尋2025-2026年最新戰鬥陀螺Beyblade X競技比賽結果（台灣、日本、世界大賽）。
只回傳JSON，不加其他文字：
{
  "tournaments": [
    {
      "name": "比賽名稱",
      "date": "日期",
      "location": "地點",
      "winner": "冠軍選手",
      "winnerBlade": "使用陀螺代號和名稱",
      "top3Blades": ["陀螺1","陀螺2","陀螺3"],
      "hotBlade": "本場最受矚目陀螺",
      "note": "一句話重點"
    }
  ]
}
請盡量找最近3-5場賽事。`
          }],
        }),
      });
      const data = await res.json();
      const text = data.content.filter(b => b.type === "text").map(b => b.text).join("");
      const m = text.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("parse fail");
      const parsed = JSON.parse(m[0]);
      setTournaments(parsed.tournaments || []);
    } catch (e) {
      setTourneyError("賽事資料載入失敗");
    } finally { setTourneyLoading(false); }
  };

  useEffect(() => {
    if (activeTab === "tournament" && tournaments.length === 0) fetchTournaments();
  }, [activeTab]);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="app">
      {/* Flames */}
      {[5,15,28,42,58,70,83,93].map((l,i) => (
        <div key={i} className="flame" style={{
          left:`${l}%`,
          animationDelay:`${[0,.4,1.1,.7,1.6,.2,1.3,.9][i]}s`,
          animationDuration:`${[2.8,3.2,2.5,3.5,2.9,3.1,2.6,3.4][i]}s`
        }}/>
      ))}

      {/* Header */}
      <header className="header">
        <div className="badge">BEYBLADE X · FUTURES MARKET 2026</div>
        <h1 className="title">
          <span className="t-jp">陀螺</span>
          <span>小型期貨</span>
          <span className="t-x">X</span>
        </h1>
        <p className="sub">近半年二手市場炒價追蹤 2025.11 → 2026.04</p>
      </header>

      {/* Tabs */}
      <nav className="tabs">
        {[
          { id:"tracker",    label:"📈 價格追蹤" },
          { id:"catalogue",  label:"📋 陀螺清單" },
          { id:"tournament", label:"🏆 賽事戰報" },
        ].map(t => (
          <button key={t.id} className={`tab ${activeTab===t.id?"tab--active":""}`}
            onClick={() => { setActiveTab(t.id); setSelected(null); }}>
            {t.label}
          </button>
        ))}
      </nav>

      <main className="main">

        {/* ── TAB: TRACKER ── */}
        {activeTab === "tracker" && (
          <>
            {/* Search */}
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                placeholder="搜尋陀螺名稱或型號..."
                value={search}
                onChange={e => { setSearch(e.target.value); setSelected(null); }}
              />
              {search && <button className="search-clear" onClick={() => setSearch("")}>✕</button>}
            </div>

            {/* Search results */}
            {search && (
              <div className="search-results">
                {searchResults.length === 0 ? (
                  <div className="no-results">找不到「{search}」，試試其他關鍵字</div>
                ) : searchResults.map(b => {
                  const bd = { ...b, history: bladeData[b.id].history };
                  const isTracked = tracked.has(b.id);
                  return (
                    <div key={b.id} className="search-item">
                      <span className="si-emoji">{b.emoji}</span>
                      <div className="si-info">
                        <div className="si-name">{b.code} {b.name}</div>
                        <div className="si-price">現價 NT${currentPrice(bd).toLocaleString()} · 累積 <span className="green">+{totalPct(bd)}%</span></div>
                      </div>
                      <button
                        className={`si-btn ${isTracked ? "si-btn--remove" : ""}`}
                        onClick={() => {
                          setTracked(prev => {
                            const n = new Set(prev);
                            isTracked ? n.delete(b.id) : n.add(b.id);
                            return n;
                          });
                        }}
                      >{isTracked ? "移除追蹤" : "+ 加入追蹤"}</button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* AI refresh */}
            <div className="refresh-row">
              <button className={`rbtn ${loading?"rbtn--loading":""}`} onClick={refreshPrices} disabled={loading}>
                {loading ? <><span className="spin">⚙</span> AI 搜尋中...</> : <>🔥 AI 更新最新行情</>}
              </button>
              {lastUpdated && <span className="ok">✅ {lastUpdated} 更新</span>}
              {error && <span className="err">⚠️ {error}</span>}
            </div>

            {/* Tracked cards */}
            {trackedBlades.length === 0 ? (
              <div className="empty">去「陀螺清單」加入想追蹤的款式</div>
            ) : trackedBlades.map((b, i) => {
              const change = totalPct(b);
              const g = gain(b);
              const isOpen = selected === i;
              return (
                <div key={b.id} className={`card ${isOpen?"card--open":""}`}
                  onClick={() => setSelected(isOpen ? null : i)}>
                  <div className="card-rank">#{i+1}</div>
                  <div className="card-inner">
                    <div className="card-left">
                      <span className="card-emoji">{b.emoji}</span>
                      <div>
                        <div className="card-name">{b.code} {b.name}</div>
                        <div className="card-full">{b.fullName}</div>
                        <div className="card-type">{b.type}</div>
                      </div>
                    </div>
                    <div className="card-right">
                      <Sparkline history={b.history} color={g > 0 ? "#ffaa00" : "#ff4466"} />
                      <div className="price-col">
                        <div className="price-before">NT${b.history[0].toLocaleString()}</div>
                        <div className="price-now">NT${currentPrice(b).toLocaleString()}</div>
                      </div>
                      <div className="price-badge">
                        <span className="pct">+{change}%</span>
                        <span className="pct-label">累積漲幅</span>
                      </div>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="card-detail">
                      {b.reason && <div className="detail-reason">📌 {b.reason}</div>}
                      <MonthlyTable blade={b} />
                      <div className="detail-stats">
                        <div className="stat"><span>官方定價</span><b>NT${b.officialPrice.toLocaleString()}</b></div>
                        <div className="stat"><span>現在溢價</span><b className="orange">+NT${(currentPrice(b)-b.officialPrice).toLocaleString()}</b></div>
                        <div className="stat"><span>半年漲幅</span><b className="green">NT${g.toLocaleString()}</b></div>
                      </div>
                      <div className="calc-box">
                        <div className="calc-title">💰 獲利試算</div>
                        <div className="calc-units">
                          <span>持有：</span>
                          {[1,3,5,10].map(n => (
                            <button key={n} className={`ubtn ${unit===n?"ubtn--active":""}`}
                              onClick={e => { e.stopPropagation(); setUnit(n); }}>{n} 顆</button>
                          ))}
                        </div>
                        <div className="calc-result">
                          半年獲利：NT${(g * unit).toLocaleString()}
                          <span className="calc-sub">（{unit} 顆）</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* ── TAB: CATALOGUE ── */}
        {activeTab === "catalogue" && (
          <>
            <div className="cat-header">
              <div className="cat-title">完整陀螺清單</div>
              <div className="cat-sub">勾選加入追蹤，最多可同時追蹤全部款式</div>
            </div>
            {["UX","BX","CX"].map(series => (
              <div key={series} className="series-group">
                <div className="series-label">{series} 系列</div>
                {ALL_BLADES.filter(b => b.series === series).map(b => {
                  const bd = { ...b, history: bladeData[b.id].history };
                  const isTracked = tracked.has(b.id);
                  return (
                    <div key={b.id} className={`cat-item ${isTracked?"cat-item--tracked":""}`}>
                      <label className="cat-check">
                        <input type="checkbox" checked={isTracked}
                          onChange={() => {
                            setTracked(prev => {
                              const n = new Set(prev);
                              isTracked ? n.delete(b.id) : n.add(b.id);
                              return n;
                            });
                          }}
                        />
                        <span className="checkmark" />
                      </label>
                      <span className="cat-emoji">{b.emoji}</span>
                      <div className="cat-info">
                        <div className="cat-name">{b.code} {b.name}</div>
                        <div className="cat-full">{b.fullName} · {b.type}型</div>
                      </div>
                      <div className="cat-stats">
                        <div className="cat-price">NT${currentPrice(bd).toLocaleString()}</div>
                        <div className="cat-pct green">+{totalPct(bd)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        )}

        {/* ── TAB: TOURNAMENT ── */}
        {activeTab === "tournament" && (
          <>
            <div className="tourney-header">
              <div className="cat-title">🏆 近期賽事戰報</div>
              <div className="cat-sub">AI 搜尋最新比賽成績，標示潛力陀螺</div>
              <button className={`rbtn rbtn--sm ${tourneyLoading?"rbtn--loading":""}`}
                onClick={fetchTournaments} disabled={tourneyLoading}>
                {tourneyLoading ? <><span className="spin">⚙</span> 搜尋中...</> : <>🔍 重新搜尋賽事</>}
              </button>
              {tourneyError && <div className="err">{tourneyError}</div>}
            </div>

            {tourneyLoading && (
              <div className="loading-msg">
                <span className="spin" style={{fontSize:24}}>⚙</span>
                <div>AI 正在搜尋最新賽事資料...</div>
              </div>
            )}

            {!tourneyLoading && tournaments.length === 0 && !tourneyError && (
              <div className="empty">點上方按鈕載入最新賽事</div>
            )}

            {tournaments.map((t, i) => (
              <div key={i} className="tourney-card">
                <div className="tc-top">
                  <div>
                    <div className="tc-name">{t.name}</div>
                    <div className="tc-meta">{t.date} · {t.location}</div>
                  </div>
                  <div className="tc-badge">第{i+1}場</div>
                </div>
                <div className="tc-winner">
                  🥇 <strong>{t.winner}</strong> · {t.winnerBlade}
                </div>
                {t.top3Blades && (
                  <div className="tc-top3">
                    <span className="tc-label">前3名用刀：</span>
                    {t.top3Blades.map((bl, j) => (
                      <span key={j} className="tc-blade">{bl}</span>
                    ))}
                  </div>
                )}
                {t.hotBlade && (
                  <div className="tc-hot">
                    🔥 潛力陀：<strong className="orange">{t.hotBlade}</strong>
                  </div>
                )}
                {t.note && <div className="tc-note">📌 {t.note}</div>}
              </div>
            ))}
          </>
        )}
      </main>

      <footer className="footer">
        <div className="disc">⚠ 資料僅供參考，非投資建議｜來源：蝦皮、露天、巴哈、PTT</div>
      </footer>
    </div>
  );
}

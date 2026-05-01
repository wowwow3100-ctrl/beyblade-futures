import { useState, useEffect } from "react";
import "./App.css";

const ALL_BLADES = [
  { id:1,  series:"UX", code:"UX-15", name:"鯊魚組",      fullName:"Shark Scale 4-50UF",   type:"攻擊", emoji:"🦈", officialPrice:700,  history:[1800,1900,2000,2200,2400,2500] },
  { id:2,  series:"UX", code:"UX-03", name:"神杖",         fullName:"Wizard Arrow 4-80B",    type:"耐久", emoji:"🪄", officialPrice:550,  history:[1100,1150,1200,1350,1500,1600] },
  { id:3,  series:"BX", code:"BX-23", name:"鳳凰",         fullName:"Phoenix Wing 4-70GF",   type:"平衡", emoji:"🦅", officialPrice:495,  history:[700,750,800,900,1000,1100] },
  { id:4,  series:"BX", code:"BX-00", name:"25週年紀念組", fullName:"25th Anniversary Set",  type:"限定", emoji:"🏆", officialPrice:2800, history:[2800,3000,3500,4200,4800,5500] },
  { id:5,  series:"BX", code:"BXG-17",name:"黑金限定軸心", fullName:"黑金版 APP限定",         type:"限定", emoji:"⚡", officialPrice:460,  history:[460,600,900,1200,1500,1800] },
  { id:6,  series:"UX", code:"UX-01", name:"獅子組",       fullName:"Leon Claw 4-55P",       type:"攻擊", emoji:"🦁", officialPrice:550,  history:[550,580,620,700,820,980] },
  { id:7,  series:"UX", code:"UX-07", name:"蜘蛛",         fullName:"Dran Sword 3-60T",      type:"攻擊", emoji:"🕷️", officialPrice:495,  history:[495,520,560,650,720,850] },
  { id:8,  series:"BX", code:"BX-34", name:"龍組",         fullName:"Dragoon Legacy 4-60HT", type:"平衡", emoji:"🐉", officialPrice:660,  history:[660,700,780,900,1050,1200] },
  { id:9,  series:"BX", code:"BX-18", name:"地獄犬",       fullName:"Hell Scythe 4-70B",     type:"耐久", emoji:"🐺", officialPrice:495,  history:[495,510,540,600,680,780] },
  { id:10, series:"CX", code:"CX-01", name:"猛禽",         fullName:"Raptor Talon 4-60LF",   type:"攻擊", emoji:"🦅", officialPrice:770,  history:[770,800,880,1000,1150,1350] },
  { id:11, series:"CX", code:"CX-03", name:"海神",         fullName:"Poseidon Fin 4-80HN",   type:"耐久", emoji:"🔱", officialPrice:770,  history:[770,790,830,900,980,1100] },
  { id:12, series:"BX", code:"BX-41", name:"獨角獸",       fullName:"Unicorn Sting 3-70GP",  type:"平衡", emoji:"🦄", officialPrice:495,  history:[495,520,600,720,880,1050] },
];

const MONTHS  = ["11月","12月","1月","2月","3月","4月"];
const UPDATED = "2026年5月1日";

const pct    = (a,b) => (((b-a)/a)*100).toFixed(1);
const gain   = b => b.history[b.history.length-1] - b.history[0];
const totPct = b => pct(b.history[0], b.history[b.history.length-1]);
const curPx  = b => b.history[b.history.length-1];

function Sparkline({ history }) {
  const w=72, h=26, pad=2;
  const min=Math.min(...history), max=Math.max(...history), range=max-min||1;
  const pts = history.map((v,i)=>{
    const x = pad+(i/(history.length-1))*(w-pad*2);
    const y = h-pad-((v-min)/range)*(h-pad*2);
    return `${x},${y}`;
  }).join(" ");
  const id=`g${history[0]}x${history[history.length-1]}`;
  return (
    <svg width={w} height={h} style={{overflow:"visible",flexShrink:0}}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffaa00" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#ffaa00" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={`${pad},${h} ${pts} ${w-pad},${h}`} fill={`url(#${id})`}/>
      <polyline points={pts} fill="none" stroke="#ffaa00" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

function MonthlyTable({ blade }) {
  return (
    <div className="mt-wrap">
      {MONTHS.map((m,i)=>(
        <div key={i} className={`mt-cell${i===MONTHS.length-1?" mt-now":""}`}>
          <div className="mt-month">{m}</div>
          <div className="mt-price">NT${blade.history[i].toLocaleString()}</div>
          {i>0 && (
            <div className={`mt-delta ${blade.history[i]>=blade.history[i-1]?"up":"dn"}`}>
              {blade.history[i]>=blade.history[i-1]?"▲":"▼"}
              {Math.abs(pct(blade.history[i-1],blade.history[i]))}%
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [tracked, setTracked]  = useState(new Set([1,2,3,4,5]));
  const [search,  setSearch]   = useState("");
  const [selected,setSelected] = useState(null);
  const [tab,     setTab]      = useState("price");
  const [stock,   setStock]    = useState([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockUpdated, setStockUpdated] = useState(null);

  useEffect(() => {
    if (tab === "stock" && stock.length === 0) fetchStock();
  }, [tab]);

  const fetchStock = async () => {
    setStockLoading(true);
    try {
      const res = await fetch("/api/stock");
      const data = await res.json();
      if (data.ok) {
        setStock(data.results);
        setStockUpdated(new Date().toLocaleTimeString("zh-TW"));
      }
    } catch(e) { console.error(e); }
    finally { setStockLoading(false); }
  };

  const toggle = id => setTracked(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const trackedBlades = ALL_BLADES.filter(b => tracked.has(b.id));
  const searchResults = search.trim()
    ? ALL_BLADES.filter(b =>
        b.name.includes(search) ||
        b.code.toLowerCase().includes(search.toLowerCase()) ||
        b.fullName.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div className="app">
      {[5,18,32,47,61,75,88].map((l,i)=>(
        <div key={i} className="flame" style={{
          left:`${l}%`,
          animationDelay:`${[0,.5,1,.3,1.4,.7,1.1][i]}s`,
          animationDuration:`${[2.8,3.2,2.6,3.5,2.9,3.1,2.7][i]}s`,
        }}/>
      ))}

      <header className="header">
        <div className="badge">BEYBLADE X · TAIWAN MARKET</div>
        <h1 className="title">
          <span className="t-fire">戰鬥陀螺</span><br/>
          <span className="t-main">報價趨勢</span>
        </h1>
        <div className="updated-row">
          <span className="udot"/>
          目前最新行情｜更新：{UPDATED}
        </div>
      </header>

      <nav className="tabs">
        <button className={`tab${tab==="price"?" tab--on":""}`} onClick={()=>{setTab("price");setSelected(null);}}>📈 報價趨勢</button>
        <button className={`tab${tab==="stock"?" tab--on":""}`} onClick={()=>setTab("stock")}>🏪 補貨情報</button>
        <button className={`tab${tab==="list"?" tab--on":""}`} onClick={()=>{setTab("list");setSelected(null);}}>📋 陀螺清單</button>
      </nav>

      <main className="main">

        {/* ── PRICE TAB ── */}
        {tab==="price" && (<>
          <div className="sbar">
            <span>🔍</span>
            <input className="sinput" placeholder="搜尋型號或名稱…"
              value={search} onChange={e=>{setSearch(e.target.value);setSelected(null);}}/>
            {search && <button className="sclear" onClick={()=>setSearch("")}>✕</button>}
          </div>

          {search && (
            <div className="sresults">
              {searchResults.length===0
                ? <div className="no-result">找不到「{search}」</div>
                : searchResults.map(b=>{
                    const on = tracked.has(b.id);
                    return (
                      <div key={b.id} className="sitem">
                        <span className="sitem-em">{b.emoji}</span>
                        <div className="sitem-info">
                          <div className="sitem-name">{b.code} {b.name}</div>
                          <div className="sitem-sub">NT${curPx(b).toLocaleString()} · <span className="green">+{totPct(b)}%</span></div>
                        </div>
                        <button className={`sbtn${on?" sbtn--rm":""}`} onClick={()=>toggle(b.id)}>
                          {on?"移除":"+ 追蹤"}
                        </button>
                      </div>
                    );
                  })
              }
            </div>
          )}

          {trackedBlades.length===0
            ? <div className="empty">去「陀螺清單」加入想追蹤的款式</div>
            : trackedBlades.map((b,i)=>{
                const isOpen = selected===i;
                const g = gain(b);
                return (
                  <div key={b.id} className={`card${isOpen?" card--open":""}`}
                    onClick={()=>setSelected(isOpen?null:i)}>
                    <span className="card-rank">#{i+1}</span>
                    <div className="card-top">
                      <div className="card-left">
                        <span className="card-em">{b.emoji}</span>
                        <div>
                          <div className="card-name">{b.code} {b.name}</div>
                          <div className="card-full">{b.fullName}</div>
                          <div className="card-type">{b.type}型</div>
                        </div>
                      </div>
                      <div className="card-right">
                        <Sparkline history={b.history}/>
                        <div className="price-col">
                          <div className="price-before">NT${b.history[0].toLocaleString()}</div>
                          <div className="price-now">NT${curPx(b).toLocaleString()}</div>
                        </div>
                        <div className="pct-badge">
                          <span className="pct-num">+{totPct(b)}%</span>
                          <span className="pct-lbl">半年漲幅</span>
                        </div>
                      </div>
                    </div>
                    {isOpen && (
                      <div className="detail">
                        <MonthlyTable blade={b}/>
                        <div className="stats-row">
                          <div className="stat"><span>官方定價</span><b>NT${b.officialPrice.toLocaleString()}</b></div>
                          <div className="stat"><span>現在溢價</span><b className="orange">+NT${(curPx(b)-b.officialPrice).toLocaleString()}</b></div>
                          <div className="stat"><span>半年漲幅</span><b className="green">NT${g.toLocaleString()}</b></div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })
          }
        </>)}

        {/* ── STOCK TAB ── */}
        {tab==="stock" && (<>
          <div className="stock-hdr">
            <div className="list-title">🏪 蝦皮補貨情報</div>
            <div className="list-sub">即時抓取蝦皮現貨資訊</div>
            <button className="rbtn" onClick={fetchStock} disabled={stockLoading}>
              {stockLoading ? "⏳ 查詢中…" : "🔄 重新查詢"}
            </button>
            {stockUpdated && <div className="stock-updated">更新：{stockUpdated}</div>}
          </div>

          {stockLoading && (
            <div className="stock-loading">
              <div className="spin-big">⚙</div>
              <div>正在查詢蝦皮現貨…</div>
            </div>
          )}

          {!stockLoading && stock.length === 0 && (
            <div className="empty">點上方「重新查詢」載入補貨情報</div>
          )}

          {!stockLoading && stock.map(s=>{
            const blade = ALL_BLADES.find(b=>b.id===s.id);
            if (!blade) return null;
            return (
              <div key={s.id} className={`stock-card${s.inStock?" stock-card--in":""}`}>
                <div className="stock-top">
                  <span className="stock-em">{blade.emoji}</span>
                  <div className="stock-info">
                    <div className="stock-name">{blade.code} {blade.name}</div>
                    <div className="stock-full">{blade.fullName}</div>
                  </div>
                  <div className={`stock-badge${s.inStock?" stock-badge--in":""}`}>
                    {s.inStock ? "✅ 有貨" : "❌ 缺貨"}
                  </div>
                </div>
                {s.listings && s.listings.length > 0 && (
                  <div className="stock-listings">
                    {s.listings.map((l,i)=>(
                      <div key={i} className="stock-listing">
                        <div className="sl-name">{l.name}…</div>
                        <div className="sl-price">NT${l.price.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
                {s.minPrice && (
                  <div className="stock-min">蝦皮最低：<strong>NT${s.minPrice.toLocaleString()}</strong></div>
                )}
              </div>
            );
          })}
        </>)}

        {/* ── LIST TAB ── */}
        {tab==="list" && (<>
          <div className="list-hdr">
            <div className="list-title">完整陀螺清單</div>
            <div className="list-sub">點擊加入／移除報價追蹤</div>
          </div>
          {["UX","BX","CX"].map(series=>(
            <div key={series} className="series-group">
              <div className="series-label">{series} 系列</div>
              {ALL_BLADES.filter(b=>b.series===series).map(b=>{
                const on = tracked.has(b.id);
                return (
                  <div key={b.id} className={`litem${on?" litem--on":""}`} onClick={()=>toggle(b.id)}>
                    <div className={`lcheck${on?" lcheck--on":""}`}>{on?"✓":""}</div>
                    <span className="lem">{b.emoji}</span>
                    <div className="linfo">
                      <div className="lname">{b.code} {b.name}</div>
                      <div className="lfull">{b.fullName} · {b.type}型</div>
                    </div>
                    <div className="lstat">
                      <div className="lprice">NT${curPx(b).toLocaleString()}</div>
                      <div className="lpct green">+{totPct(b)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </>)}

      </main>

      <footer className="footer">
        資料來源：蝦皮、露天、巴哈、PTT 二手市場｜僅供參考，非投資建議
      </footer>
    </div>
  );
}

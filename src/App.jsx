import { useState, useEffect } from "react";
import "./App.css";

// ── 完整 Beyblade X 陀螺清單 ──
// history 為近6個月每月二手中位價，順序：11月→12月→1月→2月→3月→4月
// hot=true 表示本週漲幅最猛（顯示在首頁榜單）
const ALL_BLADES = [
  // ─── BX 系列（基礎款）───
  { id:1,  series:"BX", code:"BX-01",  name:"翔龍神劍",      fullName:"Dran Sword 3-60F",         type:"攻擊", emoji:"🐉", officialPrice:495, history:[450,460,480,500,540,580] },
  { id:2,  series:"BX", code:"BX-02",  name:"煉獄魔鎌",      fullName:"Hells Scythe 4-60T",       type:"平衡", emoji:"⚰️", officialPrice:495, history:[480,490,510,540,580,620] },
  { id:3,  series:"BX", code:"BX-03",  name:"巫師弩箭",      fullName:"Wizard Arrow 4-80B",       type:"耐久", emoji:"🏹", officialPrice:495, history:[470,485,510,550,600,650] },
  { id:4,  series:"BX", code:"BX-04",  name:"騎士護盾",      fullName:"Knight Shield 3-80N",      type:"防禦", emoji:"🛡️", officialPrice:495, history:[470,480,500,530,570,610] },
  { id:5,  series:"BX", code:"BX-13",  name:"騎士長槍",      fullName:"Knight Lance 4-80HN",      type:"防禦", emoji:"🗡️", officialPrice:495, history:[480,500,530,570,620,670] },
  { id:6,  series:"BX", code:"BX-14",  name:"烈鯊利刃",      fullName:"Shark Edge 3-60LF",        type:"攻擊", emoji:"🦈", officialPrice:495, history:[500,540,600,680,760,840] },
  { id:7,  series:"BX", code:"BX-18",  name:"地獄犬",        fullName:"Hell Scythe 4-70B",        type:"耐久", emoji:"🐺", officialPrice:495, history:[495,510,540,600,680,780] },
  { id:8,  series:"BX", code:"BX-20",  name:"翔龍雙刃",      fullName:"Dran Brave 4-60R",         type:"攻擊", emoji:"🐲", officialPrice:495, history:[510,540,580,640,720,820] },
  { id:9,  series:"BX", code:"BX-21",  name:"煉獄鎖鏈",      fullName:"Hells Chain 5-60HT",       type:"平衡", emoji:"⛓️", officialPrice:495, history:[480,500,540,600,680,770] },
  { id:10, series:"BX", code:"BX-23",  name:"鳳凰",          fullName:"Phoenix Wing 4-70GF",      type:"平衡", emoji:"🦅", officialPrice:495, history:[700,750,800,900,1000,1100] },
  { id:11, series:"BX", code:"BX-25",  name:"官方收納包",    fullName:"Official Carrying Case",   type:"配件", emoji:"💼", officialPrice:1280, history:[1280,1300,1350,1400,1500,1650] },
  { id:12, series:"BX", code:"BX-31",  name:"暴龍節拍",      fullName:"Tyranno Beat 4-70Q",       type:"攻擊", emoji:"🦖", officialPrice:495, history:[470,490,520,560,610,660] },
  { id:13, series:"BX", code:"BX-33",  name:"純白猛虎",      fullName:"Weiss Tiger 3-60U",        type:"平衡", emoji:"🐅", officialPrice:495, history:[490,510,540,580,640,720] },
  { id:14, series:"BX", code:"BX-34",  name:"龍組",          fullName:"Dragoon Legacy 4-60HT",    type:"平衡", emoji:"🐉", officialPrice:660, history:[660,700,780,900,1050,1200] },
  { id:15, series:"BX", code:"BX-35",  name:"漆黑護殼",      fullName:"Black Shell 4-60D",        type:"防禦", emoji:"🖤", officialPrice:495, history:[500,520,560,610,680,760] },
  { id:16, series:"BX", code:"BX-36",  name:"戰鯨波浪",      fullName:"Whale Wave 5-80E",         type:"平衡", emoji:"🐋", officialPrice:495, history:[490,510,560,630,720,830] },
  { id:17, series:"BX", code:"BX-38",  name:"緋紅迦樓羅",    fullName:"Crimson Garuda 4-70TP",    type:"平衡", emoji:"🔥", officialPrice:495, history:[495,520,570,640,720,820] },
  { id:18, series:"BX", code:"BX-39",  name:"神護魔龍",      fullName:"Dran Buster 7-80GP",       type:"平衡", emoji:"🛡️", officialPrice:660, history:[660,690,750,830,930,1050] },
  { id:19, series:"BX", code:"BX-41",  name:"獨角獸",        fullName:"Unicorn Sting 3-70GP",     type:"平衡", emoji:"🦄", officialPrice:495, history:[495,520,600,720,880,1050] },
  { id:20, series:"BX", code:"BX-45",  name:"武士聖劍",      fullName:"Samurai Calibur 6-70M",    type:"平衡", emoji:"⚔️", officialPrice:495, history:[495,540,610,710,830,960] },
  { id:21, series:"BX", code:"BX-49",  name:"翔龍突擊",      fullName:"Dran Strike 4-50FF",       type:"攻擊", emoji:"⚡", officialPrice:495, history:[495,550,640,760,910,1080] },

  // ─── UX 系列（黃金固鎖）───
  { id:22, series:"UX", code:"UX-01",  name:"翔龍破壞劍",    fullName:"Dran Destroyer 1-60A",     type:"攻擊", emoji:"🐉", officialPrice:550, history:[550,580,620,700,820,980] },
  { id:23, series:"UX", code:"UX-02",  name:"煉獄惡鎚",      fullName:"Hells Hammer 3-70H",       type:"平衡", emoji:"🔨", officialPrice:550, history:[540,570,610,680,780,910] },
  { id:24, series:"UX", code:"UX-03",  name:"巫師幻杖",      fullName:"Wizard Arrow 5-70DB",      type:"耐久", emoji:"🪄", officialPrice:550, history:[1100,1150,1200,1350,1500,1600] },
  { id:25, series:"UX", code:"UX-04",  name:"對戰入門套裝U", fullName:"Battle Set DrBu",          type:"套裝", emoji:"📦", officialPrice:1480, history:[1480,1500,1550,1620,1720,1850] },
  { id:26, series:"UX", code:"UX-05",  name:"忍者幻影",      fullName:"Shinobi Shadow",           type:"攻擊", emoji:"🥷", officialPrice:495, history:[490,520,580,670,790,930] },
  { id:27, series:"UX", code:"UX-06",  name:"獅王徽章",      fullName:"Leon Crest 7-60GN",        type:"平衡", emoji:"🦁", officialPrice:495, history:[490,510,560,640,750,890] },
  { id:28, series:"UX", code:"UX-07",  name:"鳳凰炎舵",      fullName:"Phoenix Rudder 9-70G",     type:"耐久", emoji:"🦅", officialPrice:1480, history:[1480,1550,1700,1900,2150,2400] },
  { id:29, series:"UX", code:"UX-08",  name:"白銀戰狼",      fullName:"Silver Wolf 3-80FB",       type:"防禦", emoji:"🐺", officialPrice:550, history:[540,560,600,670,770,890] },
  { id:30, series:"UX", code:"UX-09",  name:"武士之刃",      fullName:"Samurai Saber 2-70L",      type:"攻擊", emoji:"⚔️", officialPrice:550, history:[550,590,650,750,890,1050] },
  { id:31, series:"UX", code:"UX-10",  name:"騎士護甲",      fullName:"Knight Mail 3-85BS",       type:"防禦", emoji:"🛡️", officialPrice:550, history:[540,570,620,700,810,950] },
  { id:32, series:"UX", code:"UX-15",  name:"烈鯊鱗甲",      fullName:"Shark Scale 4-50UF",       type:"攻擊", emoji:"🦈", officialPrice:700, history:[1800,1900,2000,2200,2400,2500], hot:true },
  { id:33, series:"UX", code:"UX-19",  name:"飛彈獅鷲",      fullName:"Bullet Griffon H",         type:"平衡", emoji:"🦅", officialPrice:550, history:[550,580,640,750,910,1100] },
  { id:34, series:"UX", code:"UX-00",  name:"空力天馬",      fullName:"Aero Pegasus 3-70A",       type:"攻擊", emoji:"🐎", officialPrice:660, history:[2200,2400,2700,3100,3500,3300] },

  // ─── CX 系列（CX 軸刃）───
  { id:35, series:"CX", code:"CX-01",  name:"翔龍勇者",      fullName:"Dran Brave S 6-60V",       type:"攻擊", emoji:"🐲", officialPrice:770, history:[770,800,880,1000,1150,1350] },
  { id:36, series:"CX", code:"CX-02",  name:"巫師弧光",      fullName:"Wizard Rod R 4-55LO",      type:"耐久", emoji:"🌟", officialPrice:770, history:[770,810,900,1050,1230,1430] },
  { id:37, series:"CX", code:"CX-05",  name:"煉獄死神",      fullName:"Hells Reaper T 4-70K",     type:"平衡", emoji:"💀", officialPrice:770, history:[770,820,920,1080,1280,1500] },
  { id:38, series:"CX", code:"CX-14",  name:"騎士堡壘",      fullName:"Knight Fort GV 8-70UN",    type:"防禦", emoji:"🏰", officialPrice:770, history:[770,810,880,990,1130,1290] },
  { id:39, series:"CX", code:"CX-17",  name:"戰鯨波浪R",     fullName:"Whale Wave Random",        type:"平衡", emoji:"🐋", officialPrice:495, history:[495,530,600,710,860,1030] },
  { id:40, series:"CX", code:"CX-00",  name:"戰神伏特",      fullName:"Empire Volt",              type:"限定", emoji:"⚡", officialPrice:1980, history:[1980,2100,2400,2800,3300,3800] },
  { id:41, series:"CX", code:"CX-03",  name:"海神",          fullName:"Poseidon Fin 4-80HN",      type:"耐久", emoji:"🔱", officialPrice:770, history:[770,790,830,900,980,1100] },
  { id:42, series:"CX", code:"CX-16",  name:"戰鯨深淵",      fullName:"Abyss Whale",              type:"攻擊", emoji:"🌊", officialPrice:770, history:[770,950,1200,1500,1850,2200], hot:true },

  // ─── BXG / 限定品 ───
  { id:43, series:"BXG",code:"BX-00-25", name:"25週年紀念組",  fullName:"25th Anniversary Set",     type:"限定", emoji:"🏆", officialPrice:2800, history:[2800,3000,3500,4200,4800,5500] },
  { id:44, series:"BXG",code:"BXG-17",   name:"黑金限定軸心",  fullName:"Black Gold APP Limited",   type:"限定", emoji:"⚡", officialPrice:460,  history:[460,600,900,1200,1500,1800], hot:true },
  { id:45, series:"BXG",code:"BXG-21",   name:"風暴神劍",      fullName:"Storm Spriggan 2-70M",     type:"攻擊", emoji:"⚡", officialPrice:550,  history:[550,580,650,760,910,1080] },
  { id:46, series:"BXG",code:"BXG-04",   name:"青翼白虎",      fullName:"Blue Wing Tiger 4-80P",    type:"防禦", emoji:"🐅", officialPrice:550,  history:[550,570,620,700,810,940] },
  { id:47, series:"BXG",code:"BX-30",    name:"爆旋改造手柄",  fullName:"Custom Grip Red",          type:"配件", emoji:"🎮", officialPrice:380,  history:[380,400,440,500,580,670] },
  { id:48, series:"BXG",code:"BX-00-DG", name:"鈷藍魔龍",      fullName:"Dragoon Storm S 4-60RA",   type:"攻擊", emoji:"🐉", officialPrice:990,  history:[990,1050,1180,1380,1620,1900] },
];

const MONTHS  = ["11月","12月","1月","2月","3月","4月"];
const UPDATED = "2026年5月1日";

const pct      = (a,b) => (((b-a)/a)*100).toFixed(1);
const gain     = b => b.history[b.history.length-1] - b.history[0];
const totPct   = b => pct(b.history[0], b.history[b.history.length-1]);
const curPx    = b => b.history[b.history.length-1];
// 本週漲幅 = (4月 - 3月) / 3月
const weekPct  = b => parseFloat(pct(b.history[b.history.length-2], b.history[b.history.length-1]));

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
  const [tracked, setTracked]  = useState(new Set([10,24,32,43,44])); // 預設追蹤五大熱門
  const [search,  setSearch]   = useState("");
  const [selected,setSelected] = useState(null);
  const [tab,     setTab]      = useState("price");
  const [stock,   setStock]    = useState([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockUpdated, setStockUpdated] = useState(null);
  const [listFilter, setListFilter] = useState("ALL");

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

  const selectAll   = () => setTracked(new Set(ALL_BLADES.map(b => b.id)));
  const selectNone  = () => setTracked(new Set());
  const selectSeries = (series) => {
    const ids = ALL_BLADES.filter(b => b.series === series).map(b => b.id);
    setTracked(prev => {
      const n = new Set(prev);
      const allIn = ids.every(id => n.has(id));
      ids.forEach(id => allIn ? n.delete(id) : n.add(id));
      return n;
    });
  };

  const trackedBlades = ALL_BLADES.filter(b => tracked.has(b.id));
  const searchResults = search.trim()
    ? ALL_BLADES.filter(b =>
        b.name.includes(search) ||
        b.code.toLowerCase().includes(search.toLowerCase()) ||
        b.fullName.toLowerCase().includes(search.toLowerCase()))
    : [];

  // 本週漲幅排行（前5名）
  const weeklyTop = [...ALL_BLADES]
    .map(b => ({ ...b, week: weekPct(b) }))
    .sort((a, b) => b.week - a.week)
    .slice(0, 5);

  // 半年漲幅排行（前5名，高到低）
  const halfYearTop = [...ALL_BLADES]
    .map(b => ({ ...b, half: parseFloat(totPct(b)) }))
    .sort((a, b) => b.half - a.half)
    .slice(0, 5);

  // 清單頁過濾
  const filteredList = listFilter === "ALL"
    ? ALL_BLADES
    : ALL_BLADES.filter(b => b.series === listFilter);

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

          {/* 本週漲幅榜 */}
          <div className="weekly-board">
            <div className="wb-title">
              <span className="wb-fire">🔥</span>
              <span>本週漲幅榜</span>
              <span className="wb-sub">3月→4月</span>
            </div>
            <div className="wb-list">
              {weeklyTop.map((b,i)=>(
                <div key={b.id} className="wb-item" onClick={()=>{
                  if (!tracked.has(b.id)) toggle(b.id);
                  setTab("price");
                  setTimeout(() => {
                    const idx = ALL_BLADES.filter(x=>tracked.has(x.id) || x.id===b.id).findIndex(x=>x.id===b.id);
                    setSelected(idx);
                  }, 50);
                }}>
                  <span className={`wb-rank wb-rank-${i+1}`}>#{i+1}</span>
                  <span className="wb-em">{b.emoji}</span>
                  <div className="wb-info">
                    <div className="wb-name">{b.code} {b.name}</div>
                    <div className="wb-price">NT${curPx(b).toLocaleString()}</div>
                  </div>
                  <div className="wb-pct">
                    <div className="wb-num">+{b.week.toFixed(1)}%</div>
                    <div className="wb-lbl">本週</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 半年漲幅榜 */}
          <div className="weekly-board hy-board">
            <div className="wb-title">
              <span className="wb-fire">📈</span>
              <span>半年來漲幅王</span>
              <span className="wb-sub">2025.11 → 2026.04</span>
            </div>
            <div className="wb-list">
              {halfYearTop.map((b,i)=>(
                <div key={b.id} className="wb-item" onClick={()=>{
                  if (!tracked.has(b.id)) toggle(b.id);
                  setTab("price");
                  setTimeout(() => {
                    const idx = ALL_BLADES.filter(x=>tracked.has(x.id) || x.id===b.id).findIndex(x=>x.id===b.id);
                    setSelected(idx);
                  }, 50);
                }}>
                  <span className={`wb-rank wb-rank-${i+1}`}>#{i+1}</span>
                  <span className="wb-em">{b.emoji}</span>
                  <div className="wb-info">
                    <div className="wb-name">{b.code} {b.name}</div>
                    <div className="wb-price">NT${b.history[0].toLocaleString()} → NT${curPx(b).toLocaleString()}</div>
                  </div>
                  <div className="wb-pct">
                    <div className="wb-num">+{b.half.toFixed(1)}%</div>
                    <div className="wb-lbl">半年</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 搜尋 */}
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

          {/* 追蹤卡片 */}
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
            const blade = ALL_BLADES.find(b=>b.code===s.code);
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
            <div className="list-sub">共 {ALL_BLADES.length} 款 · 點擊加入／移除追蹤</div>
          </div>

          {/* 全選控制 */}
          <div className="list-actions">
            <button className="action-btn action-btn--add" onClick={selectAll}>
              ✓ 全選 ({ALL_BLADES.length})
            </button>
            <button className="action-btn" onClick={selectNone}>
              ✕ 全不選
            </button>
            <span className="action-info">已追蹤 {tracked.size} / {ALL_BLADES.length}</span>
          </div>

          {/* 系列過濾 */}
          <div className="list-filter">
            {[
              { id:"ALL", label:"全部" },
              { id:"BX",  label:"BX 系列" },
              { id:"UX",  label:"UX 系列" },
              { id:"CX",  label:"CX 系列" },
              { id:"BXG", label:"限定/配件" },
            ].map(f=>(
              <button key={f.id}
                className={`filter-btn${listFilter===f.id?" filter-btn--on":""}`}
                onClick={()=>setListFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>

          {/* 系列分組顯示 */}
          {(listFilter === "ALL" ? ["BX","UX","CX","BXG"] : [listFilter]).map(series=>{
            const items = filteredList.filter(b=>b.series===series);
            if (items.length === 0) return null;
            const seriesIds = items.map(b=>b.id);
            const allIn = seriesIds.every(id => tracked.has(id));
            return (
              <div key={series} className="series-group">
                <div className="series-label-row">
                  <span className="series-label">{series === "BXG" ? "限定／配件" : `${series} 系列`} ({items.length})</span>
                  <button className="series-toggle" onClick={()=>selectSeries(series)}>
                    {allIn ? "取消全選" : "全選此系列"}
                  </button>
                </div>
                {items.map(b=>{
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
            );
          })}
        </>)}

      </main>

      <footer className="footer">
        資料來源：蝦皮、露天、巴哈、PTT 二手市場｜僅供參考，非投資建議
      </footer>
    </div>
  );
}

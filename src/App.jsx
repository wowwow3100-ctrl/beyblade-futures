import { useState } from "react";
import "./App.css";

const ALL_BLADES = [
  { id:1,  series:"UX", code:"UX-15", name:"鯊魚組",      fullName:"Shark Scale 4-50UF",   type:"攻擊", emoji:"🦈", officialPrice:700,  history:[1200,1400,1700,2000,2200,2500] },
  { id:2,  series:"UX", code:"UX-03", name:"神杖",         fullName:"Wizard Arrow 4-80B",    type:"耐久", emoji:"🪄", officialPrice:550,  history:[900,950,1050,1200,1400,1600] },
  { id:3,  series:"BX", code:"BX-23", name:"鳳凰",         fullName:"Phoenix Wing 4-70GF",   type:"平衡", emoji:"🦅", officialPrice:495,  history:[600,650,700,850,950,1100] },
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
const UPDATED = "2026年4月30日";

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
  const [unit,    setUnit]     = useState(1);
  const [tab,     setTab]      = useState("price");

  const toggle = id => setTracked(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const trackedBlades  = ALL_BLADES.filter(b => tracked.has(b.id));
  const searchResults  = search.trim()
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

      {/* HEADER */}
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

      {/* TABS */}
      <nav className="tabs">
        <button className={`tab${tab==="price"?" tab--on":""}`} onClick={()=>{setTab("price");setSelected(null);}}>
          📈 報價趨勢
        </button>
        <button className={`tab${tab==="list"?" tab--on":""}`} onClick={()=>{setTab("list");setSelected(null);}}>
          📋 陀螺清單
        </button>
      </nav>

      <main className="main">

        {/* ── PRICE TAB ── */}
        {tab==="price" && (<>

          {/* Search bar */}
          <div className="sbar">
            <span>🔍</span>
            <input className="sinput" placeholder="搜尋型號或名稱…"
              value={search} onChange={e=>{setSearch(e.target.value);setSelected(null);}}/>
            {search && <button className="sclear" onClick={()=>setSearch("")}>✕</button>}
          </div>

          {/* Search results */}
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

          {/* Price cards */}
          {trackedBlades.length===0
            ? <div className="empty">去「陀螺清單」加入想追蹤的款式</div>
            : trackedBlades.map((b,i)=>{
                const g     = gain(b);
                const isOpen = selected===i;
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
                        <div className="calc">
                          <div className="calc-title">💰 獲利試算</div>
                          <div className="calc-row">
                            <span>持有：</span>
                            {[1,3,5,10].map(n=>(
                              <button key={n} className={`ubtn${unit===n?" ubtn--on":""}`}
                                onClick={e=>{e.stopPropagation();setUnit(n);}}>
                                {n}顆
                              </button>
                            ))}
                          </div>
                          <div className="calc-result">
                            半年獲利：NT${(g*unit).toLocaleString()}
                            <span className="calc-sub">（{unit}顆）</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
          }
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

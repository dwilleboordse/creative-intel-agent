import { useState, useEffect } from "react";

const C={bg:"#000",surface:"#0d0d0d",surface2:"#161616",surface3:"#1c1c1e",card:"#1c1c1e",border:"rgba(255,255,255,0.08)",borderLight:"rgba(255,255,255,0.12)",text:"#f5f5f7",textSec:"#86868b",textDim:"#48484a",accent:"#0a84ff",green:"#30d158",red:"#ff453a",orange:"#ff9f0a",purple:"#bf5af2",teal:"#64d2ff",yellow:"#ffd60a",pink:"#ff375f"};
const css=`*{margin:0;padding:0;box-sizing:border-box}body{background:${C.bg};font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif;-webkit-font-smoothing:antialiased}::selection{background:${C.accent}40}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${C.textDim};border-radius:3px}@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}@keyframes spin{to{transform:rotate(360deg)}}.fi{animation:fadeIn .3s ease-out forwards}`;
const genId=()=>Math.random().toString(36).substring(2,10);
const MO=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

async function api(path,opts){const r=await fetch(path,opts);return r.json();}

const AGENT_PROMPT=`You are the Weekly Creative Intelligence Agent for a performance creative agency that scales eCommerce brands. Every week you analyze a client's COMPLETE data from their Growth Guide spreadsheet and produce a strategic intelligence briefing.

You receive RAW spreadsheet data from multiple tabs: Creative Roadmap (all ad tests with results), Calendar (revenue/spend targets vs actuals), Top Performing Ads, CRO tests, Meeting Notes, Creators, Awareness levels, and Mass Desires.

Your job: Find the patterns. Connect the dots. Tell the team exactly what to build this week and why.

Respond ONLY in valid JSON:
{
  "executive_summary":"3-4 sentences. Lead with the most critical insight. Be specific, not generic.",
  "performance_snapshot":{"revenue_vs_target":"","spend_status":"","mer_status":"","trend":"improving/stable/declining","headline_metric":""},
  "creative_analysis":{"total_tests":0,"winners":0,"losers":0,"hit_rate":"","hit_rate_trend":"","winning_patterns":["Be SPECIFIC"],"losing_patterns":["Be SPECIFIC"],"biggest_winner":"Name + why","underexplored_angles":[""]},
  "fatigue_alerts":[{"ad_name":"","signal":"","action":""}],
  "weekly_creative_briefs":[{"priority":1,"concept":"","format":"","angle":"","awareness_level":"","hook_direction":"","why":"","reference":""}],
  "cro_insights":{"active_tests":0,"key_finding":"","recommendation":""},
  "awareness_gaps":"Which awareness levels are over/under-tested",
  "desire_alignment":"Are ads targeting the right mass desires?",
  "pending_actions":[""],
  "priorities_this_week":["Priority 1","Priority 2","Priority 3"],
  "risk_flags":[""],
  "client_health":{"score":"green/yellow/red","reason":""}
}

RULES:
- Be brutally specific. Reference actual test names, batch numbers.
- Connect performance to creative decisions.
- Weekly briefs must be immediately actionable with specific references to past winners.
- Use Awareness tab to check if angles hit the right levels.
- Use Mass Desires to check if creative addresses what the market wants.
- Flag if creative pipeline has stalled.
- Call out mismatches between what's winning and what's being produced.`;

// ═══ UI ═══
function Btn({children,onClick,v="sec",s="md",disabled,full}){const vs={pri:{bg:C.accent,c:"#fff",b:"none"},sec:{bg:C.surface3,c:C.text,b:`1px solid ${C.border}`},ghost:{bg:"transparent",c:C.textSec,b:"none"},danger:{bg:C.red+"18",c:C.red,b:`1px solid ${C.red}30`}};const ss={sm:{p:"6px 14px",f:12},md:{p:"10px 20px",f:14},lg:{p:"14px 28px",f:15}};const vv=vs[v]||vs.sec,sz=ss[s]||ss.md;return <button onClick={onClick} disabled={disabled} style={{padding:sz.p,fontSize:sz.f,fontFamily:"inherit",fontWeight:500,borderRadius:10,cursor:disabled?"default":"pointer",opacity:disabled?.35:1,transition:"all .2s",width:full?"100%":"auto",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,background:vv.bg,color:vv.c,border:vv.b}}>{children}</button>;}
function Inp({label,value,onChange,placeholder,compact}){return <div style={{marginBottom:compact?8:12}}>{label&&<label style={{display:"block",fontSize:12,fontWeight:500,color:C.textSec,marginBottom:6}}>{label}</label>}<input value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",fontFamily:"inherit",fontSize:14,color:C.text,background:C.surface2,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 16px",outline:"none"}} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border}/></div>;}
function Pill({children,color}){return <span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:14,background:(color||C.accent)+"15",color:color||C.accent,border:`1px solid ${(color||C.accent)}40`,whiteSpace:"nowrap"}}>{children}</span>;}
function Card({children,style}){return <div style={{background:C.card,borderRadius:14,padding:16,border:`1px solid ${C.border}`,marginBottom:10,...style}}>{children}</div>;}
function Section({title,icon,children,color}){return <Card><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>{icon&&<span style={{fontSize:16}}>{icon}</span>}<div style={{fontSize:14,fontWeight:700,color:color||C.text}}>{title}</div></div>{children}</Card>;}
function ListItem({children,color,bullet}){return <div style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6}}><span style={{color:color||C.accent,fontSize:12,fontWeight:700,marginTop:2,flexShrink:0}}>{bullet||"→"}</span><span style={{fontSize:13,color:C.textSec,lineHeight:1.5}}>{children}</span></div>;}
function Modal({children,onClose,title}){return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}}><div onClick={e=>e.stopPropagation()} className="fi" style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:18,width:"100%",maxWidth:520,maxHeight:"92vh",overflowY:"auto"}}><div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:16,fontWeight:600}}>{title}</span><button onClick={onClose} style={{width:26,height:26,borderRadius:13,background:C.surface3,border:"none",color:C.textSec,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button></div><div style={{padding:20}}>{children}</div></div></div>;}

// ═══ SHEET SUMMARY BUILDER ═══
function buildSheetSummary(name, sd) {
  let s = `CLIENT: ${name}\nDate: ${new Date().toLocaleDateString()}\nTabs: ${sd.tabs?.join(", ")}\n\n`;
  const d = sd.data || {};
  const dumpTab = (key, label, limit) => {
    const rows = d[key]; if (!rows || rows.length < 2) return;
    s += `${label} (${rows.length-1} rows):\nHeaders: ${(rows[0]||[]).join(" | ")}\n`;
    rows.slice(1, limit || 999).forEach((row, i) => {
      const vals = row.map((v, ci) => (rows[0]||[])[ci] ? `${(rows[0]||[])[ci]}: ${v}` : v).filter(v => v && !v.endsWith(": "));
      if (vals.length > 0) s += `${i+1}: ${vals.join(" | ")}\n`;
    });
    s += "\n";
  };
  const dumpRaw = (key, label) => { if (d[key]?.length > 0) { s += label + ":\n"; d[key].forEach(r => { if (r.some(c => c)) s += r.filter(c => c).join(" | ") + "\n"; }); s += "\n"; } };

  dumpRaw("overview", "OVERVIEW");
  if (d.roadmap?.length > 1) dumpTab("roadmap", "CREATIVE ROADMAP"); else if (d.oldRoadmap?.length > 1) dumpTab("oldRoadmap", "CREATIVE ROADMAP");
  dumpTab("ads", "ADS LOG", 20);
  dumpTab("meetings", "MEETINGS", 6);
  dumpTab("topAds", "TOP ADS");
  dumpTab("cro", "CRO");
  dumpRaw("calendar2026", "2026 CALENDAR");
  dumpRaw("calendar2025", "2025 CALENDAR");
  dumpRaw("awareness", "AWARENESS");
  dumpRaw("massDesires", "MASS DESIRES");
  dumpRaw("mechanization", "MECHANIZATION");
  if (d.creators?.length > 2) { s += "CREATORS:\n"; d.creators.slice(2).forEach(r => { if (r.some(c => c)) s += r.filter(c => c).join(" | ") + "\n"; }); }
  return s;
}

// ═══ REPORT VIEW ═══
function IntelReport({ report: r }) {
  if (!r) return null;
  const hc = r.client_health?.score === "green" ? C.green : r.client_health?.score === "red" ? C.red : C.orange;

  return <div className="fi">
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",background:hc+"10",border:`1px solid ${hc}30`,borderRadius:14,marginBottom:16}}>
      <div style={{width:44,height:44,borderRadius:22,background:hc+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{r.client_health?.score==="green"?"✅":r.client_health?.score==="yellow"?"⚠️":"🚨"}</div>
      <div><div style={{fontSize:16,fontWeight:700,color:hc}}>{(r.client_health?.score||"").toUpperCase()}</div><div style={{fontSize:13,color:C.textSec}}>{r.client_health?.reason}</div></div>
    </div>

    <Card style={{background:C.accent+"08",border:`1px solid ${C.accent}20`}}><div style={{fontSize:15,fontWeight:600,marginBottom:8,color:C.accent}}>Executive Summary</div><div style={{fontSize:14,color:C.text,lineHeight:1.7}}>{r.executive_summary}</div></Card>

    {r.performance_snapshot&&<Section title="Performance" icon="📊">
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>{["revenue_vs_target","spend_status","mer_status"].map(k=>r.performance_snapshot[k]&&<Card key={k} style={{flex:1,minWidth:120,marginBottom:0}}><div style={{fontSize:10,color:C.textDim}}>{k.replace(/_/g," ")}</div><div style={{fontSize:15,fontWeight:700,marginTop:2}}>{r.performance_snapshot[k]}</div></Card>)}</div>
      {r.performance_snapshot.trend&&<div style={{fontSize:13,color:C.textSec}}>Trend: <strong style={{color:r.performance_snapshot.trend==="improving"?C.green:r.performance_snapshot.trend==="declining"?C.red:C.textSec}}>{r.performance_snapshot.trend}</strong></div>}
      {r.performance_snapshot.headline_metric&&<div style={{fontSize:14,fontWeight:600,color:C.accent,marginTop:8}}>{r.performance_snapshot.headline_metric}</div>}
    </Section>}

    {r.creative_analysis&&<Section title="Creative Analysis" icon="🎨">
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}><Pill color={C.text}>{r.creative_analysis.total_tests} tests</Pill><Pill color={C.green}>{r.creative_analysis.winners} winners</Pill><Pill color={C.red}>{r.creative_analysis.losers} losers</Pill><Pill color={parseFloat(r.creative_analysis.hit_rate)>=30?C.green:C.orange}>{r.creative_analysis.hit_rate} hit rate</Pill></div>
      {r.creative_analysis.biggest_winner&&<div style={{background:C.green+"08",border:`1px solid ${C.green}20`,borderRadius:10,padding:12,marginBottom:12}}><div style={{fontSize:11,fontWeight:600,color:C.green,marginBottom:4}}>BIGGEST WINNER</div><div style={{fontSize:13,color:C.textSec,lineHeight:1.5}}>{r.creative_analysis.biggest_winner}</div></div>}
      {r.creative_analysis.winning_patterns?.length>0&&<div style={{marginBottom:10}}><div style={{fontSize:11,fontWeight:600,color:C.green,marginBottom:6}}>WINNING PATTERNS</div>{r.creative_analysis.winning_patterns.map((p,i)=><ListItem key={i} color={C.green} bullet="✓">{p}</ListItem>)}</div>}
      {r.creative_analysis.losing_patterns?.length>0&&<div style={{marginBottom:10}}><div style={{fontSize:11,fontWeight:600,color:C.red,marginBottom:6}}>LOSING PATTERNS</div>{r.creative_analysis.losing_patterns.map((p,i)=><ListItem key={i} color={C.red} bullet="✗">{p}</ListItem>)}</div>}
      {r.creative_analysis.underexplored_angles?.length>0&&<div><div style={{fontSize:11,fontWeight:600,color:C.purple,marginBottom:6}}>UNDEREXPLORED</div>{r.creative_analysis.underexplored_angles.map((a,i)=><ListItem key={i} color={C.purple} bullet="?">{a}</ListItem>)}</div>}
    </Section>}

    {(r.awareness_gaps||r.desire_alignment)&&<Section title="Awareness & Desire Alignment" icon="🧠" color={C.purple}>
      {r.awareness_gaps&&<div style={{fontSize:13,color:C.textSec,lineHeight:1.6,marginBottom:8}}><strong style={{color:C.text}}>Awareness gaps:</strong> {r.awareness_gaps}</div>}
      {r.desire_alignment&&<div style={{fontSize:13,color:C.textSec,lineHeight:1.6}}><strong style={{color:C.text}}>Desire alignment:</strong> {r.desire_alignment}</div>}
    </Section>}

    {r.fatigue_alerts?.length>0&&r.fatigue_alerts[0]?.ad_name&&<Section title="Fatigue Alerts" icon="⚠️" color={C.orange}>{r.fatigue_alerts.map((f,i)=><div key={i} style={{background:C.orange+"08",border:`1px solid ${C.orange}20`,borderRadius:10,padding:12,marginBottom:8}}><div style={{fontSize:13,fontWeight:600}}>{f.ad_name}</div><div style={{fontSize:12,color:C.orange,marginTop:4}}>Signal: {f.signal}</div><div style={{fontSize:12,color:C.textSec,marginTop:4}}>Action: {f.action}</div></div>)}</Section>}

    {r.weekly_creative_briefs?.length>0&&<Section title="This Week's Creative Briefs" icon="🎯" color={C.accent}>{r.weekly_creative_briefs.map((b,i)=><div key={i} style={{background:C.surface2,borderRadius:10,padding:14,marginBottom:8,borderLeft:`3px solid ${b.priority===1?C.accent:b.priority===2?C.teal:C.textDim}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{fontSize:12,fontWeight:700,color:"#fff",background:C.accent,width:22,height:22,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center"}}>#{b.priority}</span><span style={{fontSize:14,fontWeight:600}}>{b.concept}</span></div><div style={{display:"flex",gap:4}}><Pill color={C.teal}>{b.format}</Pill>{b.awareness_level&&<Pill color={C.purple}>{b.awareness_level}</Pill>}</div></div>
      <div style={{fontSize:12,color:C.textSec,lineHeight:1.5,marginBottom:4}}><strong style={{color:C.text}}>Angle:</strong> {b.angle}</div>
      <div style={{fontSize:12,color:C.textSec,lineHeight:1.5,marginBottom:4}}><strong style={{color:C.text}}>Hook:</strong> {b.hook_direction}</div>
      <div style={{fontSize:12,color:C.textSec,lineHeight:1.5,marginBottom:4}}><strong style={{color:C.text}}>Why:</strong> {b.why}</div>
      {b.reference&&<div style={{fontSize:11,color:C.textDim}}>Ref: {b.reference}</div>}
    </div>)}</Section>}

    {r.cro_insights&&(r.cro_insights.key_finding||r.cro_insights.recommendation)&&<Section title="CRO" icon="🔬">{r.cro_insights.key_finding&&<div style={{fontSize:13,color:C.textSec,lineHeight:1.5,marginBottom:6}}><strong style={{color:C.text}}>Finding:</strong> {r.cro_insights.key_finding}</div>}{r.cro_insights.recommendation&&<div style={{fontSize:13,color:C.accent}}><strong>Next:</strong> {r.cro_insights.recommendation}</div>}</Section>}

    {r.priorities_this_week?.length>0&&<Section title="Priorities" icon="🔥" color={C.accent}>{r.priorities_this_week.map((p,i)=><div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:8}}><span style={{fontSize:12,fontWeight:700,color:"#fff",background:i===0?C.accent:i===1?C.teal:C.textDim,width:24,height:24,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</span><span style={{fontSize:14,color:C.text,lineHeight:1.5,fontWeight:i===0?600:400}}>{p}</span></div>)}</Section>}

    {r.pending_actions?.length>0&&r.pending_actions[0]&&<Section title="Pending Actions" icon="📋">{r.pending_actions.map((a,i)=><ListItem key={i} color={C.orange} bullet="!">{a}</ListItem>)}</Section>}
    {r.risk_flags?.length>0&&r.risk_flags[0]&&<Section title="Risk Flags" icon="🚩" color={C.red}>{r.risk_flags.map((f,i)=><ListItem key={i} color={C.red} bullet="⚠">{f}</ListItem>)}</Section>}
  </div>;
}

// ═══ MAIN ═══
export default function App(){
  const [clients,setClients]=useState([]);
  const [loaded,setLoaded]=useState(false);
  const [saving,setSaving]=useState(false);
  const [showAdd,setShowAdd]=useState(false);
  const [cName,setCName]=useState("");
  const [cUrl,setCUrl]=useState("");
  const [selected,setSelected]=useState(null);
  const [reports,setReports]=useState([]); // persistent reports for selected client
  const [activeReport,setActiveReport]=useState(null);
  const [step,setStep]=useState("idle");
  const [error,setError]=useState(null);

  useEffect(()=>{api("/api/data").then(d=>{setClients(d.clients||[]);setLoaded(true);});},[]);
  const save=async(list)=>{setClients(list);setSaving(true);await api("/api/data",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({clients:list})});setSaving(false);};

  // Load reports when client selected
  const selectClient=async(cl)=>{
    setSelected(cl);setActiveReport(null);setError(null);setStep("idle");
    try{const d=await api("/api/reports?clientId="+cl.id);setReports(d.reports||[]);
      // Auto-show latest report if exists
      if(d.reports?.length>0)setActiveReport(d.reports[d.reports.length-1].report);
    }catch(e){setReports([]);}
  };

  const addClient=()=>{if(!cName.trim()||!cUrl.trim())return;save([...clients,{id:genId(),name:cName.trim(),sheetUrl:cUrl.trim(),createdAt:new Date().toISOString()}]);setCName("");setCUrl("");setShowAdd(false);};
  const deleteClient=(id)=>{if(confirm("Delete?"))save(clients.filter(c=>c.id!==id));if(selected?.id===id){setSelected(null);setReports([]);}};

  const runIntel=async(client)=>{
    setActiveReport(null);setError(null);
    setStep("fetching");
    try{
      const sd=await api("/api/sheet",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sheetUrl:client.sheetUrl})});
      if(sd.error)throw new Error(sd.error);

      setStep("analyzing");
      const summary=buildSheetSummary(client.name,sd);
      const aRes=await api("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:8000,system:AGENT_PROMPT,messages:[{role:"user",content:`Run weekly creative intelligence. Today is ${new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}.\n\n${summary}`}]})});
      if(aRes.error)throw new Error(typeof aRes.error==="string"?aRes.error:aRes.error.message);

      let text=(aRes.content?.[0]?.text||"").replace(/```json|```/g,"").trim();
      let parsed;
      try{parsed=JSON.parse(text);}catch(e){let f=text;const ob=(f.match(/{/g)||[]).length,cb=(f.match(/}/g)||[]).length;for(let i=0;i<ob-cb;i++)f+="}";const oq=(f.match(/\[/g)||[]).length,cq=(f.match(/\]/g)||[]).length;for(let i=0;i<oq-cq;i++)f+="]";parsed=JSON.parse(f);}

      // Save to KV
      await api("/api/reports",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({clientId:client.id,report:parsed})});

      // Refresh reports list
      const updated=await api("/api/reports?clientId="+client.id);
      setReports(updated.reports||[]);
      setActiveReport(parsed);
      setStep("done");
    }catch(e){setError(e.message);setStep("idle");}
  };

  const reset=()=>{setSelected(null);setReports([]);setActiveReport(null);setStep("idle");setError(null);};

  const latestReport=reports.length>0?reports[reports.length-1]:null;
  const latestAge=latestReport?Math.round((Date.now()-new Date(latestReport.date).getTime())/(1000*60*60))+"h ago":null;

  if(!loaded)return <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><style>{css}</style><div style={{color:C.textDim}}>Loading...</div></div>;

  return <div style={{background:C.bg,minHeight:"100vh",color:C.text}}>
    <style>{css}</style>

    <nav style={{position:"sticky",top:0,zIndex:100,background:"rgba(0,0,0,.72)",backdropFilter:"blur(20px) saturate(180%)",borderBottom:`1px solid ${C.border}`,padding:"0 28px"}}>
      <div style={{maxWidth:900,margin:"0 auto",height:52,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:15,fontWeight:600}}>Creative Intel Agent</span>
          {saving&&<span style={{fontSize:11,color:C.accent,animation:"pulse 1s infinite"}}>Saving</span>}
          {step==="fetching"&&<span style={{fontSize:11,color:C.accent,animation:"pulse 1s infinite"}}>Reading sheet...</span>}
          {step==="analyzing"&&<span style={{fontSize:11,color:C.accent,animation:"pulse 1s infinite"}}>Analyzing...</span>}
        </div>
        <div style={{display:"flex",gap:8}}>
          {selected&&<Btn v="ghost" s="sm" onClick={reset}>Back</Btn>}
          {selected&&step!=="fetching"&&step!=="analyzing"&&<Btn v="pri" s="sm" onClick={()=>runIntel(selected)}>Run Now</Btn>}
          {!selected&&<Btn v="pri" s="sm" onClick={()=>setShowAdd(true)}>Add Client</Btn>}
        </div>
      </div>
    </nav>

    {error&&<div style={{background:C.red+"10",borderBottom:`1px solid ${C.red}25`,padding:"10px 28px"}}><div style={{maxWidth:900,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,color:C.red}}>{error}</span><Btn v="ghost" s="sm" onClick={()=>setError(null)}>Dismiss</Btn></div></div>}

    <div style={{maxWidth:900,margin:"0 auto",padding:"32px 28px"}}>

      {/* CLIENT LIST */}
      {!selected&&<div className="fi">
        <h1 style={{fontSize:32,fontWeight:700,letterSpacing:"-.03em",marginBottom:4}}>Weekly Creative Intelligence</h1>
        <p style={{fontSize:15,color:C.textSec,marginBottom:4}}>Reads live from each client's Google Sheet. Runs automatically every Monday 8am UTC.</p>
        <p style={{fontSize:13,color:C.textDim,marginBottom:24}}>Reports are saved permanently. Open any client to see the latest report instantly.</p>

        {clients.length===0?<Card style={{textAlign:"center",padding:48}}>
          <div style={{fontSize:15,fontWeight:600,color:C.textSec,marginBottom:8}}>No clients yet</div>
          <Btn v="pri" onClick={()=>setShowAdd(true)}>Add Client</Btn>
        </Card>:clients.map(cl=>(
          <div key={cl.id} onClick={()=>selectClient(cl)} style={{background:C.card,borderRadius:14,border:`1px solid ${C.border}`,marginBottom:8,padding:"18px 22px",cursor:"pointer",transition:"border-color .15s,transform .15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.borderLight;e.currentTarget.style.transform="translateY(-1px)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="translateY(0)";}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div><div style={{fontSize:17,fontWeight:600,marginBottom:4}}>{cl.name}</div><div style={{fontSize:12,color:C.textDim}}>{cl.sheetUrl.substring(0,60)}...</div></div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <Btn v="ghost" s="sm" onClick={e=>{e.stopPropagation();deleteClient(cl.id);}}>Delete</Btn>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          </div>
        ))}
      </div>}

      {/* CLIENT SELECTED */}
      {selected&&(step==="fetching"||step==="analyzing")&&<div className="fi" style={{textAlign:"center",padding:"80px 20px"}}>
        <div style={{width:48,height:48,border:`3px solid ${C.accent}`,borderTopColor:"transparent",borderRadius:24,animation:"spin .8s linear infinite",margin:"0 auto 20px"}}/>
        <div style={{fontSize:18,fontWeight:600,marginBottom:8}}>{step==="fetching"?"Reading "+selected.name+"'s sheet":"Analyzing "+selected.name}</div>
        <div style={{fontSize:14,color:C.textSec,animation:"pulse 2s infinite"}}>{step==="fetching"?"Pulling data from Google Sheets...":"Claude analyzing roadmap, calendar, ads, CRO, meetings..."}</div>
      </div>}

      {selected&&(step==="idle"||step==="done")&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <h1 style={{fontSize:24,fontWeight:700,letterSpacing:"-.03em"}}>{selected.name}</h1>
            {latestAge&&<div style={{fontSize:13,color:C.textDim,marginTop:4}}>Latest report: {latestAge}{reports.length>1?` · ${reports.length} reports saved`:""}</div>}
            {!latestReport&&<div style={{fontSize:13,color:C.textDim,marginTop:4}}>No reports yet. Click "Run Now" to generate the first one.</div>}
          </div>
        </div>

        {/* Report History */}
        {reports.length>1&&<div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:600,color:C.textSec,marginBottom:8}}>Report History</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {reports.slice().reverse().map((h,i)=>{
              const isActive=activeReport===h.report;
              const date=new Date(h.date);
              const label=date.toLocaleDateString("en-US",{month:"short",day:"numeric"})+" "+date.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
              const hColor=h.report?.client_health?.score==="green"?C.green:h.report?.client_health?.score==="red"?C.red:C.orange;
              return <button key={i} onClick={()=>setActiveReport(h.report)} style={{padding:"6px 12px",borderRadius:8,border:`1.5px solid ${isActive?C.accent:C.border}`,background:isActive?C.accent+"12":C.surface2,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:8,height:8,borderRadius:4,background:hColor}}/>
                <span style={{fontSize:11,fontWeight:isActive?600:400,color:isActive?C.text:C.textSec}}>{label}</span>
              </button>;
            })}
          </div>
        </div>}

        {/* Active Report */}
        {activeReport&&<IntelReport report={activeReport}/>}
      </div>}
    </div>

    {showAdd&&<Modal title="Add Client" onClose={()=>setShowAdd(false)}>
      <Inp label="Client Name" value={cName} onChange={setCName} placeholder="Brand name"/>
      <Inp label="Google Sheet URL" value={cUrl} onChange={setCUrl} placeholder="https://docs.google.com/spreadsheets/d/..."/>
      <div style={{fontSize:12,color:C.textDim,marginBottom:16,lineHeight:1.5}}>Sheet must be shared as "Anyone with the link can view."<br/>Uses the Growth Guide template structure.</div>
      <Btn v="pri" full onClick={addClient} disabled={!cName.trim()||!cUrl.trim()}>Add Client</Btn>
    </Modal>}

    <footer style={{padding:"24px 28px",textAlign:"center",marginTop:40}}><p style={{fontSize:12,color:C.textDim}}>Creative Intel Agent · Auto-runs Mondays 8am UTC · D-DOUBLEU MEDIA</p></footer>
  </div>;
}

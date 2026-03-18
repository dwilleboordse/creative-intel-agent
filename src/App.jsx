import { useState, useEffect } from "react";

const C={bg:"#000",surface:"#0d0d0d",surface2:"#161616",surface3:"#1c1c1e",card:"#1c1c1e",border:"rgba(255,255,255,0.08)",borderLight:"rgba(255,255,255,0.12)",text:"#f5f5f7",textSec:"#86868b",textDim:"#48484a",accent:"#0a84ff",green:"#30d158",red:"#ff453a",orange:"#ff9f0a",purple:"#bf5af2",teal:"#64d2ff",yellow:"#ffd60a",pink:"#ff375f"};
const css=`*{margin:0;padding:0;box-sizing:border-box}body{background:${C.bg};font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif;-webkit-font-smoothing:antialiased}::selection{background:${C.accent}40}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${C.textDim};border-radius:3px}@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}@keyframes spin{to{transform:rotate(360deg)}}.fi{animation:fadeIn .3s ease-out forwards}`;
const genId=()=>Math.random().toString(36).substring(2,10);

async function api(path,opts){const r=await fetch(path,opts);return r.json();}

const AGENT_PROMPT=`You are the Weekly Creative Intelligence Agent for D-DOUBLEU MEDIA, a performance creative agency scaling eCommerce brands. You analyze a client's complete Growth Guide spreadsheet and produce a comprehensive intelligence report.

You receive RAW data from: Creative Roadmap (all tests with results/learnings), Ads Log (daily media buying changes), Top Performing Ads, CRO tests, 2025 + 2026 Calendar (revenue/spend targets vs actuals, MER), Key Events, Creators, Awareness levels, Mass Desires, and Mechanization.

IMPORTANT: Analyze ALL data thoroughly. Do not skip or summarize loosely. Reference specific test names, dates, numbers.

Respond ONLY in valid JSON:
{
  "executive_summary": "4-6 sentences. Lead with the most critical finding. Include specific numbers. This should read like a strategic briefing, not a generic overview.",

  "performance": {
    "current_month": {
      "month": "Name",
      "revenue_target": "$X",
      "revenue_actual": "$X or 'No data yet'",
      "revenue_vs_target": "+X% ahead / -X% behind / No data",
      "spend_target": "$X",
      "spend_actual": "$X or 'No data yet'",
      "spend_vs_target": "+X% ahead / -X% behind / No data",
      "mer_target": "X.Xx",
      "mer_actual": "X.Xx or 'No data'",
      "mer_status": "Above/below/on target",
      "gross_profit": "$X or 'N/A'",
      "daily_revenue_target": "$X",
      "daily_spend_target": "$X"
    },
    "year_to_date": {
      "total_revenue": "$X",
      "total_spend": "$X",
      "avg_mer": "X.Xx",
      "total_gross_profit": "$X",
      "yearly_revenue_target": "$X",
      "yearly_pacing": "On pace / ahead / behind by X%"
    },
    "monthly_trend": [
      {"month": "Jan", "revenue": "$X", "spend": "$X", "mer": "X.Xx", "gross": "$X"}
    ],
    "yoy_comparison": "Compare 2026 actuals vs 2025 actuals for same period. Specific % changes.",
    "trend_direction": "improving / stable / declining",
    "performance_commentary": "2-3 sentences analyzing the performance trend. Connect spend efficiency to revenue growth. Flag any concerning patterns."
  },

  "creative_roadmap_breakdown": {
    "total_tests": 0,
    "total_winners": 0,
    "total_losers": 0,
    "total_raw": 0,
    "total_in_progress": 0,
    "hit_rate": "X%",
    "hit_rate_assessment": "Strong/Average/Weak — explain why and what a good hit rate looks like for this brand",
    "tests": [
      {
        "name": "Test concept name",
        "batch": "Batch number",
        "author": "Who created it",
        "ad_type": "UGC / Static / etc",
        "awareness_level": "Level if available",
        "result": "Winning / Losing / Raw / In Progress",
        "learnings": "Key learning from this test",
        "status": "Done / Working / etc"
      }
    ],
    "winning_patterns": ["Be VERY specific: which ad types, hooks, awareness levels, personas win. Reference actual test names."],
    "losing_patterns": ["Be VERY specific: what fails and the common thread. Reference actual test names."],
    "biggest_winner": {"name": "Test name", "why_it_works": "Detailed breakdown connecting to awareness level, desire, mechanism"},
    "gaps_in_testing": ["What ad types, awareness levels, personas, or angles have NOT been tested yet"],
    "velocity": "X tests per week/month — is this fast enough?",
    "velocity_assessment": "Pipeline is healthy / stalling / needs acceleration"
  },

  "top_performing_ads": [
    {"name": "Ad name", "delivery": "Status", "spend": "$X", "assessment": "Why this ad works / is it fatiguing?"}
  ],

  "fatigue_alerts": [
    {"ad_name": "Name", "signal": "Specific signal", "urgency": "high/medium/low", "action": "What to do about it"}
  ],

  "weekly_creative_briefs": [
    {
      "priority": 1,
      "concept": "Concept name",
      "format": "UGC / Static / Brand",
      "angle": "Strategic angle tied to awareness + desire",
      "awareness_level": "Unaware / Problem / Solution / Product / Most Aware",
      "persona": "Target persona if applicable",
      "hook_direction": "What the hook needs to accomplish — be specific",
      "body_direction": "What the body/middle of the ad should do",
      "cta_direction": "How to close",
      "why_this_week": "Why THIS creative THIS week — connect to data",
      "reference": "Which past test to iterate on, or 'net new'",
      "expected_impact": "What this should achieve if it works"
    }
  ],

  "cro_insights": {
    "total_tests": 0,
    "winning": 0,
    "losing": 0,
    "tests": [{"concept": "Name", "result": "Win/Loss/Active", "learning": "Key insight"}],
    "key_finding": "Most important CRO learning right now",
    "next_recommendation": "What to test next and why"
  },

  "awareness_analysis": {
    "levels_tested": {"unaware": 0, "problem_aware": 0, "solution_aware": 0, "product_aware": 0, "most_aware": 0},
    "gaps": "Which levels are over/under-tested. Be specific about what's missing.",
    "recommendation": "Which awareness level to prioritize next and why"
  },

  "desire_alignment": {
    "mass_desires_identified": ["List of desires from the Mass Desires tab"],
    "desires_addressed_in_creative": ["Which desires current ads are hitting"],
    "desires_not_addressed": ["Which desires are being ignored"],
    "recommendation": "Which unaddressed desire to target next"
  },

  "media_buying_notes": {
    "recent_changes": ["Summary of recent changes from the Ads Log"],
    "channel_status": {"facebook": "Status/notes", "tiktok": "Status/notes", "applovin": "Status/notes", "google": "Status/notes"},
    "recommendation": "What the media buying team should focus on this week"
  },

  "upcoming_events": ["Key events from the Key Events tab that are coming up and need preparation"],

  "pending_actions": ["Unresolved action points from meetings"],

  "priorities_this_week": [
    {"priority": 1, "action": "Most impactful thing to do", "owner": "Media Buying / Creative / Ops / Client", "why": "Why this is #1"},
    {"priority": 2, "action": "", "owner": "", "why": ""},
    {"priority": 3, "action": "", "owner": "", "why": ""},
    {"priority": 4, "action": "", "owner": "", "why": ""},
    {"priority": 5, "action": "", "owner": "", "why": ""}
  ],

  "risk_flags": [
    {"flag": "Description", "severity": "high/medium/low", "mitigation": "What to do"}
  ],

  "client_health": {
    "score": "green / yellow / red",
    "reason": "1-2 sentences",
    "30_day_outlook": "Where this client is heading if nothing changes"
  }
}

ANALYSIS RULES:
- Reference SPECIFIC test names, batch numbers, dates, dollar amounts from the data.
- The creative roadmap breakdown must list EVERY test — do not skip or summarize.
- Performance section: extract actual numbers from the calendar tabs. Calculate MER, gross profit, YoY changes.
- Connect dots: if MER dropped, which creative changes or fatigue caused it. If revenue is behind, is it a spend problem or an efficiency problem?
- Weekly briefs: 5-8 briefs, each immediately actionable with hook direction, body direction, and CTA direction.
- Priorities must have owners (Media Buying, Creative Strategy, Operations, or Client).
- Risk flags must have severity and mitigation.
- If data is sparse for a section, say so explicitly — don't fill with generic advice.`;

// ═══ UI ═══
function Btn({children,onClick,v="sec",s="md",disabled,full}){const vs={pri:{bg:C.accent,c:"#fff",b:"none"},sec:{bg:C.surface3,c:C.text,b:`1px solid ${C.border}`},ghost:{bg:"transparent",c:C.textSec,b:"none"},danger:{bg:C.red+"18",c:C.red,b:`1px solid ${C.red}30`}};const ss={sm:{p:"6px 14px",f:12},md:{p:"10px 20px",f:14},lg:{p:"14px 28px",f:15}};const vv=vs[v]||vs.sec,sz=ss[s]||ss.md;return <button onClick={onClick} disabled={disabled} style={{padding:sz.p,fontSize:sz.f,fontFamily:"inherit",fontWeight:500,borderRadius:10,cursor:disabled?"default":"pointer",opacity:disabled?.35:1,transition:"all .2s",width:full?"100%":"auto",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,background:vv.bg,color:vv.c,border:vv.b}}>{children}</button>;}
function Inp({label,value,onChange,placeholder}){return <div style={{marginBottom:12}}>{label&&<label style={{display:"block",fontSize:12,fontWeight:500,color:C.textSec,marginBottom:6}}>{label}</label>}<input value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",fontFamily:"inherit",fontSize:14,color:C.text,background:C.surface2,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 16px",outline:"none"}} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border}/></div>;}
function Pill({children,color}){return <span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:14,background:(color||C.accent)+"15",color:color||C.accent,border:`1px solid ${(color||C.accent)}40`,whiteSpace:"nowrap"}}>{children}</span>;}
function Card({children,style}){return <div style={{background:C.card,borderRadius:14,padding:16,border:`1px solid ${C.border}`,marginBottom:10,...style}}>{children}</div>;}
function Section({title,icon,children,color}){return <Card><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>{icon&&<span style={{fontSize:16}}>{icon}</span>}<div style={{fontSize:14,fontWeight:700,color:color||C.text}}>{title}</div></div>{children}</Card>;}
function LI({children,color,bullet}){return <div style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6}}><span style={{color:color||C.accent,fontSize:12,fontWeight:700,marginTop:2,flexShrink:0}}>{bullet||"→"}</span><span style={{fontSize:13,color:C.textSec,lineHeight:1.5}}>{children}</span></div>;}
function Modal({children,onClose,title}){return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}}><div onClick={e=>e.stopPropagation()} className="fi" style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:18,width:"100%",maxWidth:520,maxHeight:"92vh",overflowY:"auto"}}><div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:16,fontWeight:600}}>{title}</span><button onClick={onClose} style={{width:26,height:26,borderRadius:13,background:C.surface3,border:"none",color:C.textSec,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button></div><div style={{padding:20}}>{children}</div></div></div>;}

// ═══ SHEET SUMMARY ═══
function buildSheetSummary(name, sd) {
  let s = `CLIENT: ${name}\nDate: ${new Date().toLocaleDateString()}\nTabs: ${sd.tabs?.join(", ")}\n\n`;
  const d = sd.data || {};
  const dumpTab = (key, label, limit) => { const rows = d[key]; if (!rows || rows.length < 2) return; s += `${label} (${rows.length-1} rows):\nHeaders: ${(rows[0]||[]).join(" | ")}\n`; rows.slice(1, limit || 999).forEach((row, i) => { const vals = row.map((v, ci) => (rows[0]||[])[ci] ? `${(rows[0]||[])[ci]}: ${v}` : v).filter(v => v && !v.endsWith(": ")); if (vals.length > 0) s += `${i+1}: ${vals.join(" | ")}\n`; }); s += "\n"; };
  const dumpRaw = (key, label) => { if (d[key]?.length > 0) { s += label + ":\n"; d[key].forEach(r => { if (r.some(c => c)) s += r.filter(c => c).join(" | ") + "\n"; }); s += "\n"; } };

  dumpRaw("overview", "OVERVIEW");
  if (d.roadmap?.length > 1) dumpTab("roadmap", "CREATIVE ROADMAP");
  dumpTab("ads", "ADS LOG", 30);
  dumpTab("meetings", "MEETINGS", 6);
  dumpTab("topAds", "TOP PERFORMING ADS");
  dumpTab("cro", "CRO TESTS");
  dumpRaw("calendar2026", "2026 CALENDAR");
  dumpRaw("calendar2025", "2025 CALENDAR");
  dumpRaw("keyEvents", "KEY EVENTS");
  dumpRaw("awareness", "AWARENESS LEVELS");
  dumpRaw("massDesires", "MASS DESIRES");
  dumpRaw("mechanization", "MECHANIZATION");
  if (d.creators?.length > 2) { s += "CREATORS:\n"; d.creators.slice(2).forEach(r => { if (r.some(c => c)) s += r.filter(c => c).join(" | ") + "\n"; }); }
  return s;
}

// ═══ REPORT UI ═══
function IntelReport({ report: r }) {
  if (!r) return null;
  const hc = r.client_health?.score === "green" ? C.green : r.client_health?.score === "red" ? C.red : C.orange;

  return <div className="fi">
    {/* Health */}
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",background:hc+"10",border:`1px solid ${hc}30`,borderRadius:14,marginBottom:16}}>
      <div style={{width:44,height:44,borderRadius:22,background:hc+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{r.client_health?.score==="green"?"✅":r.client_health?.score==="yellow"?"⚠️":"🚨"}</div>
      <div style={{flex:1}}><div style={{fontSize:16,fontWeight:700,color:hc}}>{(r.client_health?.score||"").toUpperCase()}</div><div style={{fontSize:13,color:C.textSec}}>{r.client_health?.reason}</div>
      {r.client_health?.["30_day_outlook"]&&<div style={{fontSize:12,color:C.textDim,marginTop:4}}>30-day outlook: {r.client_health["30_day_outlook"]}</div>}</div>
    </div>

    {/* Summary */}
    <Card style={{background:C.accent+"08",border:`1px solid ${C.accent}20`}}><div style={{fontSize:15,fontWeight:600,marginBottom:8,color:C.accent}}>Executive Summary</div><div style={{fontSize:14,color:C.text,lineHeight:1.7}}>{r.executive_summary}</div></Card>

    {/* Performance */}
    {r.performance&&<Section title="Performance" icon="📊">
      {r.performance.current_month&&<div style={{marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>{r.performance.current_month.month} — Current Month</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[["Revenue Target",r.performance.current_month.revenue_target],["Revenue Actual",r.performance.current_month.revenue_actual],["vs Target",r.performance.current_month.revenue_vs_target],["Spend Target",r.performance.current_month.spend_target],["Spend Actual",r.performance.current_month.spend_actual],["MER Target",r.performance.current_month.mer_target],["MER Actual",r.performance.current_month.mer_actual]].filter(([,v])=>v&&v!=="N/A").map(([l,v],i)=>
            <Card key={i} style={{flex:1,minWidth:100,marginBottom:0}}><div style={{fontSize:10,color:C.textDim}}>{l}</div><div style={{fontSize:15,fontWeight:700,marginTop:2}}>{v}</div></Card>
          )}
        </div>
      </div>}
      {r.performance.year_to_date&&<div style={{marginBottom:12}}>
        <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>Year to Date</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[["Total Revenue",r.performance.year_to_date.total_revenue],["Total Spend",r.performance.year_to_date.total_spend],["Avg MER",r.performance.year_to_date.avg_mer],["Gross Profit",r.performance.year_to_date.total_gross_profit],["Yearly Pacing",r.performance.year_to_date.yearly_pacing]].filter(([,v])=>v).map(([l,v],i)=>
            <Card key={i} style={{flex:1,minWidth:100,marginBottom:0}}><div style={{fontSize:10,color:C.textDim}}>{l}</div><div style={{fontSize:15,fontWeight:700,marginTop:2}}>{v}</div></Card>
          )}
        </div>
      </div>}
      {r.performance.monthly_trend?.length>0&&<div style={{marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:600,color:C.textSec,marginBottom:6}}>Monthly Trend</div>
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
          <thead><tr>{["Month","Revenue","Spend","MER","Gross"].map(h=><th key={h} style={{padding:"4px 8px",textAlign:"left",color:C.textDim,borderBottom:`1px solid ${C.border}`}}>{h}</th>)}</tr></thead>
          <tbody>{r.performance.monthly_trend.map((m,i)=><tr key={i}>{[m.month,m.revenue,m.spend,m.mer,m.gross].map((v,j)=><td key={j} style={{padding:"4px 8px",color:C.textSec,borderBottom:`1px solid ${C.border}`}}>{v||"—"}</td>)}</tr>)}</tbody>
        </table></div>
      </div>}
      {r.performance.yoy_comparison&&<div style={{fontSize:13,color:C.textSec,lineHeight:1.5,marginBottom:8}}><strong style={{color:C.text}}>YoY:</strong> {r.performance.yoy_comparison}</div>}
      {r.performance.performance_commentary&&<div style={{fontSize:13,color:C.text,lineHeight:1.6,background:C.surface2,borderRadius:8,padding:10}}>{r.performance.performance_commentary}</div>}
    </Section>}

    {/* Creative Roadmap Breakdown */}
    {r.creative_roadmap_breakdown&&<Section title="Creative Roadmap" icon="🎨">
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
        <Pill color={C.text}>{r.creative_roadmap_breakdown.total_tests} tests</Pill>
        <Pill color={C.green}>{r.creative_roadmap_breakdown.total_winners} winners</Pill>
        <Pill color={C.red}>{r.creative_roadmap_breakdown.total_losers} losers</Pill>
        <Pill color={C.orange}>{r.creative_roadmap_breakdown.total_raw || 0} raw</Pill>
        <Pill color={C.accent}>{r.creative_roadmap_breakdown.total_in_progress || 0} in progress</Pill>
        <Pill color={parseFloat(r.creative_roadmap_breakdown.hit_rate)>=30?C.green:C.orange}>{r.creative_roadmap_breakdown.hit_rate} hit rate</Pill>
      </div>
      {r.creative_roadmap_breakdown.hit_rate_assessment&&<div style={{fontSize:13,color:C.textSec,lineHeight:1.5,marginBottom:12}}>{r.creative_roadmap_breakdown.hit_rate_assessment}</div>}
      {r.creative_roadmap_breakdown.velocity&&<div style={{fontSize:12,color:C.textDim,marginBottom:12}}>Velocity: {r.creative_roadmap_breakdown.velocity} — <span style={{color:r.creative_roadmap_breakdown.velocity_assessment?.includes("healthy")?C.green:C.orange}}>{r.creative_roadmap_breakdown.velocity_assessment}</span></div>}

      {/* All Tests */}
      {r.creative_roadmap_breakdown.tests?.length>0&&<div style={{marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:600,color:C.textSec,marginBottom:6}}>All Tests ({r.creative_roadmap_breakdown.tests.length})</div>
        {r.creative_roadmap_breakdown.tests.map((t,i)=>{
          const rc=t.result==="Winning"||t.result?.includes("Winning")?C.green:t.result==="Losing"||t.result?.includes("Losing")?C.red:t.result?.includes("Raw")?C.orange:C.textDim;
          return <div key={i} style={{background:C.surface2,borderRadius:8,padding:"8px 12px",marginBottom:4,borderLeft:`3px solid ${rc}`}}>
            <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
              <Pill color={rc}>{t.result||"?"}</Pill>
              <span style={{fontSize:13,fontWeight:600}}>{t.name||"Untitled"}</span>
              {t.batch&&<span style={{fontSize:10,color:C.textDim}}>{t.batch}</span>}
              {t.ad_type&&<span style={{fontSize:10,color:C.teal}}>{t.ad_type}</span>}
              {t.awareness_level&&<span style={{fontSize:10,color:C.purple}}>{t.awareness_level}</span>}
              {t.author&&<span style={{fontSize:10,color:C.textDim}}>by {t.author}</span>}
            </div>
            {t.learnings&&<div style={{fontSize:12,color:C.textSec,marginTop:4,lineHeight:1.4}}>{t.learnings}</div>}
          </div>;
        })}
      </div>}

      {r.creative_roadmap_breakdown.biggest_winner?.name&&<div style={{background:C.green+"08",border:`1px solid ${C.green}20`,borderRadius:10,padding:12,marginBottom:12}}><div style={{fontSize:11,fontWeight:600,color:C.green,marginBottom:4}}>BIGGEST WINNER: {r.creative_roadmap_breakdown.biggest_winner.name}</div><div style={{fontSize:13,color:C.textSec,lineHeight:1.5}}>{r.creative_roadmap_breakdown.biggest_winner.why_it_works}</div></div>}
      {r.creative_roadmap_breakdown.winning_patterns?.length>0&&<div style={{marginBottom:10}}><div style={{fontSize:11,fontWeight:600,color:C.green,marginBottom:6}}>WINNING PATTERNS</div>{r.creative_roadmap_breakdown.winning_patterns.map((p,i)=><LI key={i} color={C.green} bullet="✓">{p}</LI>)}</div>}
      {r.creative_roadmap_breakdown.losing_patterns?.length>0&&<div style={{marginBottom:10}}><div style={{fontSize:11,fontWeight:600,color:C.red,marginBottom:6}}>LOSING PATTERNS</div>{r.creative_roadmap_breakdown.losing_patterns.map((p,i)=><LI key={i} color={C.red} bullet="✗">{p}</LI>)}</div>}
      {r.creative_roadmap_breakdown.gaps_in_testing?.length>0&&<div><div style={{fontSize:11,fontWeight:600,color:C.purple,marginBottom:6}}>GAPS IN TESTING</div>{r.creative_roadmap_breakdown.gaps_in_testing.map((g,i)=><LI key={i} color={C.purple} bullet="?">{g}</LI>)}</div>}
    </Section>}

    {/* Top Performing Ads */}
    {r.top_performing_ads?.length>0&&<Section title="Top Performing Ads" icon="🏆">
      {r.top_performing_ads.map((a,i)=><div key={i} style={{background:C.surface2,borderRadius:8,padding:"8px 12px",marginBottom:4}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,fontWeight:600}}>{a.name}</span><div style={{display:"flex",gap:6}}>{a.delivery&&<Pill color={C.teal}>{a.delivery}</Pill>}{a.spend&&<span style={{fontSize:12,color:C.accent}}>{a.spend}</span>}</div></div>
        {a.assessment&&<div style={{fontSize:12,color:C.textSec,marginTop:4}}>{a.assessment}</div>}
      </div>)}
    </Section>}

    {/* Awareness & Desires */}
    {(r.awareness_analysis||r.desire_alignment)&&<Section title="Awareness & Desire Analysis" icon="🧠" color={C.purple}>
      {r.awareness_analysis&&<div style={{marginBottom:12}}>
        {r.awareness_analysis.levels_tested&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
          {Object.entries(r.awareness_analysis.levels_tested).map(([k,v])=><Pill key={k} color={v>0?C.purple:C.textDim}>{k.replace("_"," ")}: {v}</Pill>)}
        </div>}
        {r.awareness_analysis.gaps&&<div style={{fontSize:13,color:C.textSec,lineHeight:1.5,marginBottom:6}}><strong style={{color:C.text}}>Gaps:</strong> {r.awareness_analysis.gaps}</div>}
        {r.awareness_analysis.recommendation&&<div style={{fontSize:13,color:C.accent}}>{r.awareness_analysis.recommendation}</div>}
      </div>}
      {r.desire_alignment&&<div>
        {r.desire_alignment.desires_not_addressed?.length>0&&<div style={{marginBottom:6}}><div style={{fontSize:11,fontWeight:600,color:C.orange,marginBottom:4}}>UNADDRESSED DESIRES</div>{r.desire_alignment.desires_not_addressed.map((d,i)=><LI key={i} color={C.orange} bullet="!">{d}</LI>)}</div>}
        {r.desire_alignment.recommendation&&<div style={{fontSize:13,color:C.accent}}>{r.desire_alignment.recommendation}</div>}
      </div>}
    </Section>}

    {/* Fatigue */}
    {r.fatigue_alerts?.length>0&&r.fatigue_alerts[0]?.ad_name&&<Section title="Fatigue Alerts" icon="⚠️" color={C.orange}>
      {r.fatigue_alerts.map((f,i)=><div key={i} style={{background:C.orange+"08",border:`1px solid ${C.orange}20`,borderRadius:10,padding:12,marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,fontWeight:600}}>{f.ad_name}</span>{f.urgency&&<Pill color={f.urgency==="high"?C.red:f.urgency==="medium"?C.orange:C.textDim}>{f.urgency}</Pill>}</div>
        <div style={{fontSize:12,color:C.orange,marginTop:4}}>{f.signal}</div>
        <div style={{fontSize:12,color:C.textSec,marginTop:4}}>Action: {f.action}</div>
      </div>)}
    </Section>}

    {/* Creative Briefs */}
    {r.weekly_creative_briefs?.length>0&&<Section title="This Week's Creative Briefs" icon="🎯" color={C.accent}>
      {r.weekly_creative_briefs.map((b,i)=><div key={i} style={{background:C.surface2,borderRadius:10,padding:14,marginBottom:8,borderLeft:`3px solid ${b.priority<=2?C.accent:b.priority<=4?C.teal:C.textDim}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{fontSize:12,fontWeight:700,color:"#fff",background:C.accent,width:22,height:22,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center"}}>#{b.priority}</span><span style={{fontSize:14,fontWeight:600}}>{b.concept}</span></div>
          <div style={{display:"flex",gap:4}}><Pill color={C.teal}>{b.format}</Pill>{b.awareness_level&&<Pill color={C.purple}>{b.awareness_level}</Pill>}{b.persona&&<Pill color={C.pink}>{b.persona}</Pill>}</div>
        </div>
        {b.angle&&<div style={{fontSize:12,color:C.textSec,lineHeight:1.5,marginBottom:3}}><strong style={{color:C.text}}>Angle:</strong> {b.angle}</div>}
        {b.hook_direction&&<div style={{fontSize:12,color:C.textSec,lineHeight:1.5,marginBottom:3}}><strong style={{color:C.text}}>Hook:</strong> {b.hook_direction}</div>}
        {b.body_direction&&<div style={{fontSize:12,color:C.textSec,lineHeight:1.5,marginBottom:3}}><strong style={{color:C.text}}>Body:</strong> {b.body_direction}</div>}
        {b.cta_direction&&<div style={{fontSize:12,color:C.textSec,lineHeight:1.5,marginBottom:3}}><strong style={{color:C.text}}>CTA:</strong> {b.cta_direction}</div>}
        {b.why_this_week&&<div style={{fontSize:12,color:C.textSec,lineHeight:1.5,marginBottom:3}}><strong style={{color:C.text}}>Why:</strong> {b.why_this_week}</div>}
        {b.reference&&<div style={{fontSize:11,color:C.textDim}}>Ref: {b.reference}</div>}
        {b.expected_impact&&<div style={{fontSize:11,color:C.green,marginTop:4}}>Expected: {b.expected_impact}</div>}
      </div>)}
    </Section>}

    {/* Media Buying */}
    {r.media_buying_notes&&<Section title="Media Buying Notes" icon="📡">
      {r.media_buying_notes.recent_changes?.length>0&&<div style={{marginBottom:8}}>{r.media_buying_notes.recent_changes.map((c,i)=><LI key={i}>{c}</LI>)}</div>}
      {r.media_buying_notes.channel_status&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
        {Object.entries(r.media_buying_notes.channel_status).filter(([,v])=>v).map(([k,v])=><div key={k} style={{background:C.surface2,borderRadius:8,padding:"6px 10px",flex:1,minWidth:120}}><div style={{fontSize:10,fontWeight:600,color:C.teal}}>{k.toUpperCase()}</div><div style={{fontSize:12,color:C.textSec,marginTop:2}}>{v}</div></div>)}
      </div>}
      {r.media_buying_notes.recommendation&&<div style={{fontSize:13,color:C.accent}}>{r.media_buying_notes.recommendation}</div>}
    </Section>}

    {/* CRO */}
    {r.cro_insights&&(r.cro_insights.key_finding||r.cro_insights.tests?.length>0)&&<Section title="CRO" icon="🔬">
      {r.cro_insights.tests?.length>0&&<div style={{marginBottom:8}}>{r.cro_insights.tests.map((t,i)=><div key={i} style={{background:C.surface2,borderRadius:8,padding:"6px 10px",marginBottom:4}}><div style={{display:"flex",gap:6,alignItems:"center"}}><Pill color={t.result?.includes("Win")?C.green:t.result?.includes("Los")?C.red:C.textDim}>{t.result}</Pill><span style={{fontSize:13,fontWeight:600}}>{t.concept}</span></div>{t.learning&&<div style={{fontSize:12,color:C.textSec,marginTop:4}}>{t.learning}</div>}</div>)}</div>}
      {r.cro_insights.key_finding&&<div style={{fontSize:13,color:C.textSec,lineHeight:1.5,marginBottom:6}}><strong style={{color:C.text}}>Key finding:</strong> {r.cro_insights.key_finding}</div>}
      {r.cro_insights.next_recommendation&&<div style={{fontSize:13,color:C.accent}}><strong>Next:</strong> {r.cro_insights.next_recommendation}</div>}
    </Section>}

    {/* Upcoming Events */}
    {r.upcoming_events?.length>0&&r.upcoming_events[0]&&<Section title="Upcoming Events" icon="📅">{r.upcoming_events.map((e,i)=><LI key={i} color={C.teal} bullet="📌">{e}</LI>)}</Section>}

    {/* Priorities */}
    {r.priorities_this_week?.length>0&&<Section title="Priorities This Week" icon="🔥" color={C.accent}>
      {r.priorities_this_week.map((p,i)=><div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:10}}>
        <span style={{fontSize:12,fontWeight:700,color:"#fff",background:i<2?C.accent:i<4?C.teal:C.textDim,width:24,height:24,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{p.priority||i+1}</span>
        <div style={{flex:1}}><div style={{fontSize:14,fontWeight:i<2?600:400,color:C.text,lineHeight:1.5}}>{p.action}</div>
        <div style={{fontSize:11,color:C.textDim,marginTop:2}}>{p.owner&&<span style={{color:C.teal}}>Owner: {p.owner}</span>}{p.why&&<span> — {p.why}</span>}</div></div>
      </div>)}
    </Section>}

    {r.pending_actions?.length>0&&r.pending_actions[0]&&<Section title="Pending Actions" icon="📋">{r.pending_actions.map((a,i)=><LI key={i} color={C.orange} bullet="!">{a}</LI>)}</Section>}

    {r.risk_flags?.length>0&&r.risk_flags[0]?.flag&&<Section title="Risk Flags" icon="🚩" color={C.red}>
      {r.risk_flags.map((f,i)=><div key={i} style={{background:C.red+"06",border:`1px solid ${C.red}15`,borderRadius:8,padding:"8px 12px",marginBottom:4}}>
        <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:C.textSec}}>{f.flag}</span>{f.severity&&<Pill color={f.severity==="high"?C.red:f.severity==="medium"?C.orange:C.textDim}>{f.severity}</Pill>}</div>
        {f.mitigation&&<div style={{fontSize:12,color:C.textDim,marginTop:4}}>Mitigation: {f.mitigation}</div>}
      </div>)}
    </Section>}
  </div>;
}

// ═══ MAIN ═══
export default function App(){
  const [clients,setClients]=useState([]);const [loaded,setLoaded]=useState(false);const [saving,setSaving]=useState(false);
  const [showAdd,setShowAdd]=useState(false);const [cName,setCName]=useState("");const [cUrl,setCUrl]=useState("");
  const [selected,setSelected]=useState(null);const [reports,setReports]=useState([]);
  const [activeReport,setActiveReport]=useState(null);const [step,setStep]=useState("idle");const [error,setError]=useState(null);

  useEffect(()=>{api("/api/data").then(d=>{setClients(d.clients||[]);setLoaded(true);});},[]);
  const save=async(list)=>{setClients(list);setSaving(true);await api("/api/data",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({clients:list})});setSaving(false);};

  const selectClient=async(cl)=>{
    setSelected(cl);setActiveReport(null);setError(null);setStep("idle");
    try{const d=await api("/api/reports?clientId="+cl.id);setReports(d.reports||[]);
      if(d.reports?.length>0)setActiveReport(d.reports[d.reports.length-1].report);
    }catch(e){setReports([]);}
  };

  const addClient=()=>{if(!cName.trim()||!cUrl.trim())return;save([...clients,{id:genId(),name:cName.trim(),sheetUrl:cUrl.trim(),createdAt:new Date().toISOString()}]);setCName("");setCUrl("");setShowAdd(false);};
  const deleteClient=(id)=>{if(confirm("Delete?"))save(clients.filter(c=>c.id!==id));if(selected?.id===id){setSelected(null);setReports([]);}};

  const runIntel=async(client)=>{
    setActiveReport(null);setError(null);setStep("fetching");
    try{
      const sd=await api("/api/sheet",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sheetUrl:client.sheetUrl})});
      if(sd.error)throw new Error(sd.error);
      setStep("analyzing");
      const summary=buildSheetSummary(client.name,sd);
      const aRes=await api("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:16000,system:AGENT_PROMPT,messages:[{role:"user",content:`Run the full weekly creative intelligence analysis. Today is ${new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}. Be thorough — list every test, extract every number.\n\n${summary}`}]})});
      if(aRes.error)throw new Error(typeof aRes.error==="string"?aRes.error:aRes.error.message);
      let text=(aRes.content?.[0]?.text||"").replace(/```json|```/g,"").trim();
      let parsed;
      try{parsed=JSON.parse(text);}catch(e){let f=text;const ob=(f.match(/{/g)||[]).length,cb=(f.match(/}/g)||[]).length;for(let i=0;i<ob-cb;i++)f+="}";const oq=(f.match(/\[/g)||[]).length,cq=(f.match(/\]/g)||[]).length;for(let i=0;i<oq-cq;i++)f+="]";parsed=JSON.parse(f);}
      await api("/api/reports",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({clientId:client.id,report:parsed})});
      const updated=await api("/api/reports?clientId="+client.id);
      setReports(updated.reports||[]);setActiveReport(parsed);setStep("done");
    }catch(e){setError(e.message);setStep("idle");}
  };

  const reset=()=>{setSelected(null);setReports([]);setActiveReport(null);setStep("idle");setError(null);};
  const latestReport=reports.length>0?reports[reports.length-1]:null;
  const latestAge=latestReport?Math.round((Date.now()-new Date(latestReport.date).getTime())/(1000*60*60))+"h ago":null;

  if(!loaded)return <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><style>{css}</style><div style={{color:C.textDim}}>Loading...</div></div>;

  return <div style={{background:C.bg,minHeight:"100vh",color:C.text}}>
    <style>{css}</style>
    <nav style={{position:"sticky",top:0,zIndex:100,background:"rgba(0,0,0,.72)",backdropFilter:"blur(20px) saturate(180%)",borderBottom:`1px solid ${C.border}`,padding:"0 28px"}}>
      <div style={{maxWidth:960,margin:"0 auto",height:52,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:15,fontWeight:600}}>Creative Intel Agent</span>
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

    {error&&<div style={{background:C.red+"10",borderBottom:`1px solid ${C.red}25`,padding:"10px 28px"}}><div style={{maxWidth:960,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,color:C.red}}>{error}</span><Btn v="ghost" s="sm" onClick={()=>setError(null)}>Dismiss</Btn></div></div>}

    <div style={{maxWidth:960,margin:"0 auto",padding:"32px 28px"}}>
      {!selected&&<div className="fi">
        <h1 style={{fontSize:32,fontWeight:700,letterSpacing:"-.03em",marginBottom:4}}>Weekly Creative Intelligence</h1>
        <p style={{fontSize:15,color:C.textSec,marginBottom:4}}>Reads live from each client's Google Sheet. Auto-runs Mondays 8am UTC with Slack delivery.</p>
        <p style={{fontSize:13,color:C.textDim,marginBottom:24}}>Reports saved permanently. Click any client to see the latest report.</p>
        {clients.length===0?<Card style={{textAlign:"center",padding:48}}><div style={{fontSize:15,fontWeight:600,color:C.textSec,marginBottom:8}}>No clients yet</div><Btn v="pri" onClick={()=>setShowAdd(true)}>Add Client</Btn></Card>
        :clients.map(cl=>(<div key={cl.id} onClick={()=>selectClient(cl)} style={{background:C.card,borderRadius:14,border:`1px solid ${C.border}`,marginBottom:8,padding:"18px 22px",cursor:"pointer",transition:"border-color .15s,transform .15s"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.borderLight;e.currentTarget.style.transform="translateY(-1px)";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="translateY(0)";}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div><div style={{fontSize:17,fontWeight:600,marginBottom:4}}>{cl.name}</div><div style={{fontSize:12,color:C.textDim}}>{cl.sheetUrl.substring(0,60)}...</div></div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}><Btn v="ghost" s="sm" onClick={e=>{e.stopPropagation();deleteClient(cl.id);}}>Delete</Btn><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></div></div>
        </div>))}
      </div>}

      {selected&&(step==="fetching"||step==="analyzing")&&<div className="fi" style={{textAlign:"center",padding:"80px 20px"}}>
        <div style={{width:48,height:48,border:`3px solid ${C.accent}`,borderTopColor:"transparent",borderRadius:24,animation:"spin .8s linear infinite",margin:"0 auto 20px"}}/>
        <div style={{fontSize:18,fontWeight:600,marginBottom:8}}>{step==="fetching"?"Reading "+selected.name+"'s sheet":"Analyzing "+selected.name}</div>
        <div style={{fontSize:14,color:C.textSec,animation:"pulse 2s infinite"}}>{step==="fetching"?"Pulling all tabs from Google Sheets...":"Claude analyzing every test, every number, every pattern..."}</div>
        <div style={{fontSize:13,color:C.textDim,marginTop:6}}>20-45 seconds</div>
      </div>}

      {selected&&(step==="idle"||step==="done")&&<div>
        <div style={{marginBottom:20}}>
          <h1 style={{fontSize:24,fontWeight:700,letterSpacing:"-.03em"}}>{selected.name}</h1>
          {latestAge&&<div style={{fontSize:13,color:C.textDim,marginTop:4}}>Latest: {latestAge}{reports.length>1?` · ${reports.length} reports`:""}</div>}
          {!latestReport&&<div style={{fontSize:13,color:C.textDim,marginTop:4}}>No reports yet. Click "Run Now".</div>}
        </div>
        {reports.length>1&&<div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:600,color:C.textSec,marginBottom:8}}>History</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{reports.slice().reverse().map((h,i)=>{
            const isActive=activeReport===h.report;const date=new Date(h.date);
            const label=date.toLocaleDateString("en-US",{month:"short",day:"numeric"})+" "+date.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
            const hColor=h.report?.client_health?.score==="green"?C.green:h.report?.client_health?.score==="red"?C.red:C.orange;
            return <button key={i} onClick={()=>setActiveReport(h.report)} style={{padding:"6px 12px",borderRadius:8,border:`1.5px solid ${isActive?C.accent:C.border}`,background:isActive?C.accent+"12":C.surface2,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:8,height:8,borderRadius:4,background:hColor}}/><span style={{fontSize:11,fontWeight:isActive?600:400,color:isActive?C.text:C.textSec}}>{label}</span>
            </button>;
          })}</div>
        </div>}
        {activeReport&&<IntelReport report={activeReport}/>}
      </div>}
    </div>

    {showAdd&&<Modal title="Add Client" onClose={()=>setShowAdd(false)}>
      <Inp label="Client Name" value={cName} onChange={setCName} placeholder="Brand name"/>
      <Inp label="Google Sheet URL" value={cUrl} onChange={setCUrl} placeholder="https://docs.google.com/spreadsheets/d/..."/>
      <div style={{fontSize:12,color:C.textDim,marginBottom:16,lineHeight:1.5}}>Sheet must be shared as "Anyone with the link can view."</div>
      <Btn v="pri" full onClick={addClient} disabled={!cName.trim()||!cUrl.trim()}>Add Client</Btn>
    </Modal>}

    <footer style={{padding:"24px 28px",textAlign:"center",marginTop:40}}><p style={{fontSize:12,color:C.textDim}}>Creative Intel Agent · Auto-runs Mondays 8am UTC · D-DOUBLEU MEDIA</p></footer>
  </div>;
}

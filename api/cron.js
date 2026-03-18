import { kv } from '@vercel/kv';

export const config = { maxDuration: 300 };

const AGENT_PROMPT = `You are the Weekly Creative Intelligence Agent for a performance creative agency that scales eCommerce brands. Every week you analyze a client's COMPLETE data from their Growth Guide spreadsheet and produce a strategic intelligence briefing.

You receive RAW spreadsheet data from multiple tabs: Creative Roadmap (all ad tests with results), Calendar (revenue/spend targets vs actuals), Top Performing Ads, CRO tests, Meeting Notes, Creators, Awareness levels, and Mass Desires.

Your job: Find the patterns. Connect the dots. Tell the team exactly what to build this week and why.

Respond ONLY in valid JSON:
{
  "executive_summary":"3-4 sentences. Lead with the most critical insight.",
  "performance_snapshot":{"revenue_vs_target":"","spend_status":"","mer_status":"","trend":"improving/stable/declining","headline_metric":""},
  "creative_analysis":{"total_tests":0,"winners":0,"losers":0,"hit_rate":"","hit_rate_trend":"","winning_patterns":["Be SPECIFIC"],"losing_patterns":["Be SPECIFIC"],"biggest_winner":"","underexplored_angles":[""]},
  "fatigue_alerts":[{"ad_name":"","signal":"","action":""}],
  "weekly_creative_briefs":[{"priority":1,"concept":"","format":"","angle":"","awareness_level":"","hook_direction":"","why":"","reference":""}],
  "cro_insights":{"active_tests":0,"key_finding":"","recommendation":""},
  "awareness_gaps":"",
  "desire_alignment":"",
  "pending_actions":[""],
  "priorities_this_week":["Priority 1","Priority 2","Priority 3"],
  "risk_flags":[""],
  "client_health":{"score":"green/yellow/red","reason":""}
}

Be brutally specific. Reference actual test names. Connect performance to creative decisions. Weekly briefs must be immediately actionable.`;

function extractSheetId(url) {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

async function fetchSheet(sheetUrl, googleApiKey) {
  const sheetId = extractSheetId(sheetUrl);
  if (!sheetId) throw new Error('Invalid sheet URL');
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=sheets.properties.title&key=${googleApiKey}`);
  if (!metaRes.ok) throw new Error('Cannot access sheet');
  const meta = await metaRes.json();
  const tabNames = (meta.sheets || []).map(s => s.properties.title);
  const TAB_MAP = {
    overview: tabNames.find(t => t.toLowerCase().includes('overview')),
    roadmap: tabNames.find(t => t.toLowerCase().includes('creative roadmap') || t.toLowerCase().includes('new creative')),
    oldRoadmap: tabNames.find(t => t.toLowerCase().includes('2025 creative') || t.toLowerCase().includes('clean up')),
    ads: tabNames.find(t => t.toLowerCase() === 'ads'),
    meetings: tabNames.find(t => t.toLowerCase().includes('meeting')),
    topAds: tabNames.find(t => t.toLowerCase().includes('top performing')),
    cro: tabNames.find(t => t.toLowerCase() === 'cro'),
    calendar2026: tabNames.find(t => t.includes('2026') && t.toLowerCase().includes('calendar')),
    calendar2025: tabNames.find(t => t.includes('2025') && t.toLowerCase().includes('calendar')),
    creators: tabNames.find(t => t.toLowerCase().includes('creator')),
    awareness: tabNames.find(t => t.toLowerCase().includes('awareness')),
    massDesires: tabNames.find(t => t.toLowerCase().includes('mass desire')),
    mechanization: tabNames.find(t => t.toLowerCase().includes('mechaniz')),
  };
  const result = { tabs: tabNames, data: {} };
  for (const [key, tabName] of Object.entries(TAB_MAP)) {
    if (!tabName) continue;
    try {
      const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(tabName)}?key=${googleApiKey}&valueRenderOption=FORMATTED_VALUE`);
      if (r.ok) { const d = await r.json(); result.data[key] = d.values || []; }
    } catch (e) {}
  }
  return result;
}

function buildSummary(clientName, sheetData) {
  let s = `CLIENT: ${clientName}\nDate: ${new Date().toLocaleDateString()}\nTabs: ${sheetData.tabs?.join(", ")}\n\n`;
  const d = sheetData.data || {};
  const dumpTab = (key, label, limit) => { const rows = d[key]; if (!rows || rows.length < 2) return; s += `${label} (${rows.length-1} rows):\nHeaders: ${(rows[0]||[]).join(" | ")}\n`; rows.slice(1, limit || 999).forEach((row, i) => { const vals = row.map((v, ci) => (rows[0]||[])[ci] ? `${(rows[0]||[])[ci]}: ${v}` : v).filter(v => v && !v.endsWith(": ")); if (vals.length > 0) s += `${i+1}: ${vals.join(" | ")}\n`; }); s += "\n"; };
  const dumpRaw = (key, label) => { if (d[key]?.length > 0) { s += label + ":\n"; d[key].forEach(r => { if (r.some(c => c)) s += r.filter(c => c).join(" | ") + "\n"; }); s += "\n"; } };
  dumpRaw("overview", "OVERVIEW");
  if (d.roadmap?.length > 1) dumpTab("roadmap", "CREATIVE ROADMAP"); else if (d.oldRoadmap?.length > 1) dumpTab("oldRoadmap", "CREATIVE ROADMAP");
  dumpTab("ads", "ADS LOG", 20); dumpTab("meetings", "MEETINGS", 6); dumpTab("topAds", "TOP ADS"); dumpTab("cro", "CRO");
  dumpRaw("calendar2026", "2026 CALENDAR"); dumpRaw("calendar2025", "2025 CALENDAR");
  dumpRaw("awareness", "AWARENESS"); dumpRaw("massDesires", "MASS DESIRES"); dumpRaw("mechanization", "MECHANIZATION");
  if (d.creators?.length > 2) { s += "CREATORS:\n"; d.creators.slice(2).forEach(r => { if (r.some(c => c)) s += r.filter(c => c).join(" | ") + "\n"; }); }
  return s;
}

// ═══ SLACK ═══

async function sendSlack(webhookUrl, blocks) {
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    });
  } catch (e) {
    console.error('Slack error:', e.message);
  }
}

function buildSlackBlocks(clientName, report) {
  const r = report;
  const healthEmoji = r.client_health?.score === 'green' ? ':large_green_circle:' : r.client_health?.score === 'yellow' ? ':large_yellow_circle:' : ':red_circle:';
  const ca = r.creative_analysis || {};

  const blocks = [
    { type: 'header', text: { type: 'plain_text', text: `${healthEmoji} ${clientName} — Weekly Intel`, emoji: true } },
    { type: 'section', text: { type: 'mrkdwn', text: r.executive_summary || 'No summary.' } },
    { type: 'divider' },
    { type: 'section', fields: [
      { type: 'mrkdwn', text: `*Hit Rate:* ${ca.hit_rate || '—'} (${ca.hit_rate_trend || '?'})` },
      { type: 'mrkdwn', text: `*Tests:* ${ca.total_tests || 0} total (${ca.winners || 0}W / ${ca.losers || 0}L)` },
      { type: 'mrkdwn', text: `*Revenue:* ${r.performance_snapshot?.revenue_vs_target || '—'}` },
      { type: 'mrkdwn', text: `*MER:* ${r.performance_snapshot?.mer_status || '—'}` },
    ]},
  ];

  // Priorities
  if (r.priorities_this_week?.length > 0) {
    const prioText = r.priorities_this_week.map((p, i) => `${i + 1}. ${p}`).join('\n');
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*:fire: Priorities This Week*\n${prioText}` } });
  }

  // Creative briefs (top 3)
  const briefs = (r.weekly_creative_briefs || []).slice(0, 3);
  if (briefs.length > 0) {
    const briefText = briefs.map(b => `*#${b.priority} ${b.concept}* (${b.format})\n_${b.angle}_\nHook: ${b.hook_direction}`).join('\n\n');
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*:dart: Creative Briefs*\n\n${briefText}` } });
  }

  // Risk flags
  if (r.risk_flags?.length > 0 && r.risk_flags[0]) {
    const riskText = r.risk_flags.filter(Boolean).map(f => `:warning: ${f}`).join('\n');
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*Risk Flags*\n${riskText}` } });
  }

  // Fatigue alerts
  if (r.fatigue_alerts?.length > 0 && r.fatigue_alerts[0]?.ad_name) {
    const fatigueText = r.fatigue_alerts.filter(f => f.ad_name).map(f => `:hourglass: *${f.ad_name}* — ${f.signal}`).join('\n');
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*Fatigue Alerts*\n${fatigueText}` } });
  }

  blocks.push({ type: 'divider' });
  blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `_Generated by Creative Intel Agent · ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}_` }] });

  return blocks;
}

function buildDigestBlocks(results) {
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.error);

  const blocks = [
    { type: 'header', text: { type: 'plain_text', text: ':robot_face: Weekly Intel Digest Complete', emoji: true } },
    { type: 'section', text: { type: 'mrkdwn', text: `Processed *${results.length}* clients: *${successful.length}* success, *${failed.length}* failed.` } },
    { type: 'divider' },
  ];

  // Client health summary
  if (successful.length > 0) {
    const summary = successful.map(r => {
      const emoji = r.health === 'green' ? ':large_green_circle:' : r.health === 'yellow' ? ':large_yellow_circle:' : ':red_circle:';
      return `${emoji} *${r.client}* — ${r.health?.toUpperCase() || '?'}`;
    }).join('\n');
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: summary } });
  }

  if (failed.length > 0) {
    const failText = failed.map(r => `:x: *${r.client}* — ${r.error}`).join('\n');
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*Failed:*\n${failText}` } });
  }

  blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `_Full reports available in the <${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'Intel Agent'}|Intel Agent dashboard>_` }] });

  return blocks;
}

// ═══ MAIN HANDLER ═══

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const isManual = req.query.manual === 'true';
  if (!isCron && !isManual) return res.status(401).json({ error: 'Unauthorized' });

  const googleApiKey = process.env.GOOGLE_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;

  if (!googleApiKey || !anthropicKey) return res.status(500).json({ error: 'Missing API keys' });

  try {
    const clientData = await kv.get('intel-agent-clients');
    const clients = clientData?.clients || [];
    if (clients.length === 0) return res.status(200).json({ message: 'No clients', results: [] });

    const results = [];

    for (const client of clients) {
      try {
        const sheetData = await fetchSheet(client.sheetUrl, googleApiKey);
        const summary = buildSummary(client.name, sheetData);

        const aRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514', max_tokens: 8000, system: AGENT_PROMPT,
            messages: [{ role: 'user', content: `Run weekly creative intelligence. Today is ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.\n\n${summary}` }],
          }),
        });

        if (!aRes.ok) { results.push({ client: client.name, error: 'Claude error: ' + aRes.status }); continue; }
        const aData = await aRes.json();
        let text = (aData.content?.[0]?.text || '').replace(/```json|```/g, '').trim();

        let parsed;
        try { parsed = JSON.parse(text); } catch (e) {
          let f = text;
          const ob = (f.match(/{/g) || []).length, cb = (f.match(/}/g) || []).length;
          for (let i = 0; i < ob - cb; i++) f += '}';
          const oq = (f.match(/\[/g) || []).length, cq = (f.match(/\]/g) || []).length;
          for (let i = 0; i < oq - cq; i++) f += ']';
          parsed = JSON.parse(f);
        }

        // Save report to KV
        const existing = (await kv.get('intel-reports-' + client.id)) || [];
        const updated = [...existing, { date: new Date().toISOString(), report: parsed }].slice(-20);
        await kv.set('intel-reports-' + client.id, updated);

        // Send per-client Slack message
        if (slackWebhook) {
          await sendSlack(slackWebhook, buildSlackBlocks(client.name, parsed));
        }

        results.push({ client: client.name, status: 'success', health: parsed.client_health?.score });
      } catch (e) {
        results.push({ client: client.name, error: e.message });
      }

      if (clients.indexOf(client) < clients.length - 1) {
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    // Send digest summary to Slack
    if (slackWebhook) {
      await sendSlack(slackWebhook, buildDigestBlocks(results));
    }

    return res.status(200).json({ message: `Processed ${clients.length} clients`, results });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

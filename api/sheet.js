export const config = { maxDuration: 30 };

function extractSheetId(url) {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { sheetUrl } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) return res.status(500).json({ error: 'GOOGLE_API_KEY not set' });
  if (!sheetUrl) return res.status(400).json({ error: 'sheetUrl required' });

  const sheetId = extractSheetId(sheetUrl);
  if (!sheetId) return res.status(400).json({ error: 'Invalid Google Sheet URL' });

  try {
    // 1. Get sheet metadata (all tab names)
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=sheets.properties.title&key=${apiKey}`
    );
    if (!metaRes.ok) {
      const err = await metaRes.text();
      return res.status(400).json({ error: 'Cannot access sheet. Make sure it is shared as "Anyone with the link can view". Details: ' + err.substring(0, 200) });
    }
    const meta = await metaRes.json();
    const tabNames = (meta.sheets || []).map(s => s.properties.title);

    // 2. Map known tabs
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

    // 3. Fetch data for each found tab
    const result = { tabs: tabNames, data: {} };

    for (const [key, tabName] of Object.entries(TAB_MAP)) {
      if (!tabName) continue;
      try {
        const valRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(tabName)}?key=${apiKey}&valueRenderOption=FORMATTED_VALUE`
        );
        if (valRes.ok) {
          const valData = await valRes.json();
          result.data[key] = valData.values || [];
        }
      } catch (e) {
        // Skip tabs that fail
      }
    }

    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

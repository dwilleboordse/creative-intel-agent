import { kv } from '@vercel/kv';

// Stores reports as: intel-reports-{clientId} -> [{date, report}, ...]

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const clientId = req.query.clientId;
    if (!clientId) return res.status(400).json({ error: 'clientId required' });
    try {
      const reports = await kv.get('intel-reports-' + clientId);
      return res.status(200).json({ reports: reports || [] });
    } catch (e) {
      return res.status(200).json({ reports: [] });
    }
  }

  if (req.method === 'POST') {
    const { clientId, report } = req.body;
    if (!clientId || !report) return res.status(400).json({ error: 'clientId and report required' });
    try {
      const existing = (await kv.get('intel-reports-' + clientId)) || [];
      const updated = [...existing, { date: new Date().toISOString(), report }].slice(-20); // keep last 20
      await kv.set('intel-reports-' + clientId, updated);
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

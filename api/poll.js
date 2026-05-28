export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { accessCode, runId, datasetId } = req.body;
  if (accessCode !== process.env.ACCESS_CODE) {
    return res.status(401).json({ error: 'Invalid access code' });
  }

  try {
    const statusRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${process.env.APIFY_TOKEN}`
    );
    const statusData = await statusRes.json();
    const status = statusData.data.status;

    if (status === 'SUCCEEDED') {
      const itemsRes = await fetch(
        `https://api.apify.com/v2/datasets/${datasetId}/items?token=${process.env.APIFY_TOKEN}&limit=30`
      );
      const items = await itemsRes.json();
      res.json({ status: 'SUCCEEDED', items });
    } else if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) {
      res.json({ status: 'FAILED' });
    } else {
      res.json({ status: 'RUNNING' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

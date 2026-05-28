export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { accessCode, handle } = req.body;
  if (accessCode !== process.env.ACCESS_CODE) {
    return res.status(401).json({ error: 'Invalid access code' });
  }

  try {
    const response = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-scraper/runs?token=${process.env.APIFY_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directUrls: [`https://www.instagram.com/${handle}/`],
          resultsType: 'posts',
          resultsLimit: 30
        })
      }
    );
    const data = await response.json();
    if (!data.data) throw new Error('Failed to start scrape');
    res.json({ runId: data.data.id, datasetId: data.data.defaultDatasetId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

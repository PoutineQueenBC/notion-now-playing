// /api/callback.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)).catch(()=>global.fetch && global.fetch(...args));

module.exports = async (req, res) => {
  try {
    const { query } = req;
    const code = query.code;
    if (!code) {
      res.status(400).send("Missing code");
      return;
    }
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = process.env.REDIRECT_URI;

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri
    });

    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${basic}`
      },
      body
    });

    const data = await tokenRes.json();
    if (!tokenRes.ok) {
      res.status(500).send(data);
      return;
    }

    const { access_token, refresh_token, expires_in } = data;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(`
      <style>
        body{font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding:20px; line-height:1.4}
        pre{white-space:pre-wrap;border:1px solid #ddd;padding:12px;border-radius:8px;background:#f7f7f7}
        .small{color:#555}
      </style>
      <h2>Success ✅</h2>
      <p><strong>Copy this REFRESH_TOKEN into your Vercel env:</strong></p>
      <pre>${refresh_token || "(missing refresh_token)"}</pre>
      <p class="small">Access token (short-lived):</p>
      <pre>${access_token}</pre>
      <p class="small">Expires in: ${expires_in}s</p>
    `);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
};

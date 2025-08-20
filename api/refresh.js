// /api/refresh.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)).catch(()=>global.fetch && global.fetch(...args));

module.exports = async (req, res) => {
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const refreshToken = process.env.REFRESH_TOKEN;
    if (!refreshToken) {
      res.status(400).json({ error: "Missing REFRESH_TOKEN in environment" });
      return;
    }
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken
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

    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// /api/now.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)).catch(()=>global.fetch && global.fetch(...args));

async function getAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.REFRESH_TOKEN;
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
  if (!tokenRes.ok) throw new Error(JSON.stringify(data));
  return data.access_token;
}

module.exports = async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const nowRes = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: { "Authorization": `Bearer ${accessToken}` }
    });
    if (nowRes.status === 204) {
      res.status(204).end();
      return;
    }
    const data = await nowRes.json();
    res.status(nowRes.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

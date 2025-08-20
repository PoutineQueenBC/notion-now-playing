// /api/login.js
module.exports = async (req, res) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.REDIRECT_URI;
  const scopes = [
    "user-read-currently-playing",
    "user-read-playback-state"
  ].join(" ");
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: scopes,
    show_dialog: "true"
  });
  res.writeHead(302, { Location: `https://accounts.spotify.com/authorize?${params.toString()}` });
  res.end();
};

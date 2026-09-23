const clientId = "616284607900428d88625e895384080c";
const deployedRedirectUri = "https://ubiquitous-cobbler-69da27.netlify.app";
const localRedirectUri = "http://127.0.0.1:3000";
const scopes = ["playlist-modify-public"];

let accessToken = null;
let codeExchangePromise = null;

const redirectUri = () =>
  window.location.hostname === "127.0.0.1" ? localRedirectUri : deployedRedirectUri;

const randomString = (length) => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
};

const base64UrlEncode = (buffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const codeChallenge = async (verifier) => {
  const bytes = new TextEncoder().encode(verifier);
  return base64UrlEncode(await crypto.subtle.digest("SHA-256", bytes));
};

const responseJson = async (response) => {
  const text = await response.text();
  let body = {};
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: text };
    }
  }
  if (!response.ok) {
    throw new Error(
      body.error?.message || body.error_description || body.message || "Spotify request failed."
    );
  }
  return body;
};

const startAuthorization = async () => {
  const verifier = randomString(64);
  const state = randomString(32);
  sessionStorage.setItem("spotify_code_verifier", verifier);
  sessionStorage.setItem("spotify_oauth_state", state);

  const url = new URL("https://accounts.spotify.com/authorize");
  url.search = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri(),
    scope: scopes.join(" "),
    state,
    code_challenge_method: "S256",
    code_challenge: await codeChallenge(verifier),
  }).toString();
  window.location.assign(url.toString());
};

const exchangeCodeForToken = async (code) => {
  if (codeExchangePromise) return codeExchangePromise;

  const expectedState = sessionStorage.getItem("spotify_oauth_state");
  const returnedState = new URLSearchParams(window.location.search).get("state");
  const verifier = sessionStorage.getItem("spotify_code_verifier");
  if (!verifier || !expectedState || expectedState !== returnedState) {
    throw new Error("Spotify sign-in could not be verified. Please try again.");
  }

  // Remove the one-use code immediately, so a second render cannot submit it again.
  window.history.replaceState({}, document.title, window.location.pathname);
  codeExchangePromise = (async () => {
    const token = await responseJson(
      await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri(),
          code_verifier: verifier,
        }),
      })
    );

    sessionStorage.removeItem("spotify_code_verifier");
    sessionStorage.removeItem("spotify_oauth_state");
    sessionStorage.setItem("spotify_access_token", token.access_token);
    accessToken = token.access_token;
    return accessToken;
  })();

  try {
    return await codeExchangePromise;
  } finally {
    codeExchangePromise = null;
  }
};

const completeAuthentication = async () => {
  if (accessToken) return true;
  accessToken = sessionStorage.getItem("spotify_access_token");
  if (accessToken) return true;

  const params = new URLSearchParams(window.location.search);
  const error = params.get("error");
  if (error) throw new Error(`Spotify sign-in was cancelled: ${error}.`);
  const code = params.get("code");
  if (!code) return false;
  await exchangeCodeForToken(code);
  return true;
};

const getAccessToken = async () => {
  if (await completeAuthentication()) return accessToken;
  throw new Error("Connect Spotify before searching or saving a playlist.");
};

const apiRequest = async (url, options = {}) => {
  const token = await getAccessToken();
  if (!token) return null;
  return responseJson(
    await fetch(url, {
      ...options,
      headers: { Authorization: `Bearer ${token}`, ...options.headers },
    })
  );
};

const Spotify = {
  connect: async () => {
    const connected = await completeAuthentication();
    if (!connected) await startAuthorization();
    return connected;
  },

  completeAuthentication,

  async search(term) {
    const result = await apiRequest(
      `https://api.spotify.com/v1/search?${new URLSearchParams({ type: "track", q: term })}`
    );
    if (!result?.tracks) return [];
    return result.tracks.items.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0]?.name || "Unknown artist",
      album: track.album.name,
      uri: track.uri,
    }));
  },

  async savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) return;
    const profile = await apiRequest("https://api.spotify.com/v1/me");
    if (!profile) return;
    const playlist = await apiRequest(`https://api.spotify.com/v1/users/${profile.id}/playlists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, public: true }),
    });
    await apiRequest(`https://api.spotify.com/v1/playlists/${playlist.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uris: trackUris }),
    });
  },
};

export default Spotify;

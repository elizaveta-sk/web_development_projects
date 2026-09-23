import React, { useCallback, useEffect, useState } from "react";
import "./App.css";

import Playlist from "../Playlist/Playlist";
import SearchBar from "../SearchBar/SearchBar";
import SearchResults from "../SearchResults/SearchResults";
import Spotify from "../../util/Spotify";

const App = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState("New Playlist");
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Spotify returns here after the user approves access. Complete that sign-in automatically.
  useEffect(() => {
    Spotify.completeAuthentication()
      .then(setConnected)
      .catch((reason) => setError(reason.message));
  }, []);

  const connect = useCallback(() => {
    setError("");
    setConnecting(true);
    Spotify.connect()
      .then(setConnected)
      .catch((reason) => setError(reason.message))
      .finally(() => setConnecting(false));
  }, []);

  const search = useCallback((term) => {
    setError("");
    if (!connected) {
      setError("Connect Spotify first, then search for music.");
      return;
    }
    Spotify.search(term)
      .then((results) => {
        setSearchResults(results);
      })
      .catch((reason) => setError(reason.message));
  }, [connected]);

  const addTrack = useCallback((track) => {
    setPlaylistTracks((tracks) =>
      tracks.some((savedTrack) => savedTrack.id === track.id) ? tracks : [...tracks, track]
    );
  }, []);

  const removeTrack = useCallback((track) => {
    setPlaylistTracks((tracks) => tracks.filter((currentTrack) => currentTrack.id !== track.id));
  }, []);

  const savePlaylist = useCallback(() => {
    setError("");
    const trackUris = playlistTracks.map((track) => track.uri);
    Spotify.savePlaylist(playlistName, trackUris)
      .then(() => {
        setPlaylistName("New Playlist");
        setPlaylistTracks([]);
      })
      .catch((reason) => setError(reason.message));
  }, [playlistName, playlistTracks]);

  return (
    <div>
      <h1>Ja<span className="highlight">mmm</span>ing</h1>
      <div className="Auth-bar">
        <button className="Spotify-button" onClick={connect} disabled={connected || connecting}>
          {connected ? "Spotify connected" : connecting ? "Connecting..." : "Connect Spotify"}
        </button>
        <span>{connected ? "You can now search and save playlists." : "Connect Spotify before searching."}</span>
      </div>
      {error && <p className="App-error" role="alert">{error}</p>}
      <div className="App">
        <SearchBar onSearch={search} />
        <div className="App-playlist">
          <SearchResults searchResults={searchResults} onAdd={addTrack} />
          <Playlist
            playlistName={playlistName}
            playlistTracks={playlistTracks}
            onNameChange={setPlaylistName}
            onRemove={removeTrack}
            onSave={savePlaylist}
          />
        </div>
      </div>
    </div>
  );
};

export default App;

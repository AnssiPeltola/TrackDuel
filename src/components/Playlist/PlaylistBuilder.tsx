import React, { useEffect, useState } from "react";
import SpotifyService from "../../services/spotify.service";
import { Track } from "../../types/spotify.types";
import "./PlaylistBuilder.css";
import { EmbeddedSpotifyPlayer } from "../EmbeddedSpotifyPlayer/EmbeddedSpotifyPlayer";
import VolumeWarning from "../VolumeWarning/VolumeWarning";

const PlaylistBuilder: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);
  const [seenTrackIds, setSeenTrackIds] = useState<Set<string>>(new Set());

  const playlistId = "69fEt9DN5r4JQATi52sRtq";

  // Effect to fetch initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);

        // Test the token first
        try {
          await SpotifyService.getCurrentUser();
        } catch (error) {
          console.error("Token validation error:", error);
          setError("Authentication error. Please log in again.");
          setIsLoading(false);
          return;
        }

        await fetchTracks();
      } catch (error) {
        console.error("Error loading data:", error);
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Function to fetch new tracks
  const fetchTracks = async () => {
    try {
      setIsLoading(true);
      // Always fetch exactly 2 songs
      let attempts = 0;
      let newTracks: Track[] = [];

      // Try up to 3 times to get non-duplicate tracks
      while (attempts < 3 && newTracks.length < 2) {
        attempts++;

        // Fetch tracks from the playlist
        const fetchedTracks = await SpotifyService.fetchRandomPlaylistTracks(
          playlistId,
          4 // Fetch more than needed to have buffer for filtering
        );

        // Filter out tracks we've already seen
        const uniqueTracks = fetchedTracks.filter(
          (track) => !seenTrackIds.has(track.id)
        );
        newTracks = uniqueTracks.slice(0, 2);

        // If we got enough new tracks, break the loop
        if (newTracks.length >= 2) break;
      }

      if (newTracks.length === 0) {
        setError("No new tracks found. Please try again.");
      } else {
        // Add the new track IDs to our seen set
        const newIds = new Set(seenTrackIds);
        newTracks.forEach((track) => newIds.add(track.id));
        setSeenTrackIds(newIds);

        setTracks(newTracks);
        console.log("Fetched new tracks:", newTracks);
        setError(null);
      }
    } catch (err: any) {
      console.error("Error fetching songs:", err);
      setError(err.message || "Failed to fetch songs");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle track selection
  const handleTrackSelect = (selectedTrack: Track) => {
    // Add to selected tracks
    setSelectedTracks((prev) => {
      // First check if this track is already in the selected tracks
      if (prev.some((track) => track.id === selectedTrack.id)) {
        return prev;
      }
      return [...prev, selectedTrack];
    });

    // Remove from current tracks
    setTracks((prev) => prev.filter((track) => track.id !== selectedTrack.id));

    // If we've selected all current tracks, fetch more
    if (tracks.length <= 2) {
      fetchTracks();
    }
  };

  if (isLoading) {
    return <div className="loading">Loading tracks...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={fetchTracks}>Try Again</button>
        <button onClick={() => (window.location.href = "/login")}>
          Log In Again
        </button>
      </div>
    );
  }

  return (
    <div className="playlist-builder">
      <h1>TrackDuel</h1>
      <VolumeWarning />
      <div className="track-comparison">
        <h2>Choose your favorite track</h2>
        <div className="tracks-container">
          {tracks.map((track, index) => (
            <React.Fragment key={track.id}>
              <div
                className="track-card"
                onClick={() => handleTrackSelect(track)}
              >
                {/* Track card content */}
                <img
                  src={
                    track.album?.images?.[0]?.url || "/placeholder-album.png"
                  }
                  alt={track.album?.name || "Album"}
                  className="album-cover"
                />
                <div className="track-info">
                  <h3>{track.name}</h3>
                  <p>
                    {track.artists?.map((artist) => artist.name).join(", ") ||
                      "Unknown Artist"}
                  </p>
                  <div className="track-genres">
                    {(track.genres || []).length > 0 ? (
                      (track.genres || []).slice(0, 3).map((genre, index) => (
                        <span key={index} className="genre-tag">
                          {genre}
                        </span>
                      ))
                    ) : (
                      <span className="genre-tag genre-tag--muted">
                        Uncategorized
                      </span>
                    )}
                  </div>
                  <div className="track-meta">
                    <span className="release-year">
                      {track.album.release_date?.substring(0, 4)}
                    </span>
                    <span
                      className="popularity"
                      title={`Popularity: ${track.popularity}/100`}
                    >
                      {Array(Math.max(1, Math.ceil(track.popularity / 20)))
                        .fill("★")
                        .join("")}
                    </span>
                  </div>
                  <div className="embedded-player">
                    <EmbeddedSpotifyPlayer trackId={track.id} />
                  </div>
                </div>
              </div>

              {/* Add VS element between tracks */}
              {index === 0 && tracks.length > 1 && (
                <div className="vs-badge">
                  <div className="vs-text">VS</div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="playlist-section">
          <h3>Your Playlist ({selectedTracks.length})</h3>
          {selectedTracks.length > 0 ? (
            <ul className="selected-tracks">
              {selectedTracks.map((track) => (
                <li key={track.id} className="selected-track">
                  <img
                    src={
                      track.album?.images?.[0]?.url || "/placeholder-album.png"
                    }
                    alt={track.album?.name || "Album"}
                    className="mini-cover"
                  />
                  <div>
                    <strong>{track.name}</strong>
                    <span>
                      {track.artists?.map((artist) => artist.name).join(", ") ||
                        "Unknown Artist"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>Select your favorite tracks to build a playlist</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistBuilder;

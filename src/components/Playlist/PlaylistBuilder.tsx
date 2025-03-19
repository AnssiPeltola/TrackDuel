import React, { useEffect, useState } from "react";
import SpotifyService from "../../services/spotify.service";
import { Track } from "../../types/spotify.types";
import "./PlaylistBuilder.css";
import { EmbeddedSpotifyPlayer } from "../EmbeddedSpotifyPlayer/EmbeddedSpotifyPlayer";
import VolumeWarning from "../VolumeWarning/VolumeWarning";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import {
  addTrack,
  removeTrack,
  clearPlaylist,
  savePlaylistFailure,
  savePlaylistRequest,
  savePlaylistSuccess,
} from "../../store/playlistSlice";
import { store } from "../../store/store";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import CreatePlaylistModal from "../CreatePlaylistModal/CreatePlaylistModal";

const PlaylistBuilder: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedTracks = useAppSelector((state) => state.playlist.tracks);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);
  // const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);
  const [seenTrackIds, setSeenTrackIds] = useState<Set<string>>(new Set());
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] =
    useState<boolean>(false);
  const [playlistCreationResult, setPlaylistCreationResult] = useState<{
    url: string;
    name: string;
  } | null>(null);

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

  // Add a function to handle track selection
  const handleTrackSelect = (selectedTrack: Track) => {
    console.log("Before adding track to Redux state:", {
      selectedTrackId: selectedTrack.id,
      selectedTrackName: selectedTrack.name,
      currentReduxTracks: selectedTracks.length,
    });

    // Add to selected tracks in Redux
    dispatch(addTrack(selectedTrack));

    // Log after dispatch - note that Redux state won't be updated immediately in this log
    console.log("Track added to playlist:", {
      track: selectedTrack.name,
      artist: selectedTrack.artists?.[0]?.name,
      id: selectedTrack.id,
    });

    // Remove from current tracks
    setTracks((prev) => prev.filter((track) => track.id !== selectedTrack.id));

    // If we've selected all current tracks, fetch more
    if (tracks.length <= 2) {
      console.log("Fetching more tracks after selection");
      fetchTracks();
    }
  };

  // Add a function to handle track removal
  const handleRemoveTrack = (trackId: string) => {
    console.log("Removing track from Redux state:", {
      trackId,
      currentReduxTracks: selectedTracks.length,
      remainingTracksAfterRemoval: selectedTracks.filter(
        (t) => t.id !== trackId
      ).length,
    });

    dispatch(removeTrack(trackId));

    // We need to get the latest state in the timeout, not use the closed-over value
    setTimeout(() => {
      // Get the current state directly from the store
      const currentState = store.getState();
      console.log("Redux state after track removal:", {
        tracksInPlaylist: currentState.playlist.tracks.length,
        trackIds: currentState.playlist.tracks.map((t) => t.id),
      });
    }, 0);
  };

  // // Add this hook to log state changes
  // useEffect(() => {
  //   console.log("Selected tracks in Redux updated:", {
  //     trackCount: selectedTracks.length,
  //     tracks: selectedTracks.map(
  //       (t) => `${t.name} (${t.artists?.[0]?.name || "Unknown"})`
  //     ),
  //   });
  // }, [selectedTracks]);

  // Updated clear playlist function to open modal
  const handleClearPlaylist = () => {
    setIsConfirmModalOpen(true);
  };

  // New function to handle confirmation
  const handleConfirmClear = () => {
    dispatch(clearPlaylist());
    setIsConfirmModalOpen(false);
  };

  // New function to handle cancel
  const handleCancelClear = () => {
    setIsConfirmModalOpen(false);
  };

  // Skip tracks function
  const handleSkipTracks = async () => {
    console.log("Skipping current tracks...");
    await fetchTracks();
  };

  const handleOpenCreatePlaylistModal = () => {
    setIsCreatePlaylistModalOpen(true);
  };

  // In PlaylistBuilder.tsx, modify the handleCreatePlaylist function:
  const handleCreatePlaylist = async (name: string, description: string) => {
    try {
      // Dispatch the save playlist request action
      dispatch(savePlaylistRequest());

      // Format the description to always include the app signature at the end
      const formattedDescription = description
        ? `${description} - Created with TrackDuel`
        : "Created with TrackDuel";

      // Create the playlist with the tracks and formatted description
      const result = await SpotifyService.createPlaylistWithTracks(
        name,
        formattedDescription,
        selectedTracks
      );

      // Rest of the function remains the same
      setPlaylistCreationResult({
        url: result.external_urls.spotify,
        name: result.name,
      });

      dispatch(savePlaylistSuccess(result.id));

      // Clear the playlist after a successful creation
      setTimeout(() => {
        dispatch(clearPlaylist());
      }, 3000); // Extended time to ensure modal stays visible

      return result.external_urls.spotify;
    } catch (error) {
      dispatch(
        savePlaylistFailure(
          error instanceof Error ? error.message : "Unknown error"
        )
      );
      throw error;
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

              {index === 0 && tracks.length > 1 && (
                <div className="vs-badge">
                  <div className="vs-text">⚔️</div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="skip-button-container">
          <button
            className="skip-button"
            onClick={handleSkipTracks}
            disabled={isLoading}
            title="Skip both tracks and get new ones"
          >
            <span className="skip-icon">↻</span>
            Skip both tracks
          </button>
        </div>
        <div className="playlist-section">
          <div className="playlist-header">
            <h3>Your Playlist ({selectedTracks.length})</h3>
            {selectedTracks.length > 0 && (
              <button
                className="clear-playlist-btn"
                onClick={handleClearPlaylist}
                title="Clear all tracks"
              >
                Clear All
              </button>
            )}
            <ConfirmationModal
              isOpen={isConfirmModalOpen}
              title="Clear Playlist"
              message="Are you sure you want to clear all tracks from your playlist? This action cannot be undone."
              confirmText="Clear Playlist"
              cancelText="Cancel"
              onConfirm={handleConfirmClear}
              onCancel={handleCancelClear}
              isDanger={true}
            />
          </div>
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
                  <div className="track-details">
                    <strong>{track.name}</strong>
                    <span>
                      {track.artists?.map((artist) => artist.name).join(", ") ||
                        "Unknown Artist"}
                    </span>
                  </div>
                  <button
                    className="remove-track-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTrack(track.id);
                    }}
                    title="Remove from playlist"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>Select your favorite tracks to build a playlist</p>
          )}

          {selectedTracks.length >= 3 && (
            <div className="playlist-actions">
              <button
                className="save-playlist-btn"
                onClick={handleOpenCreatePlaylistModal}
              >
                Create Spotify Playlist
              </button>
            </div>
          )}
        </div>
        <CreatePlaylistModal
          isOpen={isCreatePlaylistModalOpen}
          onClose={() => setIsCreatePlaylistModalOpen(false)}
          onConfirm={async (name, description) => {
            const url = await handleCreatePlaylist(name, description);
            return url;
          }}
          trackCount={selectedTracks.length}
        />
      </div>
    </div>
  );
};

export default PlaylistBuilder;

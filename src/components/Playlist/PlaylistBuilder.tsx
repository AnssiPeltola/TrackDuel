import React, { useEffect, useState } from "react";
import SpotifyService from "../../services/spotify.service";
import { Track } from "../../types/spotify.types";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "./PlaylistBuilder.css";

const currentYear = new Date().getFullYear();

// Define popularity presets
const popularityPresets = {
  niche: [0, 35] as [number, number],
  moderate: [35, 65] as [number, number],
  popular: [65, 100] as [number, number],
  all: [0, 100] as [number, number],
};

const PlaylistBuilder: React.FC = () => {
  // State declarations
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);
  const [seenTrackIds, setSeenTrackIds] = useState<Set<string>>(new Set());

  // Customization state
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [yearRange, setYearRange] = useState<[number, number]>([
    1950,
    currentYear,
  ]);
  const [popularityPreset, setPopularityPreset] = useState<string>("all");
  const [popularity, setPopularity] = useState<[number, number]>(
    popularityPresets.all
  );
  const [useFullRange, setUseFullRange] = useState<boolean>(true);

  // Effect to update popularity range when preset changes
  useEffect(() => {
    if (popularityPreset === "niche") {
      setPopularity(popularityPresets.niche);
    } else if (popularityPreset === "moderate") {
      setPopularity(popularityPresets.moderate);
    } else if (popularityPreset === "popular") {
      setPopularity(popularityPresets.popular);
    } else {
      setPopularity(popularityPresets.all);
    }
  }, [popularityPreset]);

  // Effect to fetch initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);

        // Test the token first
        try {
          await SpotifyService.getCurrentUser();
          console.log("Token is valid");
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

  // Function to handle popularity preset change
  const handlePopularityPresetChange = (value: number | number[]) => {
    // Ensure we're working with a single number
    const singleValue = Array.isArray(value) ? value[0] : value;

    if (singleValue <= 25) {
      setPopularityPreset("niche");
    } else if (singleValue <= 50) {
      setPopularityPreset("moderate");
    } else if (singleValue <= 75) {
      setPopularityPreset("popular");
    } else {
      setPopularityPreset("all");
    }
  };

  // Function to toggle between fixed ranges and full range
  const togglePopularityRange = () => {
    setUseFullRange(!useFullRange);
    if (!useFullRange) {
      setPopularityPreset("all");
    }
  };

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

        // Use custom parameters if user has selected any
        const customParams = {
          yearRange: yearRange,
          popularity: popularity,
          limit: 4, // Fetch more than needed to filter
        };

        const fetchedTracks = await SpotifyService.fetchCustomTracks(
          customParams
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
        setError(
          "No new tracks found. Please try again or adjust your filters."
        );
      } else {
        // Add the new track IDs to our seen set
        const newIds = new Set(seenTrackIds);
        newTracks.forEach((track) => newIds.add(track.id));
        setSeenTrackIds(newIds);

        setTracks(newTracks);
        console.log("Fetched tracks:", newTracks);
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
    if (tracks.length <= 1) {
      fetchTracks();
    }
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
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

      <div className="settings-toggle">
        <button onClick={toggleSettings} className="settings-button">
          {showSettings ? "Hide Settings" : "Customize Tracks"}
        </button>
      </div>

      {showSettings && (
        <div className="track-settings">
          <h2>Customize Your TrackDuel</h2>

          <div className="setting-section">
            <h3>Release Year Range</h3>
            <div className="year-range">
              <span>{yearRange[0]}</span>
              <div className="range-slider">
                <Slider
                  range
                  min={1950}
                  max={currentYear}
                  value={yearRange}
                  onChange={(value) => setYearRange(value as [number, number])}
                  trackStyle={[{ backgroundColor: "#1db954" }]}
                  handleStyle={[
                    { borderColor: "#1db954" },
                    { borderColor: "#1db954" },
                  ]}
                  railStyle={{ backgroundColor: "#555" }}
                />
              </div>
              <span>{yearRange[1]}</span>
            </div>
          </div>

          <div className="setting-section">
            <h3>
              Popularity{" "}
              {useFullRange ? "Mode" : `(${popularity[0]} - ${popularity[1]})`}
            </h3>

            <div className="popularity-toggle">
              <button
                onClick={togglePopularityRange}
                className={`toggle-button ${useFullRange ? "active" : ""}`}
              >
                {useFullRange ? "Using Full Range" : "Use Full Range (0-100)"}
              </button>
            </div>

            {!useFullRange && (
              <div className="popularity-range">
                <span>Niche</span>
                <div className="range-slider">
                  <Slider
                    min={0}
                    max={100}
                    step={25}
                    marks={{
                      0: "Niche",
                      25: "",
                      50: "Moderate",
                      75: "",
                      100: "Popular",
                    }}
                    value={
                      popularityPreset === "niche"
                        ? 25
                        : popularityPreset === "moderate"
                        ? 50
                        : popularityPreset === "popular"
                        ? 75
                        : 100
                    }
                    onChange={handlePopularityPresetChange}
                    trackStyle={{ backgroundColor: "#1db954" }}
                    handleStyle={{ borderColor: "#1db954" }}
                    railStyle={{ backgroundColor: "#555" }}
                  />
                </div>
                <span>Popular</span>
              </div>
            )}

            <div className="preset-display">
              {!useFullRange && (
                <>
                  <span>Current selection: </span>
                  <strong>
                    {popularityPreset === "niche"
                      ? "Niche (0-35)"
                      : popularityPreset === "moderate"
                      ? "Moderate (35-65)"
                      : popularityPreset === "popular"
                      ? "Popular (65-100)"
                      : "All (0-100)"}
                  </strong>
                </>
              )}
              {useFullRange && (
                <span>Including all popularity ranges (0-100)</span>
              )}
            </div>
          </div>

          <div className="setting-actions">
            <button onClick={fetchTracks} className="apply-button">
              Apply & Get New Tracks
            </button>
            <button onClick={toggleSettings} className="cancel-button">
              Close Settings
            </button>
          </div>
        </div>
      )}

      <div className="track-comparison">
        <h2>Choose your favorite track</h2>
        <div className="tracks-container">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="track-card"
              onClick={() => handleTrackSelect(track)}
            >
              <img
                src={track.album?.images?.[0]?.url || "/placeholder-album.png"}
                alt={track.album?.name || "Album"}
                className="album-cover"
              />
              <div className="track-info">
                <h3>{track.name}</h3>
                <p>
                  {track.artists?.map((artist) => artist.name).join(", ") ||
                    "Unknown Artist"}
                </p>
                <div className="track-meta">
                  <span className="release-year">
                    {track.album.release_date?.substring(0, 4)}
                  </span>
                  <span
                    className="popularity"
                    title={`Popularity: ${track.popularity}/100`}
                  >
                    {Array(Math.ceil(track.popularity / 20))
                      .fill("★")
                      .join("")}
                  </span>
                </div>
              </div>
            </div>
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

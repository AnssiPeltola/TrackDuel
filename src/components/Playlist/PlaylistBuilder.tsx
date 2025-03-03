import React, { useEffect, useState } from "react";
import "./PlaylistBuilder.css";

const PlaylistBuilder: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // We'll implement the API calls to fetch genres and tracks later
    const loadInitialData = async () => {
      try {
        // Simulate loading
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error loading data:", error);
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  if (isLoading) {
    return <div className="loading">Loading tracks...</div>;
  }

  return (
    <div className="playlist-builder">
      <h1>TrackDuel</h1>
      <div className="track-comparison">
        <h2>Choose your favorite track</h2>
        <div className="tracks-container">
          <div className="track-card">
            <p>Track 1 coming soon</p>
          </div>
          <div className="track-card">
            <p>Track 2 coming soon</p>
          </div>
        </div>
        <div className="playlist-section">
          <h3>Your Playlist</h3>
          <p>Selected tracks will appear here</p>
        </div>
      </div>
    </div>
  );
};

export default PlaylistBuilder;

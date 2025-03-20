import React, { useEffect, useState } from "react";
import "./Login.css";

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;

    if (!clientId) {
      setError(
        "Spotify Client ID is missing. Check your environment variables."
      );
      return;
    }

    // Required scopes for our application
    const scope = [
      "user-read-private",
      "user-read-email",
      "playlist-modify-public",
      "playlist-modify-private",
    ].join(" ");

    // Generate random state for security
    const state = generateRandomString(16);
    localStorage.setItem("spotify_auth_state", state);

    // Build authorization URL
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri || ""
    )}&scope=${encodeURIComponent(scope)}&response_type=token&state=${state}`;

    window.location.href = authUrl;
  };

  // Helper function to generate random string for state
  const generateRandomString = (length: number): string => {
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let text = "";
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h1>TrackDuel</h1>
        <h2>Discover music through battles, save victories as playlists</h2>

        <div className="steps-container">
          <h3>Three simple steps:</h3>

          <div className="step-cards">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-text">
                <p>Listen to a pair of tracks go head-to-head</p>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-text">
                <p>Vote for your favorite to add it to your collection</p>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-text">
                <p>Discover new music while building your ultimate playlist</p>
              </div>
            </div>
          </div>
        </div>

        <p className="connect-text">
          Connect with your Spotify account to get started
        </p>

        {error && <div className="error-message">{error}</div>}

        <button className="spotify-login-btn" onClick={handleLogin}>
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          Login with Spotify
        </button>
      </div>
    </div>
  );
};

export default Login;

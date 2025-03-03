import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Callback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const accessToken = params.get("access_token");
    const state = params.get("state");
    const storedState = localStorage.getItem("spotify_auth_state");

    if (accessToken) {
      // Validate state to prevent CSRF attacks
      if (state === null || state !== storedState) {
        setError("State mismatch error - possible CSRF attack");
        return;
      }

      // Clear the state from localStorage
      localStorage.removeItem("spotify_auth_state");

      // Store the access token
      localStorage.setItem("spotify_access_token", accessToken);

      // Get expiration time (convert to milliseconds)
      const expiresIn = params.get("expires_in");
      if (expiresIn) {
        const expirationTime = Date.now() + parseInt(expiresIn) * 1000;
        localStorage.setItem(
          "spotify_token_expiration",
          expirationTime.toString()
        );
      }

      // Redirect to the main app
      navigate("/");
    } else {
      setError("Authentication failed - no access token received");
    }
  }, [navigate]);

  if (error) {
    return (
      <div className="callback-error">
        <h2>Authentication Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Return to Login</button>
      </div>
    );
  }

  return (
    <div className="callback-loading">
      <h2>Authenticating with Spotify...</h2>
      <div className="loading-spinner"></div>
    </div>
  );
};

export default Callback;

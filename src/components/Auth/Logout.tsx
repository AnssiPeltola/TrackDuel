import React from "react";
import "../Auth/Login.css";

const Logout: React.FC = () => {
  const handleLogout = () => {
    // Clear all Spotify related tokens
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_token_expiration");
    localStorage.removeItem("spotify_auth_state");

    // Redirect to login page
    window.location.href = "/";
  };

  return (
    <button className="spotify-logout-btn" onClick={handleLogout}>
      Logout
    </button>
  );
};

export default Logout;

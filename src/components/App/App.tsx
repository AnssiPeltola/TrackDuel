import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Login from "../Auth/Login";
import Callback from "../Auth/Callback";
import PlaylistBuilder from "../Playlist/PlaylistBuilder";

// A simple auth check component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isAuthenticated = localStorage.getItem("spotify_access_token") !== null;

  // Check if token is expired
  const tokenExpiration = localStorage.getItem("spotify_token_expiration");
  const isTokenExpired =
    tokenExpiration && parseInt(tokenExpiration) < Date.now();

  if (!isAuthenticated || isTokenExpired) {
    // Clear expired tokens
    if (isTokenExpired) {
      localStorage.removeItem("spotify_access_token");
      localStorage.removeItem("spotify_token_expiration");
    }
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/callback" element={<Callback />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <PlaylistBuilder />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

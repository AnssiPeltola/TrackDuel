import { useState, useEffect } from "react";
import "./VolumeWarning.css";

const VolumeWarning = () => {
  const [isDismissed, setIsDismissed] = useState<boolean>(true);

  useEffect(() => {
    const hasSeenWarning = localStorage.getItem("volumeWarningDismissed");
    setIsDismissed(hasSeenWarning === "true");
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("volumeWarningDismissed", "true");
  };

  if (isDismissed) return null;

  return (
    <div className="volume-warning">
      <div className="warning-content">
        <p className="warning-message">
          ⚠️ The embedded Spotify player starts at full volume! Please lower
          your system volume before playing.
        </p>
        <div className="warning-actions">
          <button
            className="warning-button dismiss-button"
            onClick={handleDismiss}
          >
            Got it, thanks!
          </button>
          {navigator.platform.includes("Win") && (
            <a
              href="ms-settings:sound"
              className="warning-button settings-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Sound Settings
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolumeWarning;

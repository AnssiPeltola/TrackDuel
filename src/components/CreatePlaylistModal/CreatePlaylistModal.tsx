import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./CreatePlaylistModal.css";

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, description: string) => Promise<string>;
  trackCount: number;
  defaultName?: string;
  defaultDescription?: string;
}

type ModalState = "prompt" | "creating" | "success" | "error";

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  trackCount,
  defaultName = "My TrackDuel Playlist",
  defaultDescription = "",
}) => {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState(defaultDescription);
  const [state, setState] = useState<ModalState>("prompt");
  const [playlistUrl, setPlaylistUrl] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(defaultName);
      setDescription(defaultDescription);
      setState("prompt");
      setPlaylistUrl("");
      setErrorMessage("");
    }
  }, [isOpen, defaultName, defaultDescription]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state !== "creating") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setState("creating");
      const playlistUrl = await onConfirm(name, description);
      setPlaylistUrl(playlistUrl);
      setState("success");
    } catch (error) {
      console.error("Error creating playlist:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to create playlist"
      );
      setState("error");
    }
  };

  const handleCopyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);

      // Hide the "copied" message after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="modal-overlay"
      onClick={state !== "creating" ? onClose : undefined}
    >
      <div
        className="modal-content create-playlist-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {state === "prompt" && (
          <>
            <div className="modal-header">
              <h3>Create Spotify Playlist</h3>
              <button className="modal-close-btn" onClick={onClose}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Create a new Spotify playlist with {trackCount} track
                {trackCount !== 1 ? "s" : ""}
              </p>
              <br />

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="playlist-name">Playlist Name</label>
                  <input
                    type="text"
                    id="playlist-name"
                    value={name}
                    readOnly
                    className="readonly-input"
                    maxLength={100}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="playlist-description">
                    Description (optional)
                  </label>
                  <textarea
                    id="playlist-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={275}
                    rows={3}
                    placeholder="Add your personal note here..."
                    className="no-resize"
                  />
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="modal-btn cancel-btn"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="modal-btn confirm-btn">
                    Create Playlist
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {state === "creating" && (
          <div className="modal-body creating-state">
            <div className="spinner"></div>
            <p>Creating your Spotify playlist...</p>
            <p className="small-text">This may take a moment</p>
          </div>
        )}

        {state === "success" && (
          <>
            <div className="modal-header success-header">
              <h3>Playlist Created!</h3>
              <button className="modal-close-btn" onClick={onClose}>
                ×
              </button>
            </div>
            <div className="modal-body success-state">
              <div className="success-icon">✓</div>
              <p>Your playlist "{name}" has been created successfully!</p>

              <div className="playlist-actions">
                <div className="playlist-link-container">
                  <a
                    href={playlistUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="playlist-link"
                  >
                    Open in Spotify
                    <span className="external-link-icon">↗</span>
                  </a>
                </div>

                <div className="share-container">
                  <button
                    className="share-button"
                    onClick={() => handleCopyToClipboard(playlistUrl)}
                    title="Copy playlist link to clipboard"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
                    </svg>
                    Share Playlist
                  </button>
                  {copied && (
                    <span className="copied-tooltip">Link copied!</span>
                  )}
                </div>
              </div>

              <p className="small-text">
                You can find this playlist in your Spotify library
              </p>
              <br />

              <div className="modal-footer">
                <button className="modal-btn confirm-btn" onClick={onClose}>
                  Done
                </button>
              </div>
            </div>
          </>
        )}

        {state === "error" && (
          <>
            <div className="modal-header error-header">
              <h3>Error Creating Playlist</h3>
              <button className="modal-close-btn" onClick={onClose}>
                ×
              </button>
            </div>
            <div className="modal-body error-state">
              <div className="error-icon">!</div>
              <p>Sorry, we couldn't create your playlist.</p>
              <p className="error-message">{errorMessage}</p>

              <div className="modal-footer">
                <button className="modal-btn cancel-btn" onClick={onClose}>
                  Close
                </button>
                <button
                  className="modal-btn retry-btn"
                  onClick={() => setState("prompt")}
                >
                  Try Again
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default CreatePlaylistModal;

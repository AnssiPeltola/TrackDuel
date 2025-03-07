import React from "react";

export const EmbeddedSpotifyPlayer = ({ trackId }: { trackId: string }) => {
  return (
    <iframe
      style={{ borderRadius: "12px", width: "100%", height: "152px" }}
      src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator`}
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    ></iframe>
  );
};

export interface SpotifyUser {
  display_name: string;
  email: string;
  id: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  uri: string;
}

export interface Track {
  id: string;
  name: string;
  preview_url: string | null;
  uri: string;
  duration_ms: number;
  explicit: boolean;
  popularity: number;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
    uri: string;
    release_date: string;
  };
  artists: Array<{
    id: string;
    name: string;
    uri: string;
  }>;
}

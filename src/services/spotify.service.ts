import { Track } from "../types/spotify.types";

// Base URL for Spotify API
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

/**
 * Service for interacting with the Spotify API
 */
class SpotifyService {
  /**
   * Make a request to the Spotify API
   */
  private static async apiRequest<T>(
    endpoint: string,
    method: string = "GET",
    body?: any
  ): Promise<T> {
    // Get the token from localStorage
    const token = localStorage.getItem("spotify_access_token");

    if (!token) {
      throw new Error("No Spotify access token found");
    }

    const url = endpoint.startsWith("http")
      ? endpoint
      : `${SPOTIFY_API_BASE}${endpoint}`;

    console.log(`Making API request to: ${url}`);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (response.status === 401) {
        // Token expired, redirect to login
        localStorage.removeItem("spotify_access_token");
        window.location.href = "/login";
        throw new Error("Spotify access token expired");
      }

      if (!response.ok) {
        // Log more details about the error
        console.error(`API Error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error(`Error details: ${errorText}`);
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  }

  /**
   * Get the current user's profile to test the token
   */
  public static async getCurrentUser() {
    return await this.apiRequest("/me");
  }

  // /**
  //  * Fetch tracks with customizable parameters
  //  */
  // public static async fetchCustomTracks(options: {
  //   yearRange?: [number, number];
  //   popularity?: [number, number];
  //   limit?: number;
  // }): Promise<Track[]> {
  //   try {
  //     // Set defaults
  //     const {
  //       yearRange = [1950, new Date().getFullYear()],
  //       popularity = [0, 100],
  //       limit = 2,
  //     } = options;

  //     // Build search query based on user preferences
  //     let searchQuery = "";

  //     // Add year range if specified
  //     if (yearRange[0] !== 1950 || yearRange[1] !== new Date().getFullYear()) {
  //       searchQuery += `year:${yearRange[0]}-${yearRange[1]} `;
  //     }

  //     const terms = [
  //       "hit",
  //       "popular",
  //       "top",
  //       "best",
  //       "great",
  //       "favorite",
  //       "music",
  //       "song",
  //       "track",
  //       "album",
  //       "artist",
  //       "new",
  //       "discover",
  //       "indie",
  //       "underground",
  //       "emerging",
  //       "fresh",
  //       "hidden gem",
  //       "upcoming",
  //       "trending",
  //       "viral",
  //       "classic",
  //       "legendary",
  //       "nostalgic",
  //       "throwback",
  //       "timeless",
  //       "essential",
  //       "chill",
  //       "relaxing",
  //       "energetic",
  //       "hype",
  //       "dark",
  //       "happy",
  //       "sad",
  //       "uplifting",
  //       "party",
  //       "road trip",
  //       "workout",
  //       "study",
  //       "focus",
  //       "cinematic",
  //       "epic",
  //       "romantic",
  //       "heartbreak",
  //       "80s",
  //       "90s",
  //       "2000s",
  //       "millennium",
  //       "retro",
  //       "vintage",
  //       "underrated",
  //       "deep cut",
  //       "critically acclaimed",
  //       "rock",
  //       "jazz",
  //       "blues",
  //       "electronic",
  //       "synthwave",
  //       "lo-fi",
  //       "reggae",
  //       "classical",
  //       "folk",
  //       "acoustic",
  //       "country",
  //       "hip-hop",
  //       "rap",
  //       "R&B",
  //       "soul",
  //       "funk",
  //       "metal",
  //       "punk",
  //       "disco",
  //       "EDM",
  //       "house",
  //       "techno",
  //       "trance",
  //       "ambient",
  //       "soundtrack",
  //       "Latin",
  //       "K-pop",
  //       "J-pop",
  //       "Bollywood",
  //       "Afrobeat",
  //       "salsa",
  //       "reggaeton",
  //       "bossa nova",
  //       "world music",
  //       "Balkan",
  //       "Nordic",
  //     ];
  //     const randomTerm = terms[Math.floor(Math.random() * terms.length)];
  //     searchQuery += randomTerm;

  //     // If search query is empty, use a default
  //     if (!searchQuery.trim()) {
  //       searchQuery = "music";
  //     }

  //     // Use search API which is more reliable
  //     console.log(`Searching with query: ${searchQuery}`);
  //     const searchEndpoint = `/search?q=${encodeURIComponent(
  //       searchQuery
  //     )}&type=track&limit=${limit * 3}`;
  //     const searchResults = await this.apiRequest<{
  //       tracks: { items: Track[] };
  //     }>(searchEndpoint);

  //     // Filter by popularity if specified
  //     let filteredTracks = searchResults.tracks.items;

  //     if (popularity[0] > 0 || popularity[1] < 100) {
  //       filteredTracks = filteredTracks.filter(
  //         (track) =>
  //           track.popularity >= popularity[0] &&
  //           track.popularity <= popularity[1]
  //       );
  //     }

  //     // Remove duplicate artists
  //     const uniqueArtists = new Set<string>();
  //     filteredTracks = filteredTracks.filter((track) => {
  //       const artistId = track.artists[0]?.id;
  //       if (artistId && !uniqueArtists.has(artistId)) {
  //         uniqueArtists.add(artistId);
  //         return true;
  //       }
  //       return false;
  //     });

  //     // Shuffle results for variety
  //     const shuffled = [...filteredTracks].sort(() => 0.5 - Math.random());
  //     return shuffled.slice(0, limit);
  //   } catch (error) {
  //     console.error("Search API failed:", error);

  //     // Ultimate fallback - fetch any popular tracks
  //     console.log("Falling back to basic search");
  //     const fallbackEndpoint = `/search?q=music&type=track&limit=${
  //       options.limit || 2
  //     }`;
  //     const fallbackResults = await this.apiRequest<{
  //       tracks: { items: Track[] };
  //     }>(fallbackEndpoint);
  //     return fallbackResults.tracks.items.slice(0, options.limit || 2);
  //   }
  // }

  /**
   * Fetches randomized tracks from a Spotify playlist without loading the entire playlist.
   */
  public static async fetchRandomPlaylistTracks(
    playlistId: string,
    limit: number = 10
  ): Promise<Track[]> {
    try {
      // First, get the total number of tracks in the playlist
      const playlistInfo = await this.apiRequest<{ tracks: { total: number } }>(
        `/playlists/${playlistId}`
      );
      const totalTracks = playlistInfo.tracks.total;

      if (totalTracks === 0) {
        throw new Error("Playlist is empty");
      }

      // Generate random offsets to fetch from different parts of the playlist
      const offsets = [];
      const maxOffset = Math.max(0, totalTracks - 50); // Avoid going beyond playlist length

      // Generate enough random offsets to meet our limit
      // We'll request 50 tracks per API call (Spotify's max) and then take what we need
      const numberOfRequests = Math.ceil(limit / 50);
      for (let i = 0; i < numberOfRequests; i++) {
        // Create a random offset that won't exceed the playlist length
        const randomOffset = Math.floor(Math.random() * maxOffset);
        offsets.push(randomOffset);
      }

      // Make parallel requests to different sections of the playlist
      const trackPromises = offsets.map((offset) =>
        this.apiRequest<{ items: { track: Track }[] }>(
          `/playlists/${playlistId}/tracks?offset=${offset}&limit=50`
        )
      );

      const responses = await Promise.all(trackPromises);

      // Collect all tracks from the responses
      let tracks: Track[] = [];
      responses.forEach((response) => {
        tracks = tracks.concat(response.items.map((item) => item.track));
      });

      // Shuffle the collected tracks for extra randomness
      tracks = this.shuffleArray(tracks);

      // Return only the requested number of tracks
      return tracks.slice(0, limit);
    } catch (error) {
      console.error("Error fetching random playlist tracks:", error);
      return [];
    }
  }

  /**
   * Shuffles an array using Fisher-Yates algorithm
   */
  private static shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

export default SpotifyService;

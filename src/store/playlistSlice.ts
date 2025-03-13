import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Track } from "../types/spotify.types";

interface PlaylistState {
  tracks: Track[];
  name: string;
  description: string;
  isSaving: boolean;
  error: string | null;
  savedPlaylistId: string | null;
}

const initialState: PlaylistState = {
  tracks: [],
  name: "My TrackDuel Playlist",
  description: "Created with TrackDuel",
  isSaving: false,
  error: null,
  savedPlaylistId: null,
};

const playlistSlice = createSlice({
  name: "playlist",
  initialState,
  reducers: {
    addTrack: (state, action: PayloadAction<Track>) => {
      // Check if track already exists
      if (!state.tracks.some((track) => track.id === action.payload.id)) {
        state.tracks.push(action.payload);
      }
    },
    removeTrack: (state, action: PayloadAction<string>) => {
      state.tracks = state.tracks.filter(
        (track) => track.id !== action.payload
      );
    },
    clearPlaylist: (state) => {
      state.tracks = [];
    },
    setPlaylistDetails: (
      state,
      action: PayloadAction<{ name?: string; description?: string }>
    ) => {
      if (action.payload.name !== undefined) {
        state.name = action.payload.name;
      }
      if (action.payload.description !== undefined) {
        state.description = action.payload.description;
      }
    },
    savePlaylistRequest: (state) => {
      state.isSaving = true;
      state.error = null;
    },
    savePlaylistSuccess: (state, action: PayloadAction<string>) => {
      state.isSaving = false;
      state.savedPlaylistId = action.payload;
    },
    savePlaylistFailure: (state, action: PayloadAction<string>) => {
      state.isSaving = false;
      state.error = action.payload;
    },
  },
});

export const {
  addTrack,
  removeTrack,
  clearPlaylist,
  setPlaylistDetails,
  savePlaylistRequest,
  savePlaylistSuccess,
  savePlaylistFailure,
} = playlistSlice.actions;

export default playlistSlice.reducer;

import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  orderBy,
  query,
  limit,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "./firebase";

// =====================================================
// SAVE LISTENING HISTORY
// =====================================================

export async function saveListeningHistory(
  userId,
  song
) {
  if (!userId || !song?.trackId) {
    return;
  }

  try {
    const historyRef = collection(
      db,
      "users",
      userId,
      "listeningHistory"
    );

    await addDoc(historyRef, {
      trackId: String(song.trackId),
      trackName: song.trackName || "",
      artistName: song.artistName || "",
      collectionName:
        song.collectionName || "",
      artworkUrl100:
        song.artworkUrl100 || "",
      artworkUrl60:
        song.artworkUrl60 || "",
      previewUrl:
        song.previewUrl || "",
      primaryGenreName:
        song.primaryGenreName || "",
      trackTimeMillis:
        song.trackTimeMillis || 0,
      playedAt: serverTimestamp(),
    });

    console.log(
      "🎧 Listening history saved:",
      song.trackName
    );
  } catch (error) {
    console.error(
      "❌ Failed to save listening history:",
      error
    );
  }
}

// =====================================================
// GET LISTENING HISTORY
// =====================================================

export async function getListeningHistory(
  userId
) {
  if (!userId) {
    return [];
  }

  try {
    const historyRef = collection(
      db,
      "users",
      userId,
      "listeningHistory"
    );

    const historyQuery = query(
      historyRef,
      orderBy("playedAt", "desc"),
      limit(20)
    );

    const snapshot =
      await getDocs(historyQuery);

    const history =
      snapshot.docs.map(
        (document) => ({
          id: document.id,
          ...document.data(),
        })
      );

    console.log(
      "📜 Listening history loaded:",
      history
    );

    return history;
  } catch (error) {
    console.error(
      "❌ Failed to load listening history:",
      error
    );

    return [];
  }
}

// =====================================================
// SAVE LIKED SONG
// =====================================================

export async function saveLikedSong(
  userId,
  song
) {
  if (!userId || !song?.trackId) {
    return;
  }

  try {
    const likedSongRef = doc(
      db,
      "users",
      userId,
      "likedSongs",
      String(song.trackId)
    );

    await setDoc(likedSongRef, {
      trackId: String(song.trackId),
      trackName: song.trackName || "",
      artistName: song.artistName || "",
      collectionName:
        song.collectionName || "",
      artworkUrl100:
        song.artworkUrl100 || "",
      artworkUrl60:
        song.artworkUrl60 || "",
      previewUrl:
        song.previewUrl || "",
      primaryGenreName:
        song.primaryGenreName || "",
      trackTimeMillis:
        song.trackTimeMillis || 0,
      likedAt: serverTimestamp(),
    });

    console.log(
      "❤️ Liked song saved:",
      song.trackName
    );
  } catch (error) {
    console.error(
      "❌ Failed to save liked song:",
      error
    );
  }
}

// =====================================================
// REMOVE LIKED SONG
// =====================================================

export async function removeLikedSong(
  userId,
  trackId
) {
  if (!userId || !trackId) {
    return;
  }

  try {
    const likedSongRef = doc(
      db,
      "users",
      userId,
      "likedSongs",
      String(trackId)
    );

    await deleteDoc(likedSongRef);

    console.log(
      "💔 Liked song removed:",
      trackId
    );
  } catch (error) {
    console.error(
      "❌ Failed to remove liked song:",
      error
    );
  }
}

// =====================================================
// GET LIKED SONGS
// =====================================================

export async function getLikedSongs(
  userId
) {
  if (!userId) {
    return [];
  }

  try {
    const likedSongsRef = collection(
      db,
      "users",
      userId,
      "likedSongs"
    );

    const likedSongsQuery = query(
      likedSongsRef,
      orderBy("likedAt", "desc")
    );

    const snapshot =
      await getDocs(likedSongsQuery);

    const likedSongs =
      snapshot.docs.map(
        (document) => ({
          id: document.id,
          ...document.data(),
        })
      );

    console.log(
      "❤️ Liked songs loaded:",
      likedSongs
    );

    return likedSongs;
  } catch (error) {
    console.error(
      "❌ Failed to load liked songs:",
      error
    );

    return [];
  }
}

// =====================================================
// SAVE PLAYLIST
// =====================================================

export async function savePlaylist(
  userId,
  playlist
) {
  if (
    !userId ||
    !playlist?.id
  ) {
    return;
  }

  try {
    const playlistRef = doc(
      db,
      "users",
      userId,
      "playlists",
      String(playlist.id)
    );

    await setDoc(
      playlistRef,
      {
        id: String(playlist.id),
        name: playlist.name || "My Playlist",
        songs: playlist.songs || [],
        updatedAt:
          serverTimestamp(),
      },
      {
        merge: true,
      }
    );

    console.log(
      "📁 Playlist saved:",
      playlist.name
    );
  } catch (error) {
    console.error(
      "❌ Failed to save playlist:",
      error
    );
  }
}

// =====================================================
// GET PLAYLISTS
// =====================================================

export async function getPlaylists(
  userId
) {
  if (!userId) {
    return [];
  }

  try {
    const playlistsRef =
      collection(
        db,
        "users",
        userId,
        "playlists"
      );

    const playlistsQuery =
      query(
        playlistsRef,
        orderBy(
          "updatedAt",
          "desc"
        )
      );

    const snapshot =
      await getDocs(
        playlistsQuery
      );

    const playlists =
      snapshot.docs.map(
        (document) => ({
          id: document.id,
          ...document.data(),
        })
      );

    console.log(
      "📁 Playlists loaded:",
      playlists
    );

    return playlists;
  } catch (error) {
    console.error(
      "❌ Failed to load playlists:",
      error
    );

    return [];
  }
}

// =====================================================
// DELETE PLAYLIST
// =====================================================

export async function deletePlaylist(
  userId,
  playlistId
) {
  if (
    !userId ||
    !playlistId
  ) {
    return;
  }

  try {
    const playlistRef = doc(
      db,
      "users",
      userId,
      "playlists",
      String(playlistId)
    );

    await deleteDoc(
      playlistRef
    );

    console.log(
      "🗑️ Playlist deleted:",
      playlistId
    );
  } catch (error) {
    console.error(
      "❌ Failed to delete playlist:",
      error
    );
  }
}
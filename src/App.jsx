import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  signInUser,
  listenToAuth,
} from "./firebase/auth";

import {
  saveListeningHistory,
  saveLikedSong,
  removeLikedSong,
  getLikedSongs,
  savePlaylist,
  getPlaylists,
  deletePlaylist as deleteFirebasePlaylist,
  getListeningHistory,
} from "./firebase/musicData";

import {
  getRecommendations,
} from "./recommendation/recommendationEngine";

import {
  X,
  Plus,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import MusicPlayer from "./components/MusicPlayer";
import Toast from "./components/Toast";

function App() {
  // =====================================================
  // FIREBASE USER
  // =====================================================

  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = listenToAuth((firebaseUser) => {
      setUser(firebaseUser);
    });

    signInUser().catch((error) => {
      console.error("MyMusic authentication error:", error);
    });

    return () => unsubscribe();
  }, []);

  // =====================================================
  // AUDIO
  // =====================================================

  const audioRef = useRef(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);

  // =====================================================
  // PLAYER MODES
  // =====================================================

  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off");
  const [playQueue, setPlayQueue] = useState([]);

  // =====================================================
  // NAVIGATION
  // =====================================================

  const [activePage, setActivePage] = useState("home");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);

  const [navigationHistory, setNavigationHistory] = useState([
    {
      page: "home",
      playlistId: null,
      artist: null,
    },
  ]);

  const [navigationIndex, setNavigationIndex] = useState(0);

  const canGoBack = navigationIndex > 0;
  const canGoForward = navigationIndex < navigationHistory.length - 1;

  // =====================================================
  // NAVIGATION
  // =====================================================

  const applyNavigationState = (state) => {
    setActivePage(state.page || "home");
    setSelectedPlaylistId(state.playlistId || null);
    setSelectedArtist(state.artist || null);
  };

  const navigateTo = ({ page = "home", playlistId = null, artist = null }) => {
    const newState = { page, playlistId, artist };

    setNavigationHistory((previous) => {
      const trimmed = previous.slice(0, navigationIndex + 1);
      return [...trimmed, newState];
    });

    setNavigationIndex((previous) => previous + 1);
    applyNavigationState(newState);
  };

  const goBack = () => {
    if (!canGoBack) return;

    const newIndex = navigationIndex - 1;
    const state = navigationHistory[newIndex];

    if (!state) return;

    setNavigationIndex(newIndex);
    applyNavigationState(state);
  };

  const goForward = () => {
    if (!canGoForward) return;

    const newIndex = navigationIndex + 1;
    const state = navigationHistory[newIndex];

    if (!state) return;

    setNavigationIndex(newIndex);
    applyNavigationState(state);
  };

  // =====================================================
  // NAVIGATION ACTIONS
  // =====================================================

  const goHome = () => {
    navigateTo({ page: "home" });
  };

  const goToSearch = () => {
    navigateTo({ page: "search" });
  };

  const goToLibrary = () => {
    navigateTo({ page: "library" });
  };

  const openPlaylist = (playlistId) => {
    navigateTo({
      page: "playlist",
      playlistId,
    });
  };

  const openArtist = (artistName) => {
    navigateTo({
      page: "artist",
      artist: artistName,
    });
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const [searchResults, setSearchResults] = useState([]);

  const handleSearchResults = (results) => {
    setSearchResults(results || []);
  };

  // =====================================================
  // TOAST
  // =====================================================

  const [toast, setToast] = useState({
    visible: false,
    message: "",
  });

  const showToast = (message) => {
    setToast({
      visible: true,
      message,
    });

    setTimeout(() => {
      setToast({
        visible: false,
        message: "",
      });
    }, 2600);
  };

  const closeToast = () => {
    setToast({
      visible: false,
      message: "",
    });
  };

  // =====================================================
  // LIKED SONGS - FIREBASE
  // =====================================================

  const [likedSongs, setLikedSongs] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    async function loadLikedSongs() {
      try {
        const songs = await getLikedSongs(user.uid);
        setLikedSongs(songs || []);
        console.log("❤️ Firebase liked songs loaded:", songs || []);
      } catch (error) {
        console.error("❌ Failed to load Firebase liked songs:", error);
      }
    }

    loadLikedSongs();
  }, [user]);

  // =====================================================
  // LISTENING HISTORY
  // =====================================================

  const [listeningHistory, setListeningHistory] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    async function loadHistory() {
      try {
        const history = await getListeningHistory(user.uid);
        setListeningHistory(history || []);
        console.log("📜 App listening history loaded:", history || []);
      } catch (error) {
        console.error("❌ Failed to load listening history:", error);
      }
    }

    loadHistory();
  }, [user]);

  // =====================================================
  // RECOMMENDATIONS
  // =====================================================

  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  const generateRecommendations = async () => {
    if (!user?.uid) return;

    if (likedSongs.length === 0 && listeningHistory.length === 0) {
      setRecommendations([]);
      return;
    }

    setRecommendationsLoading(true);

    try {
      const result = await getRecommendations(
        likedSongs,
        listeningHistory,
        async (query) => {
          const module = await import("./api/musicApi");
          return module.searchSongs(query);
        }
      );

      setRecommendations(result || []);
      console.log("🎵 App recommendations:", result || []);
    } catch (error) {
      console.error("❌ Recommendation generation failed:", error);
      setRecommendations([]);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.uid) return;
    if (likedSongs.length === 0 && listeningHistory.length === 0) return;

    generateRecommendations();
  }, [user, likedSongs, listeningHistory]);

  // =====================================================
  // PLAYLISTS - FIREBASE
  // =====================================================

  const [playlists, setPlaylists] = useState([]);
  const playlistsLoaded = useRef(false);

  // =====================================================
  // LOAD PLAYLISTS
  // =====================================================

  useEffect(() => {
    if (!user?.uid) return;

    async function loadFirebasePlaylists() {
      try {
        const firebasePlaylists = await getPlaylists(user.uid);

        if (firebasePlaylists.length > 0) {
          setPlaylists(firebasePlaylists);
          playlistsLoaded.current = true;
          console.log("📁 Firebase playlists loaded:", firebasePlaylists);
          return;
        }

        let oldPlaylists = [];

        try {
          const saved = localStorage.getItem("mymusic-playlists");
          if (saved) {
            oldPlaylists = JSON.parse(saved);
          }
        } catch {
          oldPlaylists = [];
        }

        if (!Array.isArray(oldPlaylists) || oldPlaylists.length === 0) {
          oldPlaylists = [
            {
              id: "chill-vibes",
              name: "Chill Vibes",
              songs: [],
            },
            {
              id: "night-drive",
              name: "Night Drive",
              songs: [],
            },
          ];
        }

        setPlaylists(oldPlaylists);
        playlistsLoaded.current = true;

        for (const playlist of oldPlaylists) {
          await savePlaylist(user.uid, playlist);
        }

        console.log("📁 Playlists migrated to Firebase:", oldPlaylists);
      } catch (error) {
        console.error("❌ Failed to load Firebase playlists:", error);

        setPlaylists([
          {
            id: "chill-vibes",
            name: "Chill Vibes",
            songs: [],
          },
          {
            id: "night-drive",
            name: "Night Drive",
            songs: [],
          },
        ]);

        playlistsLoaded.current = true;
      }
    }

    loadFirebasePlaylists();
  }, [user]);

  // =====================================================
  // LOCAL PLAYLIST BACKUP
  // =====================================================

  useEffect(() => {
    if (!playlistsLoaded.current) return;

    localStorage.setItem("mymusic-playlists", JSON.stringify(playlists));
  }, [playlists]);

  // =====================================================
  // PLAYLIST MODAL
  // =====================================================

  const [playlistModal, setPlaylistModal] = useState({
    visible: false,
    mode: "create",
    playlistId: null,
    playlistName: "",
  });

  const [playlistName, setPlaylistName] = useState("");

  // =====================================================
  // CREATE PLAYLIST MODAL
  // =====================================================

  const openCreatePlaylistModal = () => {
    setPlaylistName("");
    setPlaylistModal({
      visible: true,
      mode: "create",
      playlistId: null,
      playlistName: "",
    });
  };

  const closePlaylistModal = () => {
    setPlaylistModal({
      visible: false,
      mode: "create",
      playlistId: null,
      playlistName: "",
    });
    setPlaylistName("");
  };

  // =====================================================
  // CREATE PLAYLIST
  // =====================================================

  const createPlaylist = async () => {
    const name = playlistName.trim();

    if (!name) return;

    if (!user?.uid) {
      showToast("Please wait for Firebase login");
      return;
    }

    const alreadyExists = playlists.some(
      (playlist) => playlist.name.toLowerCase() === name.toLowerCase()
    );

    if (alreadyExists) {
      showToast(`"${name}" already exists`);
      return;
    }

    const newPlaylist = {
      id: `playlist-${Date.now()}`,
      name,
      songs: [],
    };

    setPlaylists((previous) => [...previous, newPlaylist]);
    await savePlaylist(user.uid, newPlaylist);
    closePlaylistModal();

    navigateTo({
      page: "playlist",
      playlistId: newPlaylist.id,
    });

    showToast(`"${name}" created`);
  };

  // =====================================================
  // DELETE PLAYLIST MODAL
  // =====================================================

  const openDeletePlaylistModal = (playlistId) => {
    const playlist = playlists.find((item) => item.id === playlistId);

    if (!playlist) return;

    setPlaylistModal({
      visible: true,
      mode: "delete",
      playlistId,
      playlistName: playlist.name,
    });
  };

  // =====================================================
  // DELETE PLAYLIST
  // =====================================================

  const handleDeletePlaylist = async () => {
    const id = playlistModal.playlistId;
    const playlist = playlists.find((item) => item.id === id);

    if (!user?.uid) {
      showToast("Please wait for Firebase login");
      return;
    }

    await deleteFirebasePlaylist(user.uid, id);

    setPlaylists((previous) => previous.filter((item) => item.id !== id));
    closePlaylistModal();

    navigateTo({ page: "home" });

    if (playlist) {
      showToast(`"${playlist.name}" deleted`);
    }
  };

  // =====================================================
  // LIKE / UNLIKE
  // =====================================================

  const handleToggleLike = async (song) => {
    if (!song) return;

    if (!user?.uid) {
      showToast("Please wait for Firebase login");
      return;
    }

    const alreadyLiked = likedSongs.some(
      (item) => String(item.trackId) === String(song.trackId)
    );

    if (alreadyLiked) {
      setLikedSongs((previous) =>
        previous.filter(
          (item) => String(item.trackId) !== String(song.trackId)
        )
      );

      await removeLikedSong(user.uid, song.trackId);
      showToast(`"${song.trackName}" removed from Liked Songs`);
      return;
    }

    setLikedSongs((previous) => [song, ...previous]);
    await saveLikedSong(user.uid, song);
    showToast(`"${song.trackName}" added to Liked Songs`);
  };

  // =====================================================
  // ADD SONG TO PLAYLIST
  // =====================================================

  const handleAddSongToPlaylist = async (playlistId, song) => {
    if (!song) return;

    if (!user?.uid) {
      showToast("Please wait for Firebase login");
      return;
    }

    const playlist = playlists.find((item) => item.id === playlistId);

    if (!playlist) return;

    const exists = playlist.songs.some(
      (item) => String(item.trackId) === String(song.trackId)
    );

    if (exists) {
      showToast(`"${song.trackName}" is already in ${playlist.name}`);
      return;
    }

    const updatedPlaylist = {
      ...playlist,
      songs: [...playlist.songs, song],
    };

    setPlaylists((previous) =>
      previous.map((item) => (item.id === playlistId ? updatedPlaylist : item))
    );

    await savePlaylist(user.uid, updatedPlaylist);
    showToast(`"${song.trackName}" added to ${playlist.name}`);
  };

  // =====================================================
  // REMOVE SONG FROM PLAYLIST
  // =====================================================

  const handleRemoveSongFromPlaylist = async (playlistId, trackId) => {
    if (!user?.uid) {
      showToast("Please wait for Firebase login");
      return;
    }

    const playlist = playlists.find((item) => item.id === playlistId);

    if (!playlist) return;

    const updatedPlaylist = {
      ...playlist,
      songs: playlist.songs.filter(
        (song) => String(song.trackId) !== String(trackId)
      ),
    };

    setPlaylists((previous) =>
      previous.map((item) => (item.id === playlistId ? updatedPlaylist : item))
    );

    await savePlaylist(user.uid, updatedPlaylist);
    showToast("Song removed from playlist");
  };

  // =====================================================
  // PLAY SONG
  // =====================================================

  const handlePlaySong = (song, queue = []) => {
    if (!song) return;

    if (!song.previewUrl) {
      showToast("Preview not available for this song");
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    let cleanQueue = Array.isArray(queue)
      ? queue.filter((item) => item?.previewUrl)
      : [];

    if (cleanQueue.length === 0) {
      cleanQueue = [song];
    }

    setPlayQueue(cleanQueue);

    const audio = new Audio(song.previewUrl);
    audio.volume = volume;
    audioRef.current = audio;

    setCurrentSong(song);

    if (user?.uid) {
      saveListeningHistory(user.uid, song);
    }

    setCurrentTime(0);
    setDuration(0);

    audio.onloadedmetadata = () => {
      setDuration(audio.duration || 0);
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    audio.onplay = () => {
      setIsPlaying(true);
    };

    audio.onpause = () => {
      setIsPlaying(false);
    };

    audio.onerror = () => {
      setIsPlaying(false);
      showToast("Unable to play this song");
    };

    audio.onended = () => {
      handleSongEnded();
    };

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((error) => {
        console.error("Audio play failed:", error);
        setIsPlaying(false);
        showToast("Unable to play this song");
      });
  };

  // =====================================================
  // SONG ENDED
  // =====================================================

  const handleSongEnded = () => {
    if (!currentSong) return;

    if (repeatMode === "one") {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      return;
    }

    if (playQueue.length === 0) {
      setIsPlaying(false);
      return;
    }

    const currentIndex = playQueue.findIndex(
      (song) => String(song.trackId) === String(currentSong.trackId)
    );

    let nextIndex = currentIndex + 1;

    if (nextIndex >= playQueue.length) {
      if (repeatMode === "all") {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    const nextSong = playQueue[nextIndex];

    if (nextSong) {
      handlePlaySong(nextSong, playQueue);
    }
  };

  // =====================================================
  // NEXT
  // =====================================================

  const handleNext = () => {
    if (!currentSong || playQueue.length === 0) return;

    let currentIndex = playQueue.findIndex(
      (song) => String(song.trackId) === String(currentSong.trackId)
    );

    if (currentIndex < 0) {
      currentIndex = 0;
    }

    let nextIndex = currentIndex + 1;

    if (nextIndex >= playQueue.length) {
      nextIndex = 0;
    }

    if (isShuffle) {
      if (playQueue.length > 1) {
        const possibleIndexes = playQueue
          .map((_, index) => index)
          .filter((index) => index !== currentIndex);

        const randomIndex = Math.floor(
          Math.random() * possibleIndexes.length
        );

        nextIndex = possibleIndexes[randomIndex];
      }
    }

    const nextSong = playQueue[nextIndex];

    if (nextSong) {
      handlePlaySong(nextSong, playQueue);
    }
  };

  // =====================================================
  // PREVIOUS
  // =====================================================

  const handlePrevious = () => {
    if (!currentSong || playQueue.length === 0) return;

    if (currentTime > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const currentIndex = playQueue.findIndex(
      (song) => String(song.trackId) === String(currentSong.trackId)
    );

    let previousIndex = currentIndex - 1;

    if (previousIndex < 0) {
      previousIndex = playQueue.length - 1;
    }

    const previousSong = playQueue[previousIndex];

    if (previousSong) {
      handlePlaySong(previousSong, playQueue);
    }
  };

  // =====================================================
  // PLAY / PAUSE
  // =====================================================

  const handlePlayPause = () => {
    if (!currentSong) return;

    if (!audioRef.current) {
      handlePlaySong(currentSong, playQueue);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error("Play failed:", error);
        });
    }
  };

  // =====================================================
  // SHUFFLE
  // =====================================================

  const toggleShuffle = () => {
    setIsShuffle((previous) => !previous);
    showToast(!isShuffle ? "Shuffle on" : "Shuffle off");
  };

  // =====================================================
  // REPEAT
  // =====================================================

  const toggleRepeat = () => {
    const nextMode =
      repeatMode === "off" ? "all" : repeatMode === "all" ? "one" : "off";

    setRepeatMode(nextMode);

    if (nextMode === "all") {
      showToast("Repeat all");
    } else if (nextMode === "one") {
      showToast("Repeat one");
    } else {
      showToast("Repeat off");
    }
  };

  // =====================================================
  // SEEK
  // =====================================================

  const handleSeek = (value) => {
    if (!audioRef.current) return;

    const safeValue = Math.max(
      0,
      Math.min(Number(value), duration || 0)
    );

    audioRef.current.currentTime = safeValue;
    setCurrentTime(safeValue);
  };

  // =====================================================
  // VOLUME
  // =====================================================

  const handleVolumeChange = (value) => {
    const safeValue = Math.max(0, Math.min(Number(value), 1));

    setVolume(safeValue);

    if (audioRef.current) {
      audioRef.current.volume = safeValue;
    }
  };

  // =====================================================
  // CLEANUP
  // =====================================================

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // =====================================================
  // SELECTED PLAYLIST
  // =====================================================

  const selectedPlaylist =
    playlists.find((playlist) => playlist.id === selectedPlaylistId) || null;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="app">
      <Sidebar
        activePage={activePage}
        onHomeClick={goHome}
        onSearchClick={goToSearch}
        onLikedSongsClick={goToLibrary}
        playlists={playlists}
        selectedPlaylistId={selectedPlaylistId}
        onPlaylistClick={openPlaylist}
        onCreatePlaylist={openCreatePlaylistModal}
      />

      <div className="main-content">
        <Home
          activePage={activePage}
          selectedArtist={selectedArtist}
          onArtistClick={openArtist}
          onBack={goBack}
          onForward={goForward}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          currentSong={currentSong}
          isPlaying={isPlaying}
          onPlaySong={handlePlaySong}
          onSearchResults={handleSearchResults}
          onSearchPage={goToSearch}
          likedSongs={likedSongs}
          onToggleLike={handleToggleLike}
          selectedPlaylist={selectedPlaylist}
          onClosePlaylist={goHome}
          onDeletePlaylist={openDeletePlaylistModal}
          playlists={playlists}
          onAddSongToPlaylist={handleAddSongToPlaylist}
          onRemoveSongFromPlaylist={handleRemoveSongFromPlaylist}
          recommendations={recommendations}
          recommendationsLoading={recommendationsLoading}
        />
      </div>

      <MusicPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        onPlayPause={handlePlayPause}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onShuffle={toggleShuffle}
        onRepeat={toggleRepeat}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
      />

      <Toast
        message={toast.message}
        visible={toast.visible}
        onClose={closeToast}
      />

      {/* =================================================
          PLAYLIST MODAL
          ================================================= */}

      {playlistModal.visible && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePlaylistModal();
            }
          }}
        >
          <div className="playlist-modal">
            <button
              type="button"
              className="modal-close"
              onClick={closePlaylistModal}
            >
              <X size={18} />
            </button>

            {playlistModal.mode === "create" ? (
              <>
                <div className="modal-icon">
                  <Plus size={21} />
                </div>

                <div className="modal-heading">
                  <h2>Create playlist</h2>
                  <p>Give your new playlist a name.</p>
                </div>

                <div className="playlist-input-wrapper">
                  <label>Playlist name</label>
                  <input
                    autoFocus
                    value={playlistName}
                    onChange={(event) => setPlaylistName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        createPlaylist();
                      }
                      if (event.key === "Escape") {
                        closePlaylistModal();
                      }
                    }}
                    placeholder="My playlist"
                    maxLength={50}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="modal-cancel"
                    onClick={closePlaylistModal}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="modal-primary"
                    disabled={!playlistName.trim()}
                    onClick={createPlaylist}
                  >
                    Create
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="delete-modal-icon">
                  <AlertTriangle size={22} />
                </div>

                <div className="modal-heading">
                  <h2>Delete playlist?</h2>
                  <p>
                    "{playlistModal.playlistName}" will be permanently removed.
                  </p>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="modal-cancel"
                    onClick={closePlaylistModal}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="modal-delete"
                    onClick={handleDeletePlaylist}
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
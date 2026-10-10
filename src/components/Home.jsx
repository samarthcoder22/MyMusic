import { useEffect, useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  User,
  Search,
  Play,
  Pause,
  Heart,
  MoreHorizontal,
  Loader,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  searchSongs,
  getNewReleases,
} from "../api/musicApi";

import {
  listenToAuth,
} from "../firebase/auth";

import {
  getListeningHistory,
} from "../firebase/musicData";

import TasteProfile from "./TasteProfile";

import tameImpala from "../assets/tame-impala.jpg";
import lanaDelRey from "../assets/lana-del-rey.jpg";
import justinBieber from "../assets/justin-bieber.jpg";
import billieEilish from "../assets/billie-eilish.jpg";
import theWeeknd from "../assets/the-weeknd.jpg";
import arijitSingh from "../assets/arijit-singh.jpg";
import heroImage from "../assets/hero.png";

// =====================================================
// HELPERS
// =====================================================

function formatDuration(milliseconds) {
  if (!milliseconds) {
    return "0:00";
  }

  const totalSeconds = Math.floor(
    milliseconds / 1000
  );

  const minutes = Math.floor(
    totalSeconds / 60
  );

  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function getSongTitle(song) {
  return (
    song?.trackName ||
    "Unknown song"
  );
}

function getSongArtist(song) {
  return (
    song?.artistName ||
    "Unknown artist"
  );
}

function getSongAlbum(song) {
  return (
    song?.collectionName ||
    "Single"
  );
}

function getSongImage(song) {
  return (
    song?.artworkUrl100 ||
    song?.artworkUrl60 ||
    heroImage
  );
}

function getSongDuration(song) {
  return formatDuration(
    song?.trackTimeMillis
  );
}

// =====================================================
// ARTIST INFORMATION
// =====================================================

const artistInfo = {
  "Tame Impala": {
    image: tameImpala,
    description:
      "Tame Impala is the psychedelic music project of Australian musician Kevin Parker, known for dreamy production, hypnotic melodies and richly layered sounds.",
  },

  "Lana Del Rey": {
    image: lanaDelRey,
    description:
      "Lana Del Rey is an American singer-songwriter known for cinematic music, melancholic melodies and a distinctive vintage-inspired aesthetic.",
  },

  "Justin Bieber": {
    image: justinBieber,
    description:
      "Justin Bieber is a Canadian singer known for pop and R&B hits and his evolving sound across multiple albums and eras.",
  },

  "Billie Eilish": {
    image: billieEilish,
    description:
      "Billie Eilish is an American singer-songwriter known for intimate vocals, atmospheric production and distinctive alternative-pop music.",
  },

  "The Weeknd": {
    image: theWeeknd,
    description:
      "The Weeknd is a Canadian singer-songwriter known for atmospheric R&B, pop influences and major global hits.",
  },

  "Arijit Singh": {
    image: arijitSingh,
    description:
      "Arijit Singh is one of India's most popular playback singers, widely known for expressive vocals, romantic songs and soulful ballads.",
  },
};

// =====================================================
// HOME
// =====================================================

function Home({
  activePage,

  selectedArtist,
  onArtistClick,

  onBack,
  onForward,
  canGoBack,
  canGoForward,

  currentSong,
  isPlaying,
  onPlaySong,

  onSearchResults,
  onSearchPage,

  likedSongs,
  onToggleLike,

  selectedPlaylist,
  onClosePlaylist,
  onDeletePlaylist,

  playlists,
  onAddSongToPlaylist,
  onRemoveSongFromPlaylist,

  // RECOMMENDATIONS
  recommendations = [],
  recommendationsLoading = false,
}) {
  // ===================================================
  // STATE
  // ===================================================

  const [query, setQuery] =
    useState("");

  const [songs, setSongs] =
    useState([]);

  const [loading, setLoading] =
    useState(false);
    const [showProfileMenu, setShowProfileMenu] =
  useState(false);
  useEffect(() => {
  function handleOutsideClick(event) {
    if (
      !event.target.closest(".profile-wrapper")
    ) {
      setShowProfileMenu(false);
    }
  }

  document.addEventListener(
    "mousedown",
    handleOutsideClick
  );

  return () => {
    document.removeEventListener(
      "mousedown",
      handleOutsideClick
    );
  };
}, []);

  const [
    playlistMenuSongId,
    setPlaylistMenuSongId,
  ] = useState(null);

  const [artistSongs, setArtistSongs] =
    useState([]);

  const [artistLoading, setArtistLoading] =
    useState(false);

  const [recentSongs, setRecentSongs] =
    useState([]);
    const [newReleases, setNewReleases] =
  useState([]);

const [newReleasesLoading, setNewReleasesLoading] =
  useState(false);

  // ===================================================
  // ARTISTS
  // ===================================================

  const artists = [
    {
      name: "Tame Impala",
      image: tameImpala,
    },
    {
      name: "Lana Del Rey",
      image: lanaDelRey,
    },
    {
      name: "Justin Bieber",
      image: justinBieber,
    },
    {
      name: "Billie Eilish",
      image: billieEilish,
    },
    {
      name: "The Weeknd",
      image: theWeeknd,
    },
    {
      name: "Arijit Singh",
      image: arijitSingh,
    },
  ];

  // ===================================================
  // LOAD ARTIST SONGS
  // ===================================================

  async function loadArtist(
    artistName
  ) {
    setArtistLoading(true);
    setArtistSongs([]);

    try {
      const results =
        await searchSongs(
          artistName
        );

      setArtistSongs(
        results || []
      );
    } catch (error) {
      console.error(
        "Artist search failed:",
        error
      );

      setArtistSongs([]);
    } finally {
      setArtistLoading(false);
    }
  }

  useEffect(() => {
    if (
      activePage === "artist" &&
      selectedArtist
    ) {
      loadArtist(
        selectedArtist
      );
    }
  }, [
    activePage,
    selectedArtist,
  ]);

  // ===================================================
  // FIREBASE RECENTLY PLAYED
  // ===================================================

  useEffect(() => {
    const unsubscribe =
      listenToAuth(
        async (firebaseUser) => {
          if (!firebaseUser) {
            setRecentSongs([]);
            return;
          }

          try {
            const history =
              await getListeningHistory(
                firebaseUser.uid
              );

            setRecentSongs(
              history || []
            );
          } catch (error) {
            console.error(
              "Failed to load recently played:",
              error
            );

            setRecentSongs([]);
          }
        }
      );

    return () =>
      unsubscribe();
  }, []);

    // ===================================================
  // LOAD NEW RELEASES
  // ===================================================

  useEffect(() => {
    async function loadNewReleases() {
      setNewReleasesLoading(true);

      try {
        const results = await getNewReleases();

        const uniqueSongs = [];
        const seenIds = new Set();

        for (const song of results || []) {
          if (
            song?.trackId &&
            !seenIds.has(song.trackId)
          ) {
            seenIds.add(song.trackId);
            uniqueSongs.push(song);
          }
        }

        setNewReleases(
          uniqueSongs
            .filter((song) => song?.previewUrl)
            .slice(0, 8)
        );
      } catch (error) {
        console.error(
          "Failed to load new releases:",
          error
        );

        setNewReleases([]);
      } finally {
        setNewReleasesLoading(false);
      }
    }

    loadNewReleases();
  }, []);

  // ===================================================
  // SEARCH
  // ===================================================

  async function performSearch(
    searchText
  ) {
    const cleanQuery =
      searchText.trim();

    if (!cleanQuery) {
      setSongs([]);
      onSearchResults([]);
      return;
    }

    setLoading(true);

    try {
      const results =
        await searchSongs(
          cleanQuery
        );

      setSongs(
        results || []
      );

      onSearchResults(
        results || []
      );
    } catch (error) {
  console.error(
    "Search failed:",
    error
  );

  setSongs([]);

  onSearchResults([]);

  alert(
    "Unable to load music right now. Please check your internet connection and try again."
  );

    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    if (!query.trim()) {
      return;
    }

    onSearchPage();
    performSearch(query);
  }

  // ===================================================
  // ARTIST CLICK
  // ===================================================

  function handleArtistClick(
    artistName
  ) {
    setSongs([]);
    setQuery("");

    onArtistClick(
      artistName
    );
  }

  // ===================================================
  // PLAY RECENT SONG
  // ===================================================

  async function playRecentSong(
    songOrArtist,
    songTitle
  ) {
    try {
      if (
        typeof songOrArtist ===
          "object" &&
        songOrArtist?.trackId
      ) {
        onPlaySong(
          songOrArtist,
          [songOrArtist]
        );

        return;
      }

      const results =
        await searchSongs(
          `${songOrArtist} ${songTitle}`
        );

      if (
        !results ||
        results.length === 0
      ) {
        return;
      }

      const exactSong =
        results.find(
          (song) =>
            song.trackName
              ?.toLowerCase()
              .includes(
                songTitle.toLowerCase()
              )
        ) || results[0];

      onPlaySong(
        exactSong,
        results
      );
    } catch (error) {
      console.error(
        "Recent song failed:",
        error
      );
    }
  }

  // ===================================================
  // LIKED CHECK
  // ===================================================

  function isLiked(song) {
    return likedSongs.some(
      (item) =>
        String(
          item.trackId
        ) ===
        String(
          song.trackId
        )
    );
  }

  // ===================================================
  // ADD TO PLAYLIST
  // ===================================================

  function addToPlaylist(
    playlistId,
    song
  ) {
    onAddSongToPlaylist(
      playlistId,
      song
    );

    setPlaylistMenuSongId(
      null
    );
  }

  // ===================================================
  // SONG ROW
  // ===================================================

  function renderSongRow(
    song,
    songQueue
  ) {
    if (!song) {
      return null;
    }

    const liked =
      isLiked(song);

    const playing =
      currentSong?.trackId ===
        song.trackId &&
      isPlaying;

    return (
      <div
        className="search-song"
        key={song.trackId}
      >
        <div className="search-song-cover">
          <img
            src={getSongImage(song)}
            alt={getSongTitle(song)}
          />

          <button
            type="button"
            className="search-play"
            onClick={() =>
              onPlaySong(
                song,
                songQueue
              )
            }
          >
            {playing ? (
              <Pause
                size={16}
                fill="white"
              />
            ) : (
              <Play
                size={16}
                fill="white"
              />
            )}
          </button>
        </div>

        <div className="search-song-info">
          <h3>
            {getSongTitle(song)}
          </h3>

          <p>
            {getSongArtist(song)}
          </p>

          <span>
            {getSongAlbum(song)}
          </span>
        </div>

        <span className="search-duration">
          {getSongDuration(song)}
        </span>

        <button
          type="button"
          className={`search-like ${
            liked ? "liked" : ""
          }`}
          onClick={() =>
            onToggleLike(song)
          }
        >
          <Heart
            size={19}
            fill={
              liked
                ? "currentColor"
                : "none"
            }
          />
        </button>

        <div className="song-playlist-wrapper">
          <button
            type="button"
            className="more-button"
            onClick={() =>
              setPlaylistMenuSongId(
                playlistMenuSongId ===
                  song.trackId
                  ? null
                  : song.trackId
              )
            }
          >
            <MoreHorizontal
              size={19}
            />
          </button>

          {playlistMenuSongId ===
            song.trackId && (
            <div className="playlist-menu">
              <div className="playlist-menu-title">
                Add to playlist
              </div>

              {playlists.length ===
              0 ? (
                <div className="playlist-menu-empty">
                  No playlists yet
                </div>
              ) : (
                playlists.map(
                  (playlist) => (
                    <button
                      type="button"
                      className="playlist-menu-item"
                      key={
                        playlist.id
                      }
                      onClick={() =>
                        addToPlaylist(
                          playlist.id,
                          song
                        )
                      }
                    >
                      <Plus
                        size={15}
                      />

                      <span>
                        {
                          playlist.name
                        }
                      </span>
                    </button>
                  )
                )
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===================================================
  // TOP BAR
  // ===================================================

  function renderTopBar() {
    return (
      <div className="top-bar">
        <div className="navigation-buttons">
          <button
            type="button"
            className={`circle-button ${
              !canGoBack
                ? "navigation-disabled"
                : ""
            }`}
            title="Go back"
            disabled={!canGoBack}
            onClick={onBack}
          >
            <ChevronLeft
              size={20}
            />
          </button>

          <button
            type="button"
            className={`circle-button ${
              !canGoForward
                ? "navigation-disabled"
                : ""
            }`}
            title="Go forward"
            disabled={
              !canGoForward
            }
            onClick={onForward}
          >
            <ChevronRight
              size={20}
            />
          </button>
        </div>

        <div className="search-box">
          <Search size={18} />

          <input
            type="text"
            value={query}
            placeholder="What do you want to play?"
            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }
            onKeyDown={(event) => {
              if (
                event.key ===
                "Enter"
              ) {
                handleSearch();
              }
            }}
          />
        </div>

        <div className="profile-wrapper">

  <button
    type="button"
    className="profile"
    title="Profile"
    onClick={() =>
      setShowProfileMenu(
        (previous) => !previous
      )
    }
  >
    <User size={18} />
  </button>

  {showProfileMenu && (
    <div className="profile-menu">

      <div className="profile-menu-header">

        <div className="profile-menu-avatar">
          <User size={20} />
        </div>

        <div>
          <h3>
            MyMusic User
          </h3>

          <p>
                Your music profile
          </p>
        </div>

      </div>

      <div className="profile-divider" />

      <div className="profile-stat">
        <span>
          ❤️ Liked songs
        </span>

        <strong>
          {likedSongs.length}
        </strong>
      </div>

      <div className="profile-stat">
        <span>
          🎵 Recently played
        </span>

        <strong>
          {recentSongs.length}
        </strong>
      </div>

    </div>
  )}

</div>
      </div>
    );
  }

  // ===================================================
  // ARTIST PAGE
  // ===================================================

  function renderArtistPage() {
    const info =
      artistInfo[
        selectedArtist
      ] || {
        image: heroImage,
        description:
          "Explore music, popular tracks and releases from this artist.",
      };

    const topSongs =
      artistSongs.slice(
        0,
        5
      );

    return (
      <div className="artist-page">
        <section className="artist-hero">
          <button
            type="button"
            className="artist-back-button"
            onClick={onBack}
          >
            <ChevronLeft
              size={18}
            />
            Back
          </button>

          <div className="artist-hero-content">
            <div className="artist-profile-image">
              <img
                src={info.image}
                alt={
                  selectedArtist
                }
              />
            </div>

            <div className="artist-profile-info">
              <span className="artist-verified">
                ARTIST
              </span>

              <h1>
                {selectedArtist}
              </h1>

              <p>
                {info.description}
              </p>
            </div>
          </div>
        </section>

        <section className="content-section artist-songs-section">
          <div className="section-header">
            <div>
              <span className="hero-label">
                MOST POPULAR
              </span>

              <h2>
                Top songs
              </h2>
            </div>
          </div>

          {artistLoading ? (
            <div className="loading">
              <Loader
                size={22}
                className="loading-icon"
              />

              <span>
                Loading artist...
              </span>
            </div>
          ) : topSongs.length ===
            0 ? (
            <div className="empty-state artist-empty-state">

  <div className="artist-empty-icon">
    <Search size={32} />
  </div>

  <h3>
    No songs found
  </h3>

  <p>
    We couldn't find any songs for{" "}
    <strong>{selectedArtist}</strong>.
  </p>

  <button
    type="button"
    className="empty-state-button"
    onClick={onBack}
  >
    <ChevronLeft size={17} />
    Back to artists
  </button>

</div>
          ) : (
            <div className="search-results-list">
              {topSongs.map(
                (song) =>
                  renderSongRow(
                    song,
                    artistSongs
                  )
              )}
            </div>
          )}
        </section>

        {!artistLoading &&
          artistSongs.length >
            0 && (
            <section className="content-section">
              <div className="section-header">
                <div>
                  <span className="hero-label">
                    MUSIC
                  </span>

                  <h2>
                    All songs
                  </h2>
                </div>

                <span className="see-all">
                  {
                    artistSongs.length
                  }{" "}
                  songs
                </span>
              </div>

              <div className="search-results-list">
                {artistSongs.map(
                  (song) =>
                    renderSongRow(
                      song,
                      artistSongs
                    )
                )}
              </div>
            </section>
          )}
      </div>
    );
  }

  // ===================================================
  // LIBRARY
  // ===================================================

  function renderLibrary() {
    return (
      <section className="content-section">
        <div className="section-header">
          <div>
            <span className="hero-label">
              YOUR LIBRARY
            </span>

            <h2>
              Liked Songs
            </h2>
          </div>
        </div>

        {likedSongs.length ===
        0 ? (
          <div className="empty-state liked-empty-state">

  <div className="liked-empty-icon">
    <Heart size={32} />
  </div>

  <h3>
    Your liked songs will live here
  </h3>

  <p>
    Save songs you love by clicking the
    heart button while listening.
  </p>

  <button
    type="button"
    className="empty-state-button"
    onClick={onSearchPage}
  >
    <Search size={17} />
    Find music
  </button>

</div>
        ) : (
          <div className="search-results-list">
            {likedSongs.map(
              (song) =>
                renderSongRow(
                  song,
                  likedSongs
                )
            )}
          </div>
        )}
      </section>
    );
  }

  // ===================================================
  // PLAYLIST
  // ===================================================

  function renderPlaylist() {
    if (!selectedPlaylist) {
      return (
        <div className="empty-state">
          <h3>
            Playlist not found
          </h3>
        </div>
      );
    }

    return (
      <>
        <section className="playlist-detail">
          <div className="playlist-detail-top">
            <button
              type="button"
              className="playlist-back"
              onClick={onBack}
            >
              <ChevronLeft
                size={18}
              />
              Back
            </button>

            <button
              type="button"
              className="playlist-delete"
              onClick={() =>
                onDeletePlaylist(
                  selectedPlaylist.id
                )
              }
            >
              <Trash2 size={17} />
              Delete
            </button>
          </div>

          <div className="playlist-detail-header">
            <div className="playlist-detail-icon">
              <Heart size={34} />
            </div>

            <div>
              <span className="hero-label">
                PLAYLIST
              </span>

              <h1>
                {
                  selectedPlaylist.name
                }
              </h1>

              <p>
                {
                  selectedPlaylist
                    .songs.length
                }{" "}
                songs
              </p>
            </div>
          </div>
        </section>

        <section className="content-section">
          {selectedPlaylist.songs
            .length === 0 ? (
           <div className="empty-state playlist-empty-state">

  <div className="playlist-empty-icon">
    <Plus size={32} />
  </div>

  <h3>
    This playlist is empty
  </h3>

  <p>
    Find songs you love and add them
    to this playlist.
  </p>

  <button
    type="button"
    className="empty-state-button"
    onClick={onSearchPage}
  >
    <Search size={17} />
    Find songs
  </button>

</div>
          ) : (
            <div className="search-results-list">
              {selectedPlaylist.songs.map(
                (song) => {
                  const playing =
                    currentSong?.trackId ===
                      song.trackId &&
                    isPlaying;

                  return (
                    <div
                      className="search-song"
                      key={
                        song.trackId
                      }
                    >
                      <div className="search-song-cover">
                        <img
                          src={getSongImage(
                            song
                          )}
                          alt={getSongTitle(
                            song
                          )}
                        />

                        <button
                          type="button"
                          className="search-play"
                          onClick={() =>
                            onPlaySong(
                              song,
                              selectedPlaylist.songs
                            )
                          }
                        >
                          {playing ? (
                            <Pause
                              size={16}
                              fill="white"
                            />
                          ) : (
                            <Play
                              size={16}
                              fill="white"
                            />
                          )}
                        </button>
                      </div>

                      <div className="search-song-info">
                        <h3>
                          {getSongTitle(
                            song
                          )}
                        </h3>

                        <p>
                          {getSongArtist(
                            song
                          )}
                        </p>

                        <span>
                          {getSongAlbum(
                            song
                          )}
                        </span>
                      </div>

                      <span className="search-duration">
                        {getSongDuration(
                          song
                        )}
                      </span>

                      <button
                        type="button"
                        className="search-like"
                        title="Remove from playlist"
                        onClick={() =>
                          onRemoveSongFromPlaylist(
                            selectedPlaylist.id,
                            song.trackId
                          )
                        }
                      >
                        <X size={19} />
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>
      </>
    );
  }

  // ===================================================
  // SEARCH PAGE
  // ===================================================

  function renderSearchPage() {
    return (
      <section className="content-section search-results-section">
        <div className="section-header">
          <div>
            <span className="hero-label">
              SEARCH
            </span>

            <h2>
              {query
                ? `Results for "${query}"`
                : "Find something to play"}
            </h2>
          </div>

          {songs.length > 0 && (
            <button
              type="button"
              className="see-all"
              onClick={() => {
                setSongs([]);
                setQuery("");
                onSearchResults([]);
              }}
            >
              Clear
            </button>
          )}
        </div>

        {loading && (
          <div className="loading">
            <Loader
              size={22}
              className="loading-icon"
            />

            <span>
              Finding music...
            </span>
          </div>
        )}

        {!loading &&
          songs.length ===
            0 && (
<div className="empty-state search-empty-state">

  <div className="search-empty-icon">
    <Search size={32} />
  </div>

  {query ? (
    <>
      <h3>
        No results found
      </h3>

      <p>
        We couldn't find anything for{" "}
        <strong>"{query}"</strong>.
        Try another artist, song or album.
      </p>
    </>
  ) : (
    <>
      <h3>
        Find your next favorite song
      </h3>

      <p>
        Search for an artist, song or album
        to start listening.
      </p>
    </>
  )}

  <div className="search-suggestions">

    <span>
      Try:
    </span>

    <button
      type="button"
      onClick={() => {
        setQuery("Arijit Singh");
        performSearch("Arijit Singh");
      }}
    >
      Arijit Singh
    </button>

    <button
      type="button"
      onClick={() => {
        setQuery("The Weeknd");
        performSearch("The Weeknd");
      }}
    >
      The Weeknd
    </button>

    <button
      type="button"
      onClick={() => {
        setQuery("Billie Eilish");
        performSearch("Billie Eilish");
      }}
    >
      Billie Eilish
    </button>

  </div>

</div>
          )}

        {!loading &&
          songs.length > 0 && (
            <div className="search-results-list">
              {songs.map(
                (song) =>
                  renderSongRow(
                    song,
                    songs
                  )
              )}
            </div>
          )}
      </section>
    );
  }

  // ===================================================
  // RECOMMENDATIONS
  // ===================================================

  function renderRecommendations() {
    if (
      recommendationsLoading
    ) {
      return (
        <section className="content-section">
          <div className="section-header">
            <div>
              <span className="hero-label">
                FOR YOU
              </span>

              <h2>
                Recommended For You
              </h2>
            </div>
          </div>

          <div className="loading">
            <Loader
              size={22}
              className="loading-icon"
            />

            <span>
              Creating your
              recommendations...
            </span>
          </div>
        </section>
      );
    }

    if (
      !recommendations ||
      recommendations.length ===
        0
    ) {
      return null;
    }

    return (
      <section className="content-section">
        <div className="section-header">
          <div>
            <span className="hero-label">
              BASED ON YOUR TASTE
            </span>

            <h2>
              Recommended For You
            </h2>
          </div>
        </div>

        <div className="release-grid">
          {recommendations
            .slice(0, 5)
            .map((song) => (
              <div
                className="release-card"
                key={
                  song.trackId
                }
              >
                <div className="release-image">
                  <img
                    src={getSongImage(
                      song
                    )}
                    alt={getSongTitle(
                      song
                    )}
                  />

                  <button
                    type="button"
                    className="release-play"
                    onClick={() =>
                      onPlaySong(
                        song,
                        recommendations
                      )
                    }
                  >
                    {currentSong?.trackId ===
                      song.trackId &&
                    isPlaying ? (
                      <Pause
                        size={18}
                        fill="black"
                      />
                    ) : (
                      <Play
                        size={18}
                        fill="black"
                      />
                    )}
                  </button>
                </div>

                <h3>
                  {getSongTitle(
                    song
                  )}
                </h3>

                <p>
                  {getSongArtist(
                    song
                  )}
                </p>
              </div>
            ))}
        </div>
      </section>
    );
  }

  // ===================================================
  // HOME PAGE
  // ===================================================

  function renderHome() {
    return (
      <>
        {/* HERO */}

        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <span className="hero-label">
                YOUR MIX
              </span>

              <h1>
                Late Night
              </h1>

              <p className="hero-meta">
                32 songs · 1 hr 58 min
              </p>

              <p className="hero-description">
                A few favorites for
                the evening.
              </p>

              <div className="hero-actions">
                <button
                  type="button"
                  className="hero-play"
                  onClick={() => {
                    if (
                      currentSong
                    ) {
                      onPlaySong(
                        currentSong,
                        songs
                      );
                    } else {
                      playRecentSong(
                        "The Weeknd",
                        "After Hours"
                      );
                    }
                  }}
                >
                  {currentSong &&
                  isPlaying ? (
                    <Pause
                      size={17}
                      fill="black"
                    />
                  ) : (
                    <Play
                      size={17}
                      fill="black"
                    />
                  )}

                  {currentSong &&
                  isPlaying
                    ? "Pause"
                    : "Play"}
                </button>

                <button
                  type="button"
                  className="hero-like"
                  disabled={
                    !currentSong
                  }
                  onClick={() => {
                    if (
                      currentSong
                    ) {
                      onToggleLike(
                        currentSong
                      );
                    }
                  }}
                >
                  <Heart
                    size={19}
                    fill={
                      currentSong &&
                      isLiked(
                        currentSong
                      )
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>
              </div>
            </div>

            <div className="hero-art">
              <img
                src={heroImage}
                alt="Late Night"
              />
            </div>
          </div>
        </section>

        {/* ARTISTS */}

        <section className="content-section artists-section">
          <div className="section-header">
            <h2>
              Artists
            </h2>

            <button
              type="button"
              className="see-all"
              onClick={
                onSearchPage
              }
            >
              See all
            </button>
          </div>

          <div className="artist-row">
            {artists.map(
              (artist) => (
                <button
                  type="button"
                  className="artist-card"
                  key={
                    artist.name
                  }
                  onClick={() =>
                    handleArtistClick(
                      artist.name
                    )
                  }
                >
                  <div className="artist-image">
                    <img
                      src={
                        artist.image
                      }
                      alt={
                        artist.name
                      }
                    />

                    <div className="artist-overlay">
                      <span className="artist-play">
                        <Play
                          size={18}
                          fill="black"
                        />
                      </span>
                    </div>
                  </div>

                  <p>
                    {
                      artist.name
                    }
                  </p>
                </button>
              )
            )}
          </div>
        </section>

        {/* RECOMMENDED FOR YOU */}

        {renderRecommendations()}

        {/* YOUR MUSIC TASTE */}

        <TasteProfile
          likedSongs={
            likedSongs
          }
          recentSongs={
            recentSongs
          }
        />

        {/* RECENTLY PLAYED */}

        <section className="content-section">
          <div className="section-header">
            <h2>
              Recently played
            </h2>

            <span className="see-all">
              {recentSongs.length >
              0
                ? `${recentSongs.length} recent`
                : "See all"}
            </span>
          </div>

          <div className="recent-list">
            {recentSongs.length ===
            0 ? (
              <div className="empty-state">
                <Play size={30} />

                <h3>
                  No recently played
                  songs
                </h3>

                <p>
                  Play a song and
                  it will appear
                  here automatically.
                </p>
              </div>
            ) : (
              recentSongs
                .slice(0, 5)
                .map(
                  (
                    song,
                    index
                  ) => (
                    <div
                      className="recent-song"
                      key={`${song.trackId}-${song.id || index}`}
                    >
                      <div className="recent-left">
                        <div className="recent-cover">
                          <img
                            src={getSongImage(
                              song
                            )}
                            alt={getSongArtist(
                              song
                            )}
                          />

                          <button
                            type="button"
                            className="small-play"
                            onClick={() =>
                              playRecentSong(
                                song
                              )
                            }
                            title="Play"
                          >
                            {currentSong?.trackId ===
                              song.trackId &&
                            isPlaying ? (
                              <Pause
                                size={
                                  14
                                }
                                fill="white"
                              />
                            ) : (
                              <Play
                                size={
                                  14
                                }
                                fill="white"
                              />
                            )}
                          </button>
                        </div>

                        <div>
                          <h3>
                            {getSongTitle(
                              song
                            )}
                          </h3>

                          <p>
                            {getSongArtist(
                              song
                            )}
                          </p>
                        </div>
                      </div>

                      <span className="song-duration">
                        {getSongDuration(
                          song
                        )}
                      </span>

                      <button
                        type="button"
                        className="more-button"
                        onClick={() =>
                          playRecentSong(
                            song
                          )
                        }
                        title="Play"
                      >
                        <MoreHorizontal
                          size={19}
                        />
                      </button>
                    </div>
                  )
                )
            )}
          </div>
        </section>

                {/* ===================================================
            FRESH THIS WEEK
            =================================================== */}

        <section className="content-section">

          <div className="section-header">

            <div>
              <span className="hero-label">
                DISCOVER
              </span>

              <h2>
                Fresh this week
              </h2>
            </div>

            <button
              type="button"
              className="see-all"
              onClick={onSearchPage}
            >
              See all
            </button>

          </div>

          {newReleasesLoading ? (

            <div className="loading">

              <Loader
                size={22}
                className="loading-icon"
              />

              <span>
                Loading fresh music...
              </span>

            </div>

          ) : newReleases.length === 0 ? (

            <div className="empty-state">

              <Search size={35} />

              <h3>
                No new releases available
              </h3>

              <p>
                Try searching for an artist
                or song instead.
              </p>

            </div>

          ) : (

            <div className="release-grid">

              {newReleases
                .slice(0, 8)
                .map((song) => (

                  <div
                    className="release-card"
                    key={song.trackId}
                  >

                    <div className="release-image">

                      <img
                        src={getSongImage(song)}
                        alt={getSongTitle(song)}
                      />

                      <button
                        type="button"
                        className="release-play"
                        onClick={() =>
                          onPlaySong(
                            song,
                            newReleases
                          )
                        }
                        title="Play song"
                      >

                        <Play
                          size={18}
                          fill="black"
                        />

                      </button>

                    </div>

                    <h3>
                      {getSongTitle(song)}
                    </h3>

                    <p>
                      {getSongArtist(song)}
                    </p>

                  </div>

                ))}

            </div>

          )}

        </section>
      </>
    );
  }

  // ===================================================
  // MAIN RENDER
  // ===================================================

  return (
    <main className="home">
      {renderTopBar()}

      {activePage ===
        "home" &&
        renderHome()}

      {activePage ===
        "artist" &&
        renderArtistPage()}

      {activePage ===
        "search" &&
        renderSearchPage()}

      {activePage ===
        "library" &&
        renderLibrary()}

      {activePage ===
        "playlist" &&
        renderPlaylist()}
    </main>
  );
}

export default Home;
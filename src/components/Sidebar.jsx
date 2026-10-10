import {
  Music2,
  Home,
  Search,
  Library,
  Heart,
  ListMusic,
  Plus,
} from "lucide-react";

function Sidebar({
  activePage,
  onHomeClick,
  onSearchClick,
  onLikedSongsClick,
  playlists,
  selectedPlaylistId,
  onPlaylistClick,
  onCreatePlaylist,
}) {
  return (
    <aside className="sidebar">

      {/* LOGO */}

      <div className="sidebar-logo">
        <div className="logo-icon">
          <Music2 size={23} />
        </div>

        <span>MyMusic</span>
      </div>


      {/* MAIN NAVIGATION */}

      <nav className="sidebar-nav">

        <button
          type="button"
          className={`nav-item ${
            activePage === "home"
              ? "active"
              : ""
          }`}
          onClick={onHomeClick}
        >
          <Home size={20} />
          <span>Home</span>
        </button>


        <button
          type="button"
          className={`nav-item ${
            activePage === "search"
              ? "active"
              : ""
          }`}
          onClick={onSearchClick}
        >
          <Search size={20} />
          <span>Search</span>
        </button>


        <button
          type="button"
          className={`nav-item ${
            activePage === "library"
              ? "active"
              : ""
          }`}
          onClick={onLikedSongsClick}
        >
          <Library size={20} />
          <span>Your Library</span>
        </button>

      </nav>


      {/* PLAYLISTS */}

      <div className="playlist-section">

        <div className="sidebar-section-title">

          <span>
            YOUR PLAYLISTS
          </span>

          <button
            type="button"
            className="create-playlist-button"
            onClick={onCreatePlaylist}
            title="Create playlist"
            aria-label="Create playlist"
          >
            <Plus size={17} />
          </button>

        </div>


        <div className="playlist-list">

          {/* LIKED SONGS */}

          <button
            type="button"
            className={`playlist-item ${
              activePage === "library"
                ? "active"
                : ""
            }`}
            onClick={onLikedSongsClick}
          >
            <Heart
              size={18}
              fill={
                activePage === "library"
                  ? "currentColor"
                  : "none"
              }
            />

            <span>
              Liked Songs
            </span>
          </button>


          {/* USER PLAYLISTS */}

          {playlists.map((playlist) => (
            <button
              type="button"
              key={playlist.id}
              className={`playlist-item ${
                activePage === "playlist" &&
                selectedPlaylistId ===
                  playlist.id
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                onPlaylistClick(
                  playlist.id
                )
              }
            >
              <ListMusic size={18} />

              <span>
                {playlist.name}
              </span>
            </button>
          ))}

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;
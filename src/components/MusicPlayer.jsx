import {
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Volume2,
  VolumeX,
  Music2,
} from "lucide-react";

function formatTime(
  seconds
) {
  if (
    !seconds ||
    Number.isNaN(seconds)
  ) {
    return "0:00";
  }

  const total =
    Math.floor(seconds);

  const minutes =
    Math.floor(total / 60);

  const remaining =
    total % 60;

  return `${minutes}:${remaining
    .toString()
    .padStart(2, "0")}`;
}

function MusicPlayer({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  volume,

  isShuffle,
  repeatMode,

  onPlayPause,
  onPrevious,
  onNext,
  onShuffle,
  onRepeat,
  onSeek,
  onVolumeChange,
}) {
  const title =
    currentSong?.trackName ||
    "Nothing playing";

  const artist =
    currentSong?.artistName ||
    "Choose a song to start";

  const image =
    currentSong?.artworkUrl100 ||
    currentSong?.artworkUrl60;

  const progress =
    duration > 0
      ? (currentTime /
          duration) *
        100
      : 0;

  return (
    <footer className="music-player">

      {/* =================================================
          SONG INFO
          ================================================= */}

      <div className="player-song-info">

        <div className="player-cover">

          {image ? (
            <img
              src={image}
              alt={title}
            />
          ) : (
            <div className="player-cover-placeholder">
              <Music2
                size={21}
              />
            </div>
          )}

        </div>

        <div className="player-song-text">

          <h4>
            {title}
          </h4>

          <p>
            {artist}
          </p>

        </div>

      </div>

      {/* =================================================
          CENTER CONTROLS
          ================================================= */}

      <div className="player-center">

        <div className="player-controls">

          {/* SHUFFLE */}

          <button
            type="button"
            className={
              `player-control ${
                isShuffle
                  ? "player-control-active"
                  : ""
              }`
            }
            title={
              isShuffle
                ? "Shuffle on"
                : "Shuffle off"
            }
            onClick={
              onShuffle
            }
          >
            <Shuffle
              size={18}
            />
          </button>

          {/* PREVIOUS */}

          <button
            type="button"
            className="player-control"
            title="Previous"
            onClick={
              onPrevious
            }
          >
            <SkipBack
              size={19}
              fill="currentColor"
            />
          </button>

          {/* PLAY / PAUSE */}

          <button
            type="button"
            className="player-main-button"
            title={
              isPlaying
                ? "Pause"
                : "Play"
            }
            onClick={
              onPlayPause
            }
          >
            {isPlaying ? (
              <Pause
                size={19}
                fill="currentColor"
              />
            ) : (
              <Play
                size={19}
                fill="currentColor"
              />
            )}
          </button>

          {/* NEXT */}

          <button
            type="button"
            className="player-control"
            title="Next"
            onClick={
              onNext
            }
          >
            <SkipForward
              size={19}
              fill="currentColor"
            />
          </button>

          {/* REPEAT */}

          <button
            type="button"
            className={
              `player-control ${
                repeatMode !==
                "off"
                  ? "player-control-active"
                  : ""
              }`
            }
            title={
              repeatMode ===
              "one"
                ? "Repeat one"
                : repeatMode ===
                  "all"
                ? "Repeat all"
                : "Repeat off"
            }
            onClick={
              onRepeat
            }
          >
            <Repeat
              size={18}
            />

            {repeatMode ===
              "one" && (
              <span className="repeat-one-badge">
                1
              </span>
            )}

          </button>

        </div>

        {/* =================================================
            PROGRESS
            ================================================= */}

        <div className="player-progress-row">

          <span>
            {formatTime(
              currentTime
            )}
          </span>

          <input
            type="range"
            className="player-progress"
            min="0"
            max={
              duration || 0
            }
            step="0.1"
            value={
              Math.min(
                currentTime,
                duration ||
                  0
              )
            }
            onChange={(
              event
            ) =>
              onSeek(
                event.target.value
              )
            }
            disabled={
              !currentSong
            }
          />

          <span>
            {formatTime(
              duration
            )}
          </span>

        </div>

      </div>

      {/* =================================================
          VOLUME
          ================================================= */}

      <div className="player-volume">

        {volume ===
        0 ? (
          <VolumeX
            size={18}
          />
        ) : (
          <Volume2
            size={18}
          />
        )}

        <input
          type="range"
          className="volume-slider"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(
            event
          ) =>
            onVolumeChange(
              event.target.value
            )
          }
        />

      </div>

    </footer>
  );
}

export default MusicPlayer;
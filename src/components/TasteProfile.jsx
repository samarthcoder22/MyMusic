import {
  Music2,
  UserRound,
  Sparkles,
} from "lucide-react";

import {
  buildTasteProfile,
  getTasteSummary,
} from "../recommendation/recommendationEngine";

function TasteProfile({
  likedSongs = [],
  recentSongs = [],
}) {
  const profile =
    buildTasteProfile(
      likedSongs,
      recentSongs
    );

  const summary =
    getTasteSummary(
      likedSongs,
      recentSongs
    );

  const topArtists =
    profile.artists.slice(
      0,
      3
    );

  const topGenres =
    profile.genres.slice(
      0,
      5
    );

  if (
    topArtists.length === 0 &&
    topGenres.length === 0
  ) {
    return null;
  }

  return (
    <section
      style={{
        marginTop: "32px",
        marginBottom: "32px",
      }}
    >
      {/* =============================================
          HEADER
          ============================================= */}

      <div
        style={{
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#b45cff",
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "1.5px",
            marginBottom: "7px",
          }}
        >
          <Sparkles size={15} />

          YOUR MUSIC TASTE
        </div>

        <h2
          style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: "700",
          }}
        >
          Your Taste Profile
        </h2>
      </div>

      {/* =============================================
          SUMMARY
          ============================================= */}

      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(125, 48, 180, 0.22), rgba(45, 20, 65, 0.5))",
          border:
            "1px solid rgba(180, 92, 255, 0.18)",
          borderRadius: "18px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              minWidth: "40px",
              borderRadius: "50%",
              background:
                "rgba(180, 92, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#b45cff",
            }}
          >
            <Music2 size={20} />
          </div>

          <div>
            <h3
              style={{
                margin:
                  "0 0 6px 0",
                fontSize: "15px",
              }}
            >
              What you seem to like
            </h3>

            <p
              style={{
                margin: 0,
                color: "#aaa3b5",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              {summary.message}
            </p>
          </div>
        </div>
      </div>

      {/* =============================================
          TOP ARTISTS
          ============================================= */}

      {topArtists.length >
        0 && (
        <div
          style={{
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <UserRound
              size={17}
            />

            <h3
              style={{
                margin: 0,
                fontSize: "17px",
              }}
            >
              Top Artists
            </h3>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: "12px",
            }}
          >
            {topArtists.map(
              (
                artist,
                index
              ) => (
                <div
                  key={
                    artist.name
                  }
                  style={{
                    background:
                      "#17141c",
                    border:
                      "1px solid rgba(255,255,255,0.06)",
                    borderRadius:
                      "14px",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      color:
                        "#b45cff",
                      fontSize:
                        "12px",
                      fontWeight:
                        "700",
                      marginBottom:
                        "8px",
                    }}
                  >
                    #{index + 1}
                  </div>

                  <div
                    style={{
                      fontSize:
                        "15px",
                      fontWeight:
                        "600",
                      marginBottom:
                        "5px",
                      whiteSpace:
                        "nowrap",
                      overflow:
                        "hidden",
                      textOverflow:
                        "ellipsis",
                    }}
                  >
                    {
                      artist.name
                    }
                  </div>

                  <div
                    style={{
                      color:
                        "#85808d",
                      fontSize:
                        "12px",
                    }}
                  >
                    Taste score:{" "}
                    {
                      artist.score
                    }
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* =============================================
          TOP GENRES
          ============================================= */}

      {topGenres.length >
        0 && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <Music2
              size={17}
            />

            <h3
              style={{
                margin: 0,
                fontSize: "17px",
              }}
            >
              Top Genres
            </h3>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            {topGenres.map(
              (
                genre,
                index
              ) => (
                <div
                  key={
                    genre.name
                  }
                  style={{
                    flex:
                      "1 1 180px",
                    minWidth:
                      "150px",
                    background:
                      "#17141c",
                    border:
                      "1px solid rgba(255,255,255,0.06)",
                    borderRadius:
                      "12px",
                    padding:
                      "14px 16px",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      marginBottom:
                        "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize:
                          "14px",
                        fontWeight:
                          "600",
                      }}
                    >
                      {
                        genre.name
                      }
                    </span>

                    <span
                      style={{
                        color:
                          "#b45cff",
                        fontSize:
                          "12px",
                      }}
                    >
                      {genre.score}
                    </span>
                  </div>

                  <div
                    style={{
                      height:
                        "5px",
                      borderRadius:
                        "10px",
                      background:
                        "#2a2630",
                      overflow:
                        "hidden",
                    }}
                  >
                    <div
                      style={{
                        height:
                          "100%",
                        width: `${Math.min(
                          100,
                          genre.score *
                            4
                        )}%`,
                        background:
                          "linear-gradient(90deg, #8f35d9, #c56cff)",
                        borderRadius:
                          "10px",
                      }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default TasteProfile;
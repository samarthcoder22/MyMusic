// =====================================================
// MYMUSIC - SMART RECOMMENDATION ENGINE
// =====================================================
//
// Content-based + weighted personalization.
//
// Uses:
// ❤️ Liked songs
// 🎧 Listening history
// 👤 Favorite artists
// 🎵 Favorite genres
// 🔁 Listening frequency
// 🆕 New/unheard songs
//
// The engine:
// 1. Builds a user taste profile
// 2. Searches for candidate songs
// 3. Removes songs already known
// 4. Scores every candidate
// 5. Adds diversity
// 6. Returns the best recommendations
// =====================================================


// =====================================================
// BUILD USER TASTE PROFILE
// =====================================================

export function buildTasteProfile(
  likedSongs = [],
  recentSongs = []
) {
  const artistScores = {};
  const genreScores = {};

  const artistPlayCount = {};
  const genrePlayCount = {};

  // -----------------------------------------------------
  // LIKED SONGS
  // -----------------------------------------------------

  likedSongs.forEach((song) => {
    if (!song) {
      return;
    }

    const artist =
      song.artistName?.trim();

    const genre =
      song.primaryGenreName?.trim();

    if (artist) {
      artistScores[artist] =
        (artistScores[artist] || 0) +
        10;
    }

    if (genre) {
      genreScores[genre] =
        (genreScores[genre] || 0) +
        10;
    }
  });

  // -----------------------------------------------------
  // LISTENING HISTORY
  // -----------------------------------------------------

  recentSongs.forEach((song) => {
    if (!song) {
      return;
    }

    const artist =
      song.artistName?.trim();

    const genre =
      song.primaryGenreName?.trim();

    // Artist frequency
    if (artist) {
      artistPlayCount[artist] =
        (artistPlayCount[artist] || 0) +
        1;

      artistScores[artist] =
        (artistScores[artist] || 0) +
        3;
    }

    // Genre frequency
    if (genre) {
      genrePlayCount[genre] =
        (genrePlayCount[genre] || 0) +
        1;

      genreScores[genre] =
        (genreScores[genre] || 0) +
        3;
    }
  });

  // -----------------------------------------------------
  // SORT ARTISTS
  // -----------------------------------------------------

  const topArtists =
    Object.entries(
      artistScores
    )
      .sort(
        (a, b) =>
          b[1] - a[1]
      )
      .slice(0, 10)
      .map(
        ([name, score]) => ({
          name,
          score,
          playCount:
            artistPlayCount[
              name
            ] || 0,
        })
      );

  // -----------------------------------------------------
  // SORT GENRES
  // -----------------------------------------------------

  const topGenres =
    Object.entries(
      genreScores
    )
      .sort(
        (a, b) =>
          b[1] - a[1]
      )
      .slice(0, 10)
      .map(
        ([name, score]) => ({
          name,
          score,
          playCount:
            genrePlayCount[
              name
            ] || 0,
        })
      );

  // -----------------------------------------------------
  // MOST PLAYED ARTISTS
  // -----------------------------------------------------

  const mostPlayedArtists =
    Object.entries(
      artistPlayCount
    )
      .sort(
        (a, b) =>
          b[1] - a[1]
      )
      .slice(0, 5)
      .map(
        ([name, count]) => ({
          name,
          count,
        })
      );

  // -----------------------------------------------------
  // MOST PLAYED GENRES
  // -----------------------------------------------------

  const mostPlayedGenres =
    Object.entries(
      genrePlayCount
    )
      .sort(
        (a, b) =>
          b[1] - a[1]
      )
      .slice(0, 5)
      .map(
        ([name, count]) => ({
          name,
          count,
        })
      );

  return {
    artists:
      topArtists,

    genres:
      topGenres,

    mostPlayedArtists,

    mostPlayedGenres,
  };
}


// =====================================================
// NORMALIZE TEXT
// =====================================================

function normalizeText(
  value
) {
  return (
    value
      ?.trim()
      .toLowerCase() || ""
  );
}


// =====================================================
// SCORE A SONG
// =====================================================

export function scoreSong(
  song,
  tasteProfile,
  likedSongs = [],
  recentSongs = []
) {
  if (
    !song ||
    !tasteProfile
  ) {
    return 0;
  }

  let score = 0;

  const artist =
    normalizeText(
      song.artistName
    );

  const genre =
    normalizeText(
      song.primaryGenreName
    );

  // ===================================================
  // 1. ARTIST MATCH
  // ===================================================

  tasteProfile.artists.forEach(
    (favoriteArtist, index) => {
      const favorite =
        normalizeText(
          favoriteArtist.name
        );

      if (
        artist ===
        favorite
      ) {
        const artistScore =
          Math.max(
            20,
            60 -
              index * 6
          );

        score +=
          artistScore;
      }
    }
  );

  // ===================================================
  // 2. GENRE MATCH
  // ===================================================

  tasteProfile.genres.forEach(
    (favoriteGenre, index) => {
      const favorite =
        normalizeText(
          favoriteGenre.name
        );

      if (
        genre ===
        favorite
      ) {
        const genreScore =
          Math.max(
            8,
            30 -
              index * 4
          );

        score +=
          genreScore;
      }
    }
  );

  // ===================================================
  // 3. LIKED ARTIST BONUS
  // ===================================================

  const likedArtist =
    likedSongs.some(
      (likedSong) =>
        normalizeText(
          likedSong?.artistName
        ) === artist
    );

  if (likedArtist) {
    score += 40;
  }

  // ===================================================
  // 4. FREQUENTLY PLAYED ARTIST BONUS
  // ===================================================

  const artistPlayCount =
    recentSongs.filter(
      (recentSong) =>
        normalizeText(
          recentSong?.artistName
        ) === artist
    ).length;

  if (
    artistPlayCount >= 5
  ) {
    score += 30;
  } else if (
    artistPlayCount >= 3
  ) {
    score += 20;
  } else if (
    artistPlayCount >= 2
  ) {
    score += 10;
  }

  // ===================================================
  // 5. FREQUENTLY PLAYED GENRE BONUS
  // ===================================================

  const genrePlayCount =
    recentSongs.filter(
      (recentSong) =>
        normalizeText(
          recentSong?.primaryGenreName
        ) === genre
    ).length;

  if (
    genrePlayCount >= 5
  ) {
    score += 20;
  } else if (
    genrePlayCount >= 3
  ) {
    score += 12;
  } else if (
    genrePlayCount >= 2
  ) {
    score += 6;
  }

  // ===================================================
  // 6. NEW SONG BONUS
  // ===================================================

  const hasBeenLiked =
    likedSongs.some(
      (likedSong) =>
        String(
          likedSong?.trackId
        ) ===
        String(
          song.trackId
        )
    );

  const hasBeenPlayed =
    recentSongs.some(
      (recentSong) =>
        String(
          recentSong?.trackId
        ) ===
        String(
          song.trackId
        )
    );

  if (
    !hasBeenLiked &&
    !hasBeenPlayed
  ) {
    score += 10;
  }

  // ===================================================
  // 7. POPULARITY SIGNAL
  // ===================================================

  // iTunes provides track popularity
  // indirectly through collection
  // and artist metadata, but not
  // a universal popularity score.
  //
  // We therefore avoid inventing
  // popularity data.
  //
  // Candidate ranking remains
  // based on user preference.

  return score;
}


// =====================================================
// REMOVE DUPLICATES
// =====================================================

function removeDuplicates(
  songs
) {
  return Array.from(
    new Map(
      songs
        .filter(
          (song) =>
            song?.trackId
        )
        .map(
          (song) => [
            String(
              song.trackId
            ),
            song,
          ]
        )
    ).values()
  );
}


// =====================================================
// GET KNOWN SONG IDS
// =====================================================

function getKnownSongIds(
  likedSongs,
  recentSongs
) {
  return new Set(
    [
      ...likedSongs,
      ...recentSongs,
    ]
      .filter(
        (song) =>
          song?.trackId
      )
      .map(
        (song) =>
          String(
            song.trackId
          )
      )
  );
}


// =====================================================
// SEARCH CANDIDATES
// =====================================================

async function getCandidateSongs(
  tasteProfile,
  searchSongs
) {
  const searchTerms = [];

  // -----------------------------------------------------
  // TOP ARTISTS
  // -----------------------------------------------------

  tasteProfile.artists
    .slice(0, 5)
    .forEach(
      (artist) => {
        if (
          artist.name &&
          !searchTerms.includes(
            artist.name
          )
        ) {
          searchTerms.push(
            artist.name
          );
        }
      }
    );

  // -----------------------------------------------------
  // TOP GENRES
  // -----------------------------------------------------

  tasteProfile.genres
    .slice(0, 3)
    .forEach(
      (genre) => {
        if (
          genre.name &&
          !searchTerms.includes(
            genre.name
          )
        ) {
          searchTerms.push(
            genre.name
          );
        }
      }
    );

  // -----------------------------------------------------
  // SEARCH
  // -----------------------------------------------------

  const results =
    await Promise.all(
      searchTerms.map(
        async (term) => {
          try {
            return (
              (await searchSongs(
                term
              )) || []
            );
          } catch (error) {
            console.error(
              `Recommendation search failed for "${term}":`,
              error
            );

            return [];
          }
        }
      )
    );

  return removeDuplicates(
    results.flat()
  );
}


// =====================================================
// ADD DIVERSITY
// =====================================================

function diversifyRecommendations(
  scoredSongs,
  maximum = 10
) {
  const selected = [];

  const artistCounts =
    {};

  // -----------------------------------------------------
  // FIRST PASS
  // Prefer different artists.
  // -----------------------------------------------------

  for (
    const song of scoredSongs
  ) {
    if (
      selected.length >=
      maximum
    ) {
      break;
    }

    const artist =
      normalizeText(
        song.artistName
      );

    const count =
      artistCounts[
        artist
      ] || 0;

    // First pass allows
    // maximum 2 songs per artist.
    if (count >= 2) {
      continue;
    }

    selected.push(
      song
    );

    artistCounts[
      artist
    ] = count + 1;
  }

  // -----------------------------------------------------
  // SECOND PASS
  // Fill remaining slots.
  // -----------------------------------------------------

  if (
    selected.length <
    maximum
  ) {
    for (
      const song of scoredSongs
    ) {
      if (
        selected.length >=
        maximum
      ) {
        break;
      }

      const alreadyAdded =
        selected.some(
          (item) =>
            String(
              item.trackId
            ) ===
            String(
              song.trackId
            )
        );

      if (
        alreadyAdded
      ) {
        continue;
      }

      selected.push(
        song
      );
    }
  }

  return selected;
}


// =====================================================
// GET RECOMMENDATIONS
// =====================================================

export async function getRecommendations(
  likedSongs = [],
  recentSongs = [],
  searchSongs
) {
  if (
    typeof searchSongs !==
    "function"
  ) {
    return [];
  }

  // ===================================================
  // BUILD PROFILE
  // ===================================================

  const tasteProfile =
    buildTasteProfile(
      likedSongs,
      recentSongs
    );

  console.log(
    "🧠 Smart MyMusic taste profile:",
    tasteProfile
  );

  // ===================================================
  // CHECK DATA
  // ===================================================

  if (
    tasteProfile.artists
      .length === 0 &&
    tasteProfile.genres
      .length === 0
  ) {
    console.log(
      "🧠 Not enough data for recommendations."
    );

    return [];
  }

  // ===================================================
  // GET CANDIDATES
  // ===================================================

  const candidates =
    await getCandidateSongs(
      tasteProfile,
      searchSongs
    );

  console.log(
    "🎵 Candidate songs:",
    candidates.length
  );

  // ===================================================
  // KNOWN SONGS
  // ===================================================

  const knownSongIds =
    getKnownSongIds(
      likedSongs,
      recentSongs
    );

  // ===================================================
  // REMOVE KNOWN SONGS
  // ===================================================

  const newCandidates =
    candidates.filter(
      (song) =>
        !knownSongIds.has(
          String(
            song.trackId
          )
        )
    );

  // ===================================================
  // SCORE
  // ===================================================

  const scoredSongs =
    newCandidates.map(
      (song) => ({
        ...song,

        recommendationScore:
          scoreSong(
            song,
            tasteProfile,
            likedSongs,
            recentSongs
          ),
      })
    );

  // ===================================================
  // SORT
  // ===================================================

  scoredSongs.sort(
    (a, b) =>
      b.recommendationScore -
      a.recommendationScore
  );

  console.log(
    "📊 Top scored songs:",
    scoredSongs.slice(
      0,
      10
    )
  );

  // ===================================================
  // DIVERSIFY
  // ===================================================

  const recommendations =
    diversifyRecommendations(
      scoredSongs,
      10
    );

  // ===================================================
  // FINAL RESULT
  // ===================================================

  console.log(
    "🎯 Final personalized recommendations:",
    recommendations
  );

  return recommendations;
}


// =====================================================
// TASTE SUMMARY
// =====================================================

export function getTasteSummary(
  likedSongs = [],
  recentSongs = []
) {
  const profile =
    buildTasteProfile(
      likedSongs,
      recentSongs
    );

  const artists =
    profile.artists
      .slice(0, 3)
      .map(
        (artist) =>
          artist.name
      );

  const genres =
    profile.genres
      .slice(0, 3)
      .map(
        (genre) =>
          genre.name
      );

  let message =
    "Keep listening to build your music profile.";

  if (
    artists.length > 0
  ) {
    message =
      `You seem to enjoy ${artists.join(
        ", "
      )}`;

    if (
      genres.length > 0
    ) {
      message +=
        ` and ${genres.join(
          ", "
        )} music.`;
    } else {
      message += ".";
    }
  }

  return {
    artists,
    genres,
    message,
  };
}